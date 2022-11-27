import {
  APIGatewayAuthorizerResultContext,
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent
} from 'aws-lambda'
import { envConfig } from '../../config'

import { authenticate } from '../../lambda/authorizers/authenticate'
import { buildPolicy } from '../../lambda/authorizers/policy'
import { getToken } from '../../lambda/authorizers/token'
import { JWTAuthConfig } from '../../lambda/authorizers/types'

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: APIGatewayAuthorizerResultContext
) => {
  const {
    auth0: { domain: auth0Domain }
  } = envConfig()
  try {
    // if we do other domains later we can think about configuring them
    // I am fairly sure it is ok to have this open in source control
    // you still need to actually log in to validate it, and we only
    // have one auth 0 tenant right now
    const config: JWTAuthConfig = {
      audience: `https://${auth0Domain}/api/v2/`,
      issuer: `https://${auth0Domain}/`,
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`
    }

    const token = getToken(event)

    // the result of this is a decoded token you might want to inspect
    // for setting the principle id!
    await authenticate(token, config)

    const result: APIGatewayAuthorizerResult = {
      // try get the zid from our custom claim on the token
      principalId: 'some_id_you_get_from_token',
      policyDocument: buildPolicy('Allow', '*'),
      context
    }
    return result
  } catch (err) {
    // Tells API Gateway to return a 401 Unauthorized response
    throw new Error('Unauthorized')
  }
}
