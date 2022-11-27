// Be sure when testing these your region in your credentials file is eu-central-1
// else it will not find the table
const lambdaLocal = require('lambda-local')
const path = require('path')
require('dotenv').config()

const jsonPayload = {
  requestContext: {
    authorizer: { principalId: 'authenticatedID' }
  }
}

lambdaLocal
  .execute({
    event: jsonPayload,
    environment: {
      LAMBDA_ENV_VAR: process.env.LAMBDA_ENV_VAR
    },
    lambdaPath: path.join(__dirname, '../dist/src/aws/lambda/sample-lambda.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'staging',
    timeoutMs: 10000
  })
  .then(function (done) {
    console.log(done)
  })
  .catch(function (err) {
    console.log(err)
  })
