import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning'
import { S3Object } from '@cdktf/provider-aws/lib/s3-object'
import { TerraformAsset } from 'cdktf'
import { Construct } from 'constructs'

export type LambdaDefinitionConfig = {
  scope: Construct
  codeBucket: {
    bucket: S3Bucket
    asset: TerraformAsset
    archive: S3Object
  }
}

export type Definitions = {
  auth0Authorizer: LambdaFunction
  sampleLambda: LambdaFunction
}

export type CodeBucket = {
  bucket: S3Bucket
  asset: TerraformAsset
  archive: S3Object
  bucketVersioning: S3BucketVersioningA
}
