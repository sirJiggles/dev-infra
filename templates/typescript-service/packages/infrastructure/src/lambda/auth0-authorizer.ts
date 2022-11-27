import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { envConfig } from '../config'
import { resourceName } from '../resources/names'
import { addLoggingPolicy, addXRayWritePolicy } from './policies'

import { executionRole } from './roles'
import { LambdaDefinitionConfig } from './types'

export const defineAuth0Authorizer = ({
  scope,
  codeBucket
}: LambdaDefinitionConfig) => {
  const { bucket, asset, archive } = codeBucket
  const { auth0 } = envConfig()

  const name = 'auth0-authorizer-lambda'

  const role = executionRole(scope, name)
  addLoggingPolicy(scope, role, name)
  addXRayWritePolicy(scope, role, name)

  return new LambdaFunction(scope, name, {
    functionName: resourceName(name),
    role: role.arn,
    handler: 'src/aws/lambda/auth-0-authorizer.handler',
    runtime: 'nodejs16.x',
    s3Bucket: bucket.bucket,
    s3Key: asset.fileName,
    timeout: 10,
    // Xray tracing for this lambda
    tracingConfig: {
      mode: 'Active'
    },
    // this is needed so we know to update the lambda when the archive changes
    s3ObjectVersion: archive.versionId,
    dependsOn: [codeBucket.bucket],
    environment: {
      variables: {
        AUTH0_DOMAIN: auth0.domain
      }
    }
  })
}
