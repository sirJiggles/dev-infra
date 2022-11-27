import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning'
import { S3Object } from '@cdktf/provider-aws/lib/s3-object'
import { AssetType, TerraformAsset } from 'cdktf'
import { Construct } from 'constructs'
import * as path from 'path'
import { envConfig } from '../config'
import { resourceName } from '../resources/names'
import { CodeBucket } from './types'

// here we make the assets in a bucket that the lambdas will use
// for now it is based on the guides, but maybe there is a better way to do
// it later if the bundle gets too big?
// simply put though it is probably easier for our few lambdas to just use
// the same bundle for now, so we make it once, upload it and use it. bam
export const uploadLambdaCodeToBucket = (scope: Construct): CodeBucket => {
  const asset = new TerraformAsset(scope, 'lambda-asset', {
    path: path.resolve(__dirname, envConfig().lambda.codePath),
    type: AssetType.ARCHIVE,
  })

  // bucket for the code
  const bucket = new S3Bucket(scope, 'lambda-code', {
    bucket: resourceName('lambda-code'),
  })

  // versioning needs to be on to get the lambda to update its version of the source code
  const bucketVersioning = new S3BucketVersioningA(scope, 'bucket-versioning', {
    bucket: bucket.bucket,
    versioningConfiguration: {
      status: 'Enabled',
    },
  })

  // Upload Lambda zip file to newly created S3 bucket
  const archive = new S3Object(scope, 'lambda-archive', {
    bucket: bucket.bucket,
    key: asset.fileName,
    source: asset.path, // returns a posix path
  })

  return { bucket, asset, archive, bucketVersioning }
}
