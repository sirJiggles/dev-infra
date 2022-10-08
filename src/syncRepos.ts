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

  // @TODO think about this a little before just adding it, I think it would
  // be better maybe to not delete repos on an automation, it would be very shitty
  // if you did not add one to the ignore list

  // any repos that are on github and not under management, should be removed
  // (Other than the ones flagged to ignore)
  // const reposRemoved = reposInGithub.map(async (repo) => {
  //   // if the repo in github is not defined in code
  //   // and the repo is not flagged as one to ignore
  //   if (
  //     !repoNamesInCode.includes(repo.name) &&
  //     !reposToIgnore.includes(repo.name)
  //   ) {
  //     await deleteRepo(repo.name)

  //     return repo.name
  //   }
  // })

  // for now just return the names of the repos we will sync
  return reposSynced
}
