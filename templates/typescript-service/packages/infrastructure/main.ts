// first thing before anything, init the env vars
import { config } from 'dotenv'
config()

import { Construct } from 'constructs'
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf'
import { defineCodeBucket, defineLambdas } from './src/lambda'
import { AwsProvider } from '@cdktf/provider-aws/lib/provider'
import { envConfig } from './src/config'
import { ServiceInfrastructureConfig } from './src/config/types'
import { BackEndStack } from './backend'
import { apiDomain } from './src/route53/api-domain'
import { defineOpenApi } from './src/buckets/openapi'
import { api } from './src/gateway/api'

class InfraStack extends TerraformStack {
  constructor(scope: Construct, config: ServiceInfrastructureConfig) {
    const { stackName, region } = config

    super(scope, stackName)

    new AwsProvider(this, 'AWS', {
      region
    })
    // so we can restore state files, and put them up
    // this section of the infra is for locking and storing of the state files
    // we need to remotely store state files of terraform so that when we run things
    // like git actions for deployments the docker container that runs the deploy
    // can simply pull the state file and know what needs modifying in the infrastructure
    new S3Backend(this, {
      bucket: `${stackName}-YOUR_SERVICE-state-bucket`,
      region,
      key: `terraform.${stackName}.tfstate`,
      dynamodbTable: `${stackName}-YOUR_SERVICE-state-file-table`,
      encrypt: true
    })
  }

  deploy() {
    // put lambda code into a bucket
    const codeBucket = defineCodeBucket(this)

    // define customer lambdas
    const lambdas = defineLambdas({ scope: this, codeBucket })

    const { gatewayDomain } = apiDomain({ scope: this })

    // with the lambdas and the domain we can now make the gateway
    api({ scope: this, lambdas, gatewayDomain })

    // open api bucket
    const { bucket: openApiBucket } = defineOpenApi(this)

    // set the outputs so we can read them later on
    new TerraformOutput(this, 'API_URL', {
      description: 'end point for the api',
      value: `https://${gatewayDomain.domainName}`
    })
    new TerraformOutput(this, 'API_DOCS', {
      description: 'end point for the swagger docs',
      value: `http://${openApiBucket.websiteEndpoint}`
    })
  }
}

const app = new App()
new BackEndStack(app, envConfig())
const infra = new InfraStack(app, envConfig())
infra.deploy()

app.synth()
