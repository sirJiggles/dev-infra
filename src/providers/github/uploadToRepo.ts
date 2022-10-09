import { Octokit } from 'octokit'
import globby from 'globby'
import path from 'path'
import { readFileSync } from 'fs'
import { config } from '../../config'

// could not easily get typings :/
type Tree = {
  path?: string | undefined
  mode?: '100644' | '100755' | '040000' | '160000' | '120000' | undefined
  type?: 'tree' | 'blob' | 'commit' | undefined
  sha?: string | null | undefined
  content?: string | undefined
}

export const uploadToRepo = async ({
  octokit,
  folderPath,
  repo,
  branch = 'main',
}: {
  octokit: Octokit
  folderPath: string
  repo: string
  branch: string
}) => {
  // get org name from config
  const envConfig = config()
  const org = envConfig.github.org

  // gets commit's AND its tree's SHA
  const currentCommit = await getCurrentCommit({ octokit, org, repo, branch })
  const filesPaths = await globby(folderPath)
  const filesBlobs = await Promise.all(
    filesPaths.map(createBlobForFile({ octokit, org, repo }))
  )
  const pathsForBlobs = filesPaths.map((path) =>
    path.replace('templates/typescript-service/', '')
  )
  const newTree = await createNewTree({
    octokit,
    owner: org,
    repo,
    blobs: filesBlobs,
    paths: pathsForBlobs,
    parentTreeSha: currentCommit.treeSha,
  })
  const message = `Adding template files`
  const newCommit = await createNewCommit({
    octokit,
    org,
    repo,
    message,
    currentCommitSha: newTree.sha,
    currentTreeSha: currentCommit.commitSha,
  })
  await setBranchToCommit({
    octokit,
    org,
    repo,
    branch,
    commitSha: newCommit.sha,
  })
}

const getCurrentCommit = async ({
  octokit,
  org,
  repo,
  branch = 'main',
}: {
  octokit: Octokit
  org: string
  repo: string
  branch: string
}) => {
  const { data: refData } = await octokit.rest.git.getRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octokit.rest.git.getCommit({
    owner: org,
    repo,
    commit_sha: commitSha,
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  }
}

// Notice that readFile's utf8 is typed differently from Github's utf-8
const getFileAsUTF8 = (filePath: string) =>
  readFileSync(filePath, { encoding: 'utf8' })

const createBlobForFile =
  ({ octokit, org, repo }: { octokit: Octokit; org: string; repo: string }) =>
  async (filePath: string) => {
    const content = await getFileAsUTF8(filePath)
    const blobData = await octokit.rest.git.createBlob({
      owner: org,
      repo,
      content,
      encoding: 'utf-8',
    })
    return blobData.data
  }

const createNewTree = async ({
  octokit,
  owner,
  repo,
  blobs,
  paths,
  parentTreeSha,
}: {
  octokit: Octokit
  owner: string
  repo: string
  blobs: {
    url: string
    sha: string
  }[]
  paths: string[]
  parentTreeSha: string
}) => {
  // My custom config. Could be taken as parameters
  const tree: Tree[] = blobs.map(({ sha }, index) => ({
    path: paths[index],
    // this is file mode
    mode: '100644',
    type: 'blob',
    sha,
  }))
  const { data } = await octokit.rest.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  })
  return data
}

const createNewCommit = async ({
  octokit,
  org,
  repo,
  message,
  currentCommitSha,
  currentTreeSha,
}: {
  octokit: Octokit
  org: string
  repo: string
  message: string
  currentTreeSha: string
  currentCommitSha: string
}) =>
  (
    await octokit.rest.git.createCommit({
      owner: org,
      repo,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha],
    })
  ).data

const setBranchToCommit = ({
  octokit,
  org,
  repo,
  branch = 'main',
  commitSha,
}: {
  octokit: Octokit
  org: string
  repo: string
  branch: string
  commitSha: string
}) =>
  octokit.rest.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })
