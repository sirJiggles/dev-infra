/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ServiceInfrastructureConfig } from './types'
import { RequiredConfigError } from './errors'
import { requiredEnvVars } from './required'

// just a little function to throw error
const validateConfig = () => {
  requiredEnvVars.forEach((param) => {
    if (!process.env[param]) {
      throw new RequiredConfigError(param)
    }
  })
}

export const envConfig = (): ServiceInfrastructureConfig => {
  validateConfig()
  return {
    stackName: process.env.STACK_NAME!,
    // if these really change in the future we can move
    // then but it will be a fair bit of work to move them out
    // into npm packages over the net, possible, just not worth it right now
    lambda: {
      codePath: '../../../backend/dist'
    },
    // it has a default but you can override it
    region: process.env.REGION || 'eu-central-1',
    account: process.env.ACCOUNT!,
    domainZoneId: process.env.DOMAIN_ZONE_ID!,
    certificateArn: process.env.CERTIFICATE_ARN!,
    domain: process.env.DOMAIN!,
    auth0: {
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!
    },
    sentry: {
      dsn: process.env.SENTRY_DSN!
    },
    lambdaEnvVar: process.env.LAMBDA_ENV_VAR!
  }
}
