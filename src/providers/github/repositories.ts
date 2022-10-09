import { config } from '../../config'
import { log } from '../../log'
import { Repository } from '../../resources//repositories/types'
import { octokitInstance as octokit } from './'

export const listRepos = async () => {
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
  repo: { name, description, gitignoreTemplate, isPrivate },
}: {
  repo: Repository
}) => {
  const envConf = config()
  if (envConf.dryRun) {
    log('info', `dry run, would create repo: ${name}`)
    return
  }
  log('info', `creating repo: ${name}`)

  // IF you would like to use this for your personal account
  // just change the call here to create for authenticated user
  // or whatever you need
  await octokit.rest.repos.createInOrg({
    org: envConf.github.org,
    name,
    description,
    gitignore_template: gitignoreTemplate || 'Node',
    // might make this a config later, but honestly who does not want to remove them?
    delete_branch_on_merge: true,
    private: isPrivate,
  })
}
