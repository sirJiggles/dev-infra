import { Repository } from './types'

// Here is where you list all your repos, and how you would like them to be configured
export const repositories: Repository[] = [
  {
    name: 'managed-test-repo',
    description: 'this is a test repository',
    bots: ['changeset', 'dependabot'],
    team: 'team-awesome',
    template: 'typescript-service',
    actions: ['test', 'release'],
  },
]

export const reposNotUnderManagement = []
