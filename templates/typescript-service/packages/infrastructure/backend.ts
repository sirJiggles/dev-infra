// first thing before anything, init the env vars
import { config } from 'dotenv'
config()

import { Construct } from 'constructs'
import { TerraformOutput, TerraformStack } from 'cdktf'
import { AwsProvider } from '@cdktf/provider-aws/lib/provider'
import { ServiceInfrastructureConfig } from './src/config/types'
import { syncStateFile } from './src/backend'

export class BackEndStack extends TerraformStack {
  constructor(scope: Construct, config: ServiceInfrastructureConfig) {
    const { stackName, region } = config

    super(scope, `${stackName}-backend`)

    new AwsProvider(this, 'AWS', {
      region
    })
    const { bucket, table } = syncStateFile(this)

    new TerraformOutput(this, 'bucket', {
      description: 'name of the bucket for the state file',
      value: bucket.bucket
    })
    new TerraformOutput(this, 'table', {
      description: 'table for the locking of the state file',
      value: table.name
    })
  }
}
