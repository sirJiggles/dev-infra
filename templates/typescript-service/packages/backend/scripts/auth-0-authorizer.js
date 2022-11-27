// Be sure when testing these your region in your credentials file is eu-central-1
// else it will not find the table

// I find the best way to test this is to simply
// login to the UI and look at the network for what token gives you after login
// then paste it in a file called token.json int his folder.
// it will also save you from committing accidentally as it is ignored
const token = require('./token.json')

const lambdaLocal = require('lambda-local')
const path = require('path')
require('dotenv').config()

const jsonPayload = {
  authorizationToken: `Bearer ${token.access_token}`,
  type: 'TOKEN',
  methodArn: 'arn:1234'
}

lambdaLocal
  .execute({
    event: jsonPayload,
    environment: { AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '' },
    lambdaPath: path.join(
      __dirname,
      '../dist/src/aws/lambda/auth-0-authorizer.js'
    ),
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
