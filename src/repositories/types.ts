// This maps to template folders in the templates directory, we just copy and paste them for a first
// commit when making a new repo
type RepositoryTemplate = 'typescript-service' | 'typescript-frontend'
// list of bots that we can use
type RepositoryBot = 'changeset' | 'dependabot'
// add secrets here that git actions may need
type RepositorySecret = 'NPM_AUTH_TOKEN'
// for now just one team, but can be more later on
type CodeOwners = 'team-awesome'

// git actions that the repo may want
// note, to use pre-release and release you NEED to use the changeset bot
// we could add type safety here but common sense is also advised :D
type GitActions =
  | 'deploy-dev'
  | 'deploy-prod'
  | 'test'
  | 'pre-release'
  | 'release'

export type Repository = {
  name: string
  description: string
  team: CodeOwners
  template: RepositoryTemplate
  bots?: RepositoryBot[]
  secrets?: RepositorySecret[]
  actions?: GitActions[]
}
