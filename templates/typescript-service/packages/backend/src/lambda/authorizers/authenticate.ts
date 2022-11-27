// This file should allow you to authenticate using any JWT system
// like auth 0 from the back end
// have a look at how the auth 0 authorizer does it
import * as jwt from 'jsonwebtoken'
import * as jwksClient from 'jwks-rsa'
import * as util from 'util'
import { JWTAuthConfig } from './types'

// Check the Token is valid with Auth0
export const authenticate = async (
  token: string,
  { audience, issuer, jwksUri }: JWTAuthConfig
) => {
  const decoded = jwt.decode(token, { complete: true })

  if (
    !decoded ||
    typeof decoded === 'string' ||
    !decoded.header ||
    !decoded.header.kid
  ) {
    throw new Error('invalid token')
  }

  const client = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri
  })

  const key = await util.promisify(client.getSigningKey)(decoded.header.kid)
  if (!key) {
    throw new Error('could not get public key')
  }

  const signingKey = key.getPublicKey()

  const verifiedJWT = await jwt.verify(token, signingKey, { audience, issuer })

  if (
    !verifiedJWT ||
    typeof verifiedJWT === 'string' ||
    !isVerifiedJWT(verifiedJWT)
  ) {
    throw new Error('could not verify JWT')
  }

  return decoded.payload
}

interface VerifiedJWT {
  sub: string
}

function isVerifiedJWT(
  toBeDetermined: VerifiedJWT | any
): toBeDetermined is VerifiedJWT {
  return (toBeDetermined as VerifiedJWT).sub !== undefined
}
