import { config } from '../../config'
import { octokitInstance as octokit } from './'

export const openPR = async ({
  repo,
  baseBranch,
  branchName,
  title,
  body,
}: {
  repo: string
  branchName: string
  baseBranch: string
  title: string
  body: string
}) => {
  const envConf = config()
  await octokit.rest.pulls.create({
    owner: envConf.github.org,
    repo,
    head: branchName,
    base: baseBranch,
    title,
    body,
  })
}
