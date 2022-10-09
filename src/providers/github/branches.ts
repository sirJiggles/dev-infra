import { config } from '../../config'
import { octokitInstance as octokit } from './'

export const createBranch = async ({
  repo,
  branchName,
  baseBranch,
  message,
}: {
  repo: string
  branchName: string
  baseBranch: string
  message: string
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
    message,
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
