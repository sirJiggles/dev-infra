import { Construct } from 'constructs'
import { defineAuth0Authorizer } from './auth0-authorizer'
import { uploadLambdaCodeToBucket } from './code-bundler'
import { defineSampleLambda } from './sample-lambda'
import { CodeBucket, Definitions } from './types'

export const defineCodeBucket = (scope: Construct) => {
  return uploadLambdaCodeToBucket(scope)
}

export const defineLambdas = ({
  scope,
  codeBucket
}: {
  scope: Construct
  codeBucket: CodeBucket
}): Definitions => {
  return {
    sampleLambda: defineSampleLambda({ scope, codeBucket }),
    auth0Authorizer: defineAuth0Authorizer({ scope, codeBucket })
  }
}
