import { ApiGatewayIntegration } from '@cdktf/provider-aws/lib/api-gateway-integration'
import { ApiGatewayIntegrationResponse } from '@cdktf/provider-aws/lib/api-gateway-integration-response'
import { ApiGatewayMethod } from '@cdktf/provider-aws/lib/api-gateway-method'
import { ApiGatewayMethodResponse } from '@cdktf/provider-aws/lib/api-gateway-method-response'
import { ApiGatewayResource } from '@cdktf/provider-aws/lib/api-gateway-resource'
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission'
import { envConfig } from '../config'
import { RouteGenerationConfig } from './types'

export const generateRoutes = ({
  name,
  restApi,
  routes,
  parentResource,
  scope,
  authorizer,
  originDomain = '*'
}: RouteGenerationConfig) => {
  const { region, account } = envConfig()
  // keep a list of all things made so we can depend on them later on
  const methods: ApiGatewayMethod[] = []
  const integrations: ApiGatewayIntegration[] = []
  const resources: ApiGatewayResource[] = []
  const responses: ApiGatewayMethodResponse[] = []

  routes.forEach((route) => {
    // determine auth for the lambda
    const auth =
      route.authorization !== 'NONE' && authorizer
        ? {
            authorization: 'CUSTOM',
            authorizerId: authorizer.id
          }
        : {
            authorization: 'NONE'
          }

    // first connect up the lambda
    const resource = new ApiGatewayResource(
      scope,
      `${name}-resource-${route.name}`,
      {
        parentId: parentResource ? parentResource.id : restApi.rootResourceId,
        pathPart: route.pathParam ? `{${route.path}}` : route.path,
        restApiId: restApi.id
      }
    )

    resources.push(resource)

    const method = new ApiGatewayMethod(scope, `${name}-method-${route.name}`, {
      ...auth,
      httpMethod: route.method,
      resourceId: resource.id,
      restApiId: restApi.id,
      dependsOn: [restApi],
      requestParameters: route.pathParam
        ? {
            // true means it is required for this route
            [`method.request.path.${route.path}`]: true
          }
        : undefined
    })

    methods.push(method)

    // connect the method to the lambda
    const methodIntegration = new ApiGatewayIntegration(
      scope,
      `${name}-integration-${route.name}`,
      {
        httpMethod: method.httpMethod,
        resourceId: resource.id,
        restApiId: restApi.id,
        integrationHttpMethod: 'POST',
        type: 'AWS_PROXY',
        uri: route.lambda.invokeArn,
        dependsOn: [method, restApi, resource],
        requestParameters: route.pathParam
          ? {
              [`integration.request.path.${route.path}`]: `method.request.path.${route.path}`
            }
          : undefined
      }
    )

    integrations.push(methodIntegration)

    // allow the api end point to run the lambda
    new LambdaPermission(scope, `${name}-permission-${route.name}`, {
      statementId: 'AllowExecutionFromAPIGateway',
      action: 'lambda:InvokeFunction',
      principal: 'apigateway.amazonaws.com',
      functionName: route.lambda.functionName,
      // http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
      sourceArn: `arn:aws:execute-api:${region}:${account}:${restApi.id}/*/${method.httpMethod}${resource.path}`
    })

    // Add cors to the end point
    const optionsMethod = new ApiGatewayMethod(
      scope,
      `${name}-opt-method-${route.name}`,
      {
        authorization: 'NONE',
        httpMethod: 'OPTIONS',
        resourceId: resource.id,
        restApiId: restApi.id,
        dependsOn: [restApi]
      }
    )

    methods.push(optionsMethod)

    const optionsResponse = new ApiGatewayMethodResponse(
      scope,
      `${name}-opt-response-${route.name}`,
      {
        httpMethod: optionsMethod.httpMethod,
        statusCode: '200',
        responseModels: {
          'application/json': 'Empty'
        },
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true
        },
        resourceId: resource.id,
        restApiId: restApi.id,
        dependsOn: [restApi, optionsMethod]
      }
    )

    responses.push(optionsResponse)

    const optionsIntegrations = new ApiGatewayIntegration(
      scope,
      `${name}-opts-integration-${route.name}`,
      {
        httpMethod: optionsMethod.httpMethod,
        resourceId: resource.id,
        restApiId: restApi.id,
        requestTemplates: {
          'application/json': '{"statusCode": 200}'
        },
        type: 'MOCK',
        dependsOn: [optionsMethod]
      }
    )

    integrations.push(optionsIntegrations)

    new ApiGatewayIntegrationResponse(
      scope,
      `${name}-opts-integration-response-${route.name}`,
      {
        httpMethod: optionsMethod.httpMethod,
        statusCode: optionsResponse.statusCode,
        resourceId: resource.id,
        restApiId: restApi.id,
        dependsOn: [restApi, resource, optionsMethod],
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers':
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods':
            "'GET,OPTIONS,POST,PUT'",
          'method.response.header.Access-Control-Allow-Origin': `'${originDomain}'`
        }
      }
    )

    // if this route has sub routes, process them and push them to the created items
    if (route.routes) {
      const subRoutes = generateRoutes({
        name,
        restApi,
        routes: route.routes,
        scope,
        authorizer,
        parentResource: resource
      })

      // push the nested route resources so we get them all at the top
      integrations.concat(subRoutes.integrations)
      methods.concat(subRoutes.methods)
      responses.concat(subRoutes.responses)
      resources.concat(subRoutes.resources)
    }
  })

  return {
    methods,
    resources,
    responses,
    integrations
  }
}
