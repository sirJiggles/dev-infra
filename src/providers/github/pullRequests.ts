import { Octokit } from 'octokit'
import { config } from '../../config'

export const openPR = async ({
  octokit,
  repo,
  baseBranch,
  branchName,
  title,
  body,
}: {
  octokit: Octokit
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
