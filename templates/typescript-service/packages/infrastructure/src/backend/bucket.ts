import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { S3BucketAcl } from '@cdktf/provider-aws/lib/s3-bucket-acl'
import { S3BucketServerSideEncryptionConfigurationA } from '@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration'
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'

export const stateFileBucket = (scope: Construct) => {
  const name = 'state-bucket'

  const bucket = new S3Bucket(scope, name, {
    bucket: resourceName(name),
    // need to manually remove it, to be sure it does not get removed by mistake
    lifecycle: {
      // might make this a config for non dev stacks, might be a pain in the but
      preventDestroy: true,
    },
  })

  const encryption = new S3BucketServerSideEncryptionConfigurationA(
    scope,
    `${name}-encryption`,
    {
      bucket: bucket.bucket,
      rule: [
        {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'AES256',
          },
        },
      ],
    }
  )

  // versioning needs to be on to get the lambda to update its version of the source code
  const versioning = new S3BucketVersioningA(scope, `${name}-versioning`, {
    bucket: bucket.bucket,
    versioningConfiguration: {
      status: 'Enabled',
    },
  })

  const acl = new S3BucketAcl(scope, `${name}-acl`, {
    bucket: bucket.bucket,
    acl: 'private',
  })

  return { bucket, encryption, acl, versioning }
}
