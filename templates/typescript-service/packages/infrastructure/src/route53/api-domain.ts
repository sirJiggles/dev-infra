import { ApiGatewayDomainName } from '@cdktf/provider-aws/lib/api-gateway-domain-name'
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record'
import { Construct } from 'constructs'
import { envConfig } from '../config'

// we need to import an existing zone in the account and add a domain to the zone
export const apiDomain = ({ scope }: { scope: Construct }) => {
  const { stackName, certificateArn, domainZoneId, domain } = envConfig()
  const name = 'api-gateway-domain'
  const domainName =
    stackName === 'staging' || stackName === 'production'
      ? `api.${domain}`
      : `api-${stackName}.${domain}`
  const gatewayDomain = new ApiGatewayDomainName(scope, name, {
    domainName,
    certificateArn
  })
  const record = new Route53Record(scope, `${name}-record`, {
    name: gatewayDomain.domainName,
    zoneId: domainZoneId,
    type: 'A',
    alias: [
      {
        evaluateTargetHealth: true,
        name: gatewayDomain.cloudfrontDomainName,
        zoneId: gatewayDomain.cloudfrontZoneId
      }
    ]
  })

  return { record, gatewayDomain }
}
