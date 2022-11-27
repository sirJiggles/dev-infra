export type ServiceConfig = {
  sample: {
    value: string
  }
  auth0: {
    domain: string
    clientId: string
    clientSecret: string
  }
  aws: {
    region: string
  }
  domain: string
  sentry: {
    dsn: string
  }
  stack: string
}
