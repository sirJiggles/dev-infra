import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { envConfig } from '../config'
import { resourceName } from '../resources/names'
import { addLoggingPolicy, addXRayWritePolicy } from './policies'

import { executionRole } from './roles'
import { LambdaDefinitionConfig } from './types'

export const defineSampleLambda = ({
  scope,
  codeBucket
}: LambdaDefinitionConfig) => {
  const { bucket, asset, archive } = codeBucket
  const { sentry, lambdaEnvVar } = envConfig()

  const name = 'sample-lambda'

  const role = executionRole(scope, name)
  addLoggingPolicy(scope, role, name)
  addXRayWritePolicy(scope, role, name)

  return new LambdaFunction(scope, name, {
    functionName: resourceName(name),
    role: role.arn,
    handler: 'src/aws/lambda/sample-lambda.handler',
    runtime: 'nodejs16.x',
    s3Bucket: bucket.bucket,
    s3Key: asset.fileName,
    timeout: 10,
    // this is needed so we know to update the lambda when the archive changes
    s3ObjectVersion: archive.versionId,
    dependsOn: [codeBucket.bucket],
    // Xray tracing for this lambda
    tracingConfig: {
      mode: 'Active'
    },
    environment: {
      variables: {
        LAMBDA_ENV_VAR: lambdaEnvVar,
        SENTRY_DSN: sentry.dsn
      }
    }
  })
}
