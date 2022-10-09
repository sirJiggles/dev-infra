import { Octokit } from 'octokit'
import { config } from '../../config'
import { log } from '../../log'
import { Repository } from '../../repositories/types'

export const listRepos = async ({ octokit }: { octokit: Octokit }) => {
  const envConf = config()
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

export const createRepo = async ({
  octokit,
  repo,
}: {
  octokit: Octokit
  repo: Repository
}) => {
  const envConf = config()
  if (envConf.dryRun) {
    log('info', `dry run, would create repo: ${repo.name}`)
    return
  }
  log('info', `creating repo: ${repo.name}`)
  const { name, description, gitignoreTemplate } = repo
  // IF you would like to use this for your personal account
  // just change the call here to create for authenticated user
  // or whatever you need
  await octokit.rest.repos.createInOrg({
    org: envConf.github.org,
    name,
    description,
    gitignore_template: gitignoreTemplate || 'Node',
  })
}
