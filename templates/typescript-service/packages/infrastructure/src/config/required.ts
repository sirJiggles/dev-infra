// just the env vars that are needed to run the infra
export const requiredEnvVars = [
  'CERTIFICATE_ARN',
  'STACK_NAME',
  'ACCOUNT',
  'DOMAIN_ZONE_ID',
  'DOMAIN',
  'AUTH0_DOMAIN',
  // sentry is here just as good practice feel free to make optional for dev stacks
  'SENTRY_DSN'
]
