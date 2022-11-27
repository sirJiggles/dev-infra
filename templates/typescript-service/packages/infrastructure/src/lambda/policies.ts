import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy'
import { IamRole } from '@cdktf/provider-aws/lib/iam-role'
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'

// so we can re-use policies for different roles
type policyMap = {
  loggingPolicy: undefined | IamPolicy
}

const policyMap: policyMap = {
  loggingPolicy: undefined
}

// we store the one already made and look it up if we need it for other roles
const loggingPolicy = (scope: Construct) => {
  if (policyMap.loggingPolicy) {
    return policyMap.loggingPolicy
  }
  const name = `logging-policy`
  // attach cloud watch logging permission to lambda execution role
  policyMap.loggingPolicy = new IamPolicy(scope, `${name}-policy`, {
    name: resourceName(`${name}-policy`),
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          Resource: 'arn:aws:logs:*:*:*',
          Effect: 'Allow'
        }
      ]
    })
  })
  return policyMap.loggingPolicy
}

export const addLoggingPolicy = (
  scope: Construct,
  role: IamRole,
  lambdaName: string
) => {
  const policy = loggingPolicy(scope)
  // attach the policy to the role
  new IamRolePolicyAttachment(scope, `${lambdaName}-logging`, {
    policyArn: policy.arn,
    role: role.name
  })
}

export const addXRayWritePolicy = (
  scope: Construct,
  role: IamRole,
  lambdaName: string
) => {
  new IamRolePolicyAttachment(scope, `${lambdaName}-xray`, {
    policyArn: 'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess',
    role: role.name
  })
}
