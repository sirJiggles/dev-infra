import { createRepo, listRepos } from './providers/github'
import { repositories } from './repositories'

// function to connect to git hub and manage the repos
export const syncRepos = async () => {
  // create the repo if it does not exist
  const reposInGithub = await listRepos()
  const reposInGithubNames = reposInGithub.map((repo) => repo.name)

  const reposSynced = repositories.map(async (repo) => {
    // create the repo if it does not exist
    if (!reposInGithubNames.includes(repo.name)) {
      await createRepo(repo)
    }

    return repo.name
  })

  // for now just return the names of the repos we will sync
  return reposSynced
}
