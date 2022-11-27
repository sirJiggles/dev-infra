import { IamRole } from '@cdktf/provider-aws/lib/iam-role'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'

export const invocationRole = (scope: Construct, authorizerName: string) => {
  const name = `${authorizerName}-invocation`
  const invocationRolePolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'apigateway.amazonaws.com',
        },
        Effect: 'Allow',
        Sid: '',
      },
    ],
  }
  const role = new IamRole(scope, name, {
    assumeRolePolicy: JSON.stringify(invocationRolePolicy),
    name: resourceName(name),
  })

  return role
}
