// In here we are just working with the github client
import { Octokit } from 'octokit'
import { config } from '../../config'
import { createBranch } from './branches'
import { openPR } from './pullRequests'
import { uploadToRepo } from './uploadToRepo'
import { createRepo, listRepos } from './repositories'

// this file exports all the things but also does the init of the octokit client
// we then just pass it about, also exported form here
const envConf = config()

// it does mean that we need to mock this if we need to test it, but honestly
// it is not such a big deal imo
const octokitInstance = new Octokit({ auth: envConf.github.token })

export {
  createBranch,
  openPR,
  uploadToRepo,
  octokitInstance,
  createRepo,
  listRepos,
}
