import { APIGatewayAuthorizerEvent } from 'aws-lambda'

export const getToken = (event: APIGatewayAuthorizerEvent): string => {
  if (!event.type || event.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"')
  }

  const tokenString = event.authorizationToken
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set')
  }

  const match = tokenString.match(/^Bearer (.*)$/)
  if (!match) {
    throw new Error(
      `Invalid Authorization token - ${tokenString} does not match "Bearer .*"`
    )
  }
  return match[1]
}
