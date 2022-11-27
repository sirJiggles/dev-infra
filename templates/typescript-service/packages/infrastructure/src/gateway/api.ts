import { ApiGatewayBasePathMapping } from '@cdktf/provider-aws/lib/api-gateway-base-path-mapping'
import { ApiGatewayDeployment } from '@cdktf/provider-aws/lib/api-gateway-deployment'
import { ApiGatewayDomainName } from '@cdktf/provider-aws/lib/api-gateway-domain-name'
import { ApiGatewayGatewayResponse } from '@cdktf/provider-aws/lib/api-gateway-gateway-response'
import { ApiGatewayRestApi } from '@cdktf/provider-aws/lib/api-gateway-rest-api'
import { ApiGatewayStage } from '@cdktf/provider-aws/lib/api-gateway-stage'
import { Construct } from 'constructs'
import { auth0Authorizer } from '../authorizers/auth0'

import { Definitions } from '../lambda/types'
import { resourceName } from '../resources/names'
import { generateRoutes } from './generate-routes'
import { routeDefinitions } from './routes'

export const api = ({
  scope,
  lambdas,
  gatewayDomain
}: {
  scope: Construct
  lambdas: Definitions
  gatewayDomain: ApiGatewayDomainName
}) => {
  const name = 'rest-api'

  const restApi = new ApiGatewayRestApi(scope, name, {
    name: resourceName(name)
  })

  const { authorizer } = auth0Authorizer(
    scope,
    restApi,
    lambdas.auth0Authorizer
  )

  // this took HOURS to figure out ... :/
  new ApiGatewayGatewayResponse(scope, `${name}-4xx-response`, {
    responseType: 'DEFAULT_4XX',
    restApiId: restApi.id,
    responseParameters: {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Methods': "'OPTIONS'"
    }
  })

  const routes = routeDefinitions(lambdas)

  const { methods, integrations, resources, responses } = generateRoutes({
    scope,
    routes,
    restApi,
    name,
    authorizer
  })

  const deployment = new ApiGatewayDeployment(scope, `${name}-deployment`, {
    restApiId: restApi.id,
    // try to work out when to trigger if the API changed 🤞
    triggers: {
      redeployment: String(new Date().getMilliseconds())
    },
    lifecycle: {
      createBeforeDestroy: true
    },
    dependsOn: [...methods, ...integrations, ...resources, ...responses]
  })
  const stage = new ApiGatewayStage(scope, `${name}-stage`, {
    deploymentId: deployment.id,
    restApiId: restApi.id,
    // as we have a stack per env we might not even need to make a stage, we need to look
    // at it later
    stageName: 'default',
    xrayTracingEnabled: true,
    dependsOn: [deployment]
  })

  new ApiGatewayBasePathMapping(scope, `${name}-base-path`, {
    apiId: restApi.id,
    domainName: gatewayDomain.domainName,
    stageName: 'default',
    dependsOn: [stage, gatewayDomain]
  })
  return { restApi }
}
