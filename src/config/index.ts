import { RequiredConfigError } from './errors'
import { DevInfraConfig } from './types'

// just a little function to throw error
const validateConfig = () => {
  const requiredParams = ['NPM_TOKEN', 'GH_ACCESS_TOKEN', 'GH_ORG_NAME']
  requiredParams.forEach((param) => {
    if (!process.env[param]) {
      throw new RequiredConfigError(param)
    }
  })
}

export const config = (): DevInfraConfig => {
  validateConfig()
  return {
    npm: {
      // force unwrap some of the params as we know they are dynamically checked above
      // but TS is unable to evaluate that they were checked, just be sure to not miss-type them 🙈
      token: process.env.NPM_TOKEN!,
      // as it is not a secret this can be hard coded to your npm scope
      // just change it
      scope: 'jigglytech',
    },
    github: {
      token: process.env.GH_ACCESS_TOKEN!,
      org: process.env.GH_ORG_NAME!,
    },
    templates: {
      directory: 'templates',
    },
  }
}
