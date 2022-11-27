import * as Sentry from '@sentry/node'
import '@sentry/tracing'

import { envConfig } from '../../config'

export const initSentry = () => {
  const { sentry, stack } = envConfig()
  Sentry.init({
    dsn: sentry.dsn,
    environment: stack === 'production' ? 'production' : 'staging',
    tracesSampleRate: 0.2
  })
}

export const captureException = async (e: any) => {
  Sentry.captureException(e)
  await Sentry.flush(1000)
}
