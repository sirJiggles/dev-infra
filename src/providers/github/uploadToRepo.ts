import { Octokit } from 'octokit'
import globby from 'globby'
import { readFileSync } from 'fs'
import { config } from '../../config'
import { Repository } from '../../repositories/types'

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
  repo,
  branch = 'main',
}: {
  octokit: Octokit
  repo: Repository
  branch: string
}) => {
  // get org name from config
  const envConfig = config()
  const org = envConfig.github.org

  // gets commit's AND its tree's SHA
  const currentCommit = await getCurrentCommit({
    octokit,
    org,
    repo: repo.name,
    branch,
  })
  const filesPaths = await globby(`${envConfig.templates.directory}/tmp/**/*`, {
    dot: true,
  })

  const filesBlobs = await Promise.all(
    filesPaths.map(createBlobForFile({ octokit, org, repo: repo.name }))
  )

  const pathsForBlobs = filesPaths.map((filePath) =>
    filePath.replace(`${envConfig.templates.directory}/tmp/`, '')
  )

  const newTree = await createNewTree({
    octokit,
    owner: org,
    repo: repo.name,
    blobs: filesBlobs,
    paths: pathsForBlobs,
    parentTreeSha: currentCommit.treeSha,
  })
  const message = `Adding template files`

  const newCommit = await createNewCommit({
    octokit,
    org,
    repo: repo.name,
    message,
    currentCommitSha: currentCommit.commitSha,
    newTreeSha: newTree.sha,
  })
  await setBranchToCommit({
    octokit,
    org,
    repo: repo.name,
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

const getEncodedFile = (filePath: string, encoding: 'utf8' | 'base64') =>
  readFileSync(filePath, { encoding })

const createBlobForFile =
  ({ octokit, org, repo }: { octokit: Octokit; org: string; repo: string }) =>
  async (filePath: string) => {
    const encoding = 'base64'
    const content = await getEncodedFile(filePath, encoding)

    const blobData = await octokit.rest.git.createBlob({
      owner: org,
      repo,
      content,
      encoding,
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
  newTreeSha,
}: {
  octokit: Octokit
  org: string
  repo: string
  message: string
  newTreeSha: string
  currentCommitSha: string
}) =>
  (
    await octokit.rest.git.createCommit({
      owner: org,
      repo,
      message,
      tree: newTreeSha,
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
