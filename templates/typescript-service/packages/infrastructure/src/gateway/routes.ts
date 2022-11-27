import { Definitions } from '../lambda/types'
import { Route } from './types'

export const routeDefinitions = (lambdas: Definitions): Route[] => {
  // here you can add all the routes to the API
  // as you need to, but we only support lambdas right now
  // on the end points
  return [
    {
      name: 'sampleRoute',
      path: 'sample',
      method: 'POST',
      lambda: lambdas.sampleLambda,
      // this means we will use the auth0 authorizer
      authorization: 'custom'
    }
  ]
}
