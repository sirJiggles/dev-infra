import { Repository } from './types'

// Here is where you list all your repos, and how you would like them to be configured
export const repositories: Repository[] = [
  {
    name: 'managed-test-repo-gareth',
    description: 'this is a test automated repository',
    bots: ['changeset', 'dependabot'],
    team: 'team-awesome',
    template: 'typescript-service',
    actions: ['test', 'release-changeset'],
    isPrivate: false,
    secrets: ['NPM_AUTH_TOKEN', 'GH_ACCESS_TOKEN'],
  },
]
