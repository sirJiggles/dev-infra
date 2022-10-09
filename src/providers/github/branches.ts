import { Octokit } from 'octokit'
import { config } from '../../config'

export const createBranch = async ({
  octokit,
  repo,
  branchName,
  baseBranch,
}: {
  octokit: Octokit
  repo: string
  branchName: string
  baseBranch: string
}) => {
  const envConf = config()
  const owner = envConf.github.org

  const baseBranchRef = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  })

  const newBranchRef = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseBranchRef.data.object.sha,
  })

  const currentCommit = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: newBranchRef.data.object.sha,
  })

  const newCommit = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: 'Making a new branch for template files',
    tree: currentCommit.data.tree.sha,
    parents: [currentCommit.data.sha],
  })

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
    sha: newCommit.data.sha,
  })
}
