import { config } from './index'

// something we can pull apart in the tests
const validConfig = {
  NPM_TOKEN: 'some token',
  GH_ACCESS_TOKEN: 'some token',
  GH_ORG_NAME: 'some org name',
}
describe('config tests', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should require git hub access token to be set', () => {
    process.env = { ...process.env, ...validConfig }
    delete process.env.GH_ACCESS_TOKEN
    expect(() => config()).toThrowError(
      'required config param missing: GH_ACCESS_TOKEN'
    )
  })

  it('should require npm access token to be set', () => {
    process.env = { ...process.env, ...validConfig }
    delete process.env.NPM_TOKEN
    expect(() => config()).toThrowError(
      'required config param missing: NPM_TOKEN'
    )
  })

  it('should require github org name to be set', () => {
    process.env = { ...process.env, ...validConfig }
    delete process.env.GH_ORG_NAME
    expect(() => config()).toThrowError(
      'required config param missing: GH_ORG_NAME'
    )
  })
})
