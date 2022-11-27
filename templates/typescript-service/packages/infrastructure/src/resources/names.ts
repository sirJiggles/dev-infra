import { envConfig } from '../config'

// to isolate resources from stack to stack and resolve collisions
export const resourceName = (name: string) => {
  return `${envConfig().stackName}-pay-srv-${name}`
}
