import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy'
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning'
import { S3Object } from '@cdktf/provider-aws/lib/s3-object'
import { Construct } from 'constructs'
import * as path from 'path'

import { envConfig } from '../config'
import { resourceName } from '../resources/names'
import { readFileSync } from 'fs'

export const defineOpenApi = (scope: Construct) => {
  const name = 'open-api-bucket'
  const { stackName, domain } = envConfig()

  // bucket for the front end
  const bucket = new S3Bucket(scope, name, {
    bucket: resourceName(`${name}-bucket`),
    // XXX this throws a warning but cdktf has not updated yet to support what they recommend
    // when they do it will be something like this
    // indexDocument: {
    //   suffix: 'index.html'
    // }
    website: {
      indexDocument: 'index.html'
    }
  })

  new S3BucketPolicy(scope, `${name}-policy`, {
    bucket: bucket.bucket,
    dependsOn: [bucket],
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `${bucket.arn}/*`
        }
      ]
    })
  })

  new S3BucketVersioningA(scope, `${name}-versioning`, {
    bucket: bucket.bucket,
    versioningConfiguration: {
      status: 'Enabled'
    }
  })

  let indexFileContents = readFileSync(
    path.resolve(__dirname, '../../../api-types/src/index.html'),
    { encoding: 'utf-8' }
  )
  let ymlFileContents = readFileSync(
    path.resolve(__dirname, '../../../api-types/src/schema.yml'),
    {
      encoding: 'utf-8'
    }
  )

  const apiUrl =
    stackName === 'staging' || stackName === 'production'
      ? `https://api.${domain}`
      : `https://api-${stackName}.${domain}`

  ymlFileContents = ymlFileContents.replace('API_URL', apiUrl)
  indexFileContents = indexFileContents.replace(
    'http://localhost:3010/schema',
    `http://${bucket.websiteEndpoint}/api.yml`
  )

  // index html file for open api
  new S3Object(scope, `${name}-index`, {
    key: 'index.html',
    bucket: bucket.bucket,
    contentType: 'text/html',
    content: indexFileContents
  })

  // add the yaml file
  new S3Object(scope, `${name}-yml`, {
    key: 'api.yml',
    bucket: bucket.bucket,
    content: ymlFileContents
  })

  return { bucket }
}
