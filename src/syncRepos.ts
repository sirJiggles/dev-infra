import { log } from './log'
import { createRepo, listRepos, createTemplatePR } from './providers/github'
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
      // when creating a repo, we make a PR to copy over the template of choice if there is one
      // this is ONLY done on repo creation else it will mess up what might have been done after
      await createTemplatePR(repo)
    } else {
      log('info', `repo: ${repo.name}, already exists. Not creating`)
    }

    // // for testing
    // await createTemplatePR(repo)

    return repo.name
  })

  // for now just return the names of the repos we will sync
  return reposSynced
}
