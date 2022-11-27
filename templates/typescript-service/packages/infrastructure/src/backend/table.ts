import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table'
import { Construct } from 'constructs'
import { resourceName } from '../resources/names'

export const stateFileTable = (scope: Construct) => {
  const name = 'state-file-table'
  // the name is important! without the right name the lock file mechanisms will not
  // work (contrary to docs online it is lock ID with a capital L)
  const colName = 'LockID'
  const table = new DynamodbTable(scope, name, {
    name: resourceName(name),
    hashKey: colName,
    billingMode: 'PAY_PER_REQUEST',
    attribute: [
      {
        name: colName,
        type: 'S',
      },
    ],
  })

  return { table }
}
