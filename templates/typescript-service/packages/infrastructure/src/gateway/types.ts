import { ApiGatewayAuthorizer } from '@cdktf/provider-aws/lib/api-gateway-authorizer'
import { ApiGatewayResource } from '@cdktf/provider-aws/lib/api-gateway-resource'
import { ApiGatewayRestApi } from '@cdktf/provider-aws/lib/api-gateway-rest-api'
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { Construct } from 'constructs'

// some kinda dsl that makes it easier for us to make an api
type Method = 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT'

export type Route = {
  name: string
  path: string
  pathParam?: boolean
  method: Method
  lambda: LambdaFunction
  authorization: 'NONE' | 'custom'
  // a nested list of optional routes, so we can have sub routes in the API
  // bare in mind you can only go one level deep right now due to the path of the api permissions
  // to run the lambda
  routes?: Route[]
}

export type RouteGenerationConfig = {
  scope: Construct
  routes: Route[]
  restApi: ApiGatewayRestApi
  name: string
  authorizer?: ApiGatewayAuthorizer
  originDomain?: string
  // nested routes need a parent id,
  // this is only set when doing recursion in generate-routes
  parentResource?: ApiGatewayResource
}
