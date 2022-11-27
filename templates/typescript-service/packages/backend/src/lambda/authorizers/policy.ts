// The methodArn specifies exactly which function should be
// allowed ou denied access. You could use "*" to allow access
// to any of your functions, though it is always better to keep
// security tight.
export const buildPolicy = (effect: string, methodArn: string) => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: methodArn,
      },
    ],
  }
}
