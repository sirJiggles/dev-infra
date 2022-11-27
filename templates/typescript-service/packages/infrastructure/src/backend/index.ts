import { Construct } from 'constructs'
import { stateFileBucket } from './bucket'
import { stateFileTable } from './table'

export const syncStateFile = (scope: Construct) => {
  // make the bucket for the state file
  const { bucket } = stateFileBucket(scope)
  // make the dynamo table for the locking of the state file
  const { table } = stateFileTable(scope)
  return { table, bucket }
}
