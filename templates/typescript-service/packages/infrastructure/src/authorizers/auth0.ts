import { ApiGatewayAuthorizer } from '@cdktf/provider-aws/lib/api-gateway-authorizer'
import { ApiGatewayRestApi } from '@cdktf/provider-aws/lib/api-gateway-rest-api'
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'
import { invocationRolePolicy } from './policy'
import { invocationRole } from './roles'

export const auth0Authorizer = (
  scope: Construct,
  restApi: ApiGatewayRestApi,
  lambda: LambdaFunction
) => {
  const name = 'auth0-authorizer'

  const role = invocationRole(scope, name)
  invocationRolePolicy(scope, role, lambda, name)

  const authorizer = new ApiGatewayAuthorizer(scope, name, {
    name: resourceName(name),
    restApiId: restApi.id,
    authorizerUri: lambda.invokeArn,
    authorizerCredentials: role.arn,
  })

  return { authorizer }
}
