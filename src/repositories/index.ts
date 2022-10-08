import { Repository } from './types'

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
