import { envConfig } from '../../config'
import { captureException, initSentry } from '../sentry'
import { components } from '@scope/service-api-types'

type Payload = components['schemas']['SamplePayload']

export const sampleLambda = async (payload: Payload) => {
  initSentry()
  // handy way of interacting with env vars without scattering all
  // that shitty process env stuff all over the place
  // makes it easier to have centralized configs later on too
  const { sample } = envConfig()

  if (!sample.value) {
    await captureException(
      'call to sample lambda made with no required env var!, this goes to sentry'
    )
    throw new Error('sample lambda should have env vars it needs')
  }

  console.log('This is where you would put the body of your code')
  console.log('you called me with ', JSON.stringify(payload))
}
