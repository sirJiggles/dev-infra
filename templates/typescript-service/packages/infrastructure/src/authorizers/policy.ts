import { IamRole } from '@cdktf/provider-aws/lib/iam-role'
import { IamRolePolicy } from '@cdktf/provider-aws/lib/iam-role-policy'
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function'
import { Construct } from 'constructs'

export const invocationRolePolicy = (
  scope: Construct,
  role: IamRole,
  authorizer: LambdaFunction,
  namePostfix: string
) => {
  const name = `invocation-role-policy-${namePostfix}`
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'lambda:InvokeFunction',
        Effect: 'Allow',
        Resource: authorizer.arn,
      },
    ],
  }
  new IamRolePolicy(scope, name, {
    name,
    policy: JSON.stringify(policy),
    role: role.id,
  })
}
