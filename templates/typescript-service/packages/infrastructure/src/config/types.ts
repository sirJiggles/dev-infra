export type ServiceInfrastructureConfig = {
  stackName: string
  region: string
  lambda: {
    codePath: string
  }
  account: string
  domainZoneId: string
  certificateArn: string
  domain: string
  auth0: {
    domain: string
    clientId: string
    clientSecret: string
  }
  sentry: {
    dsn: string
  }
  lambdaEnvVar: string
}

export type InfraStackConfig = ServiceInfrastructureConfig & {
  bucket: string
  table: string
}
