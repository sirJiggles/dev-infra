export type DevInfraConfig = {
  npm: {
    token: string
    scope?: string
  }
  github: {
    token: string
    org: string
  }
  templates: {
    directory: string
  }
}
