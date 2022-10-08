// In here we are just working with the github client
import { Octokit } from 'octokit'
import { config } from '../../config'
import { log } from '../../log'
import { Repository } from '../../repositories/types'
const envConf = config()
const octokit = new Octokit({ auth: envConf.github.token })
// to determine if we should make changes
const dryRun = process.env.DRY_RUN || false

export const listRepos = async () => {
  // we need to use the paginate iterator incase there are more than 30
  // repos
  const iterator = octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
    org: envConf.github.org,
  })

  // iterate through each response
  // @TODO try to get some sort of async reducer to work,
  // we are loosing type safety here and it will bite us in the ass
  let finalRepos: any[] = []
  for await (const { data: repos } of iterator) {
    finalRepos = finalRepos.concat(repos)
  }
  return finalRepos
}

export const createRepo = async (repo: Repository) => {
  if (dryRun) {
    log('info', `dry run, would create repo: ${repo.name}`)
  } else {
    log('info', `creating repo: ${repo.name}`)
    await octokit.rest.repos.createInOrg({
      org: envConf.github.org,
      name: repo.name,
    })
  }
}
