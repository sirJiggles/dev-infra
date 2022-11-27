import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { sampleLambda } from '../../lambda/sample-lambda'
import { components } from '@scope/service-api-types'

// this is how you can use the types to type cast your api payloads!
// also use it for doing things like checking get params etc
// and if you publish the package you can even use it on the front end!
type Payload = components['schemas']['SamplePayload']

import { passBody } from './body'
import { lambdaResponse } from './response'

function isSamplePayload(payload: Payload | unknown): payload is Payload {
  return (payload as Payload).zid !== undefined
}

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return lambdaResponse(400, { err: 'payload is required' })
  }

  let payload: Payload
  try {
    payload = passBody(event.body)
  } catch {
    return lambdaResponse(400, {
      err: 'could not pass payload body from event',
      event
    })
  }

  if (!isSamplePayload(payload)) {
    return lambdaResponse(400, {
      err: 'payload is invalid',
      context: event.requestContext
    })
  }

  if (payload.id === '123') {
    return lambdaResponse(401, { err: 'you should not have access' })
  }

  try {
    await sampleLambda(payload)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return lambdaResponse(500, {
      err: err.message,
      context: event.requestContext
    })
  }

  return lambdaResponse(200, {
    message: 'stored the db contents'
  })
}
