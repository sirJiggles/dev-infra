import { envConfig } from './index'
import { requiredEnvVars } from './required'

// something we can pull apart in the tests
const validConfig: Record<string, string> = {}
requiredEnvVars.forEach((envVar) => (validConfig[envVar] = 'some value'))

describe('config tests', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  requiredEnvVars.forEach((envVar) => {
    it(`should require ${envVar} to be set`, () => {
      process.env = { ...process.env, ...validConfig }
      delete process.env[envVar]
      expect(() => envConfig()).toThrowError(
        `required config param missing: ${envVar}`
      )
    })
  })
})
