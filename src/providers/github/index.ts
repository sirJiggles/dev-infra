// In here we are just working with the github client
import { Octokit } from 'octokit'
import { config } from '../../config'
import { log } from '../../log'
import { Repository } from '../../repositories/types'
import { createBranch } from './branches'
import { openTemplatePR } from './pullRequests'
import { uploadToRepo } from './uploadToRepo'
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

export const createTemplatePR = async (repo: Repository) => {
  if (dryRun) {
    log(
      'info',
      `dry run, would copy over template files for repo: ${repo.name}. Using template: ${repo.template}`
    )
    return
  }
  log(
    'info',
    `copying template files for repo ${repo.name}. Using template: ${repo.template}`
  )
  const branchName = 'initial-template'
  const baseBranch = 'main'

  // first make a branch from main
  // await createBranch({
  //   octokit,
  //   repo: repo.name,
  //   baseBranch,
  //   branchName,
  // })

  // upload the template files to the branch
  await uploadToRepo({
    octokit,
    folderPath: `templates/${repo.template}/**/*`,
    repo: repo.name,
    branch: branchName,
  })

  // open a PR for the branch
  // await openTemplatePR({
  //   octokit,
  //   repo: repo.name,
  //   baseBranch,
  //   branchName,
  // })
}
