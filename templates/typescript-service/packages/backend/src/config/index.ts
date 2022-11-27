import { ServiceConfig } from './types'

export const envConfig = (): ServiceConfig => {
  // not all lambdas need all env vars so we do NOT throw
  // when not set, but lambdas do write to logs.
  return {
    sample: {
      value: process.env.LAMBDA_ENV_VAR || ''
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN || '',
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || ''
    },
    aws: {
      region: 'eu-central-1'
    },
    domain: process.env.DOMAIN || '',
    sentry: {
      dsn: process.env.SENTRY_DSN || ''
    },
    stack: process.env.STACK_NAME || ''
  }
}
