export const lambdaResponse = (statusCode: number, body: any) => ({
  statusCode,
  body: JSON.stringify(body),
  // needed to allow cors in API gateway when using lambdas
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  },
})
