import { repositories } from './repositories'

// function to connect to git hub and manage the repos
export const syncRepos = () => {
  const reposSynced = repositories.map((repo) => {
    return repo.name
  })
  // for now just return the names of the repos we will sync
  return reposSynced
}
