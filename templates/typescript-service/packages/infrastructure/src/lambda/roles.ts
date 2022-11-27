import { IamRole } from '@cdktf/provider-aws/lib/iam-role'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'

export const executionRole = (scope: Construct, lambdaName: string) => {
  const name = `${lambdaName}-execution-role`
  const lambdaRolePolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        Effect: 'Allow',
        Sid: '',
      },
    ],
  }
  const role = new IamRole(scope, name, {
    assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
    name: resourceName(name),
  })

  return role
}
