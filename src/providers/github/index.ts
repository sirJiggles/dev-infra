// In here we are just working with the github client
import { Octokit } from 'octokit'
import { config } from '../../config'
import { createBranch } from './branches'
import { openPR } from './pullRequests'
import { uploadToRepo } from './uploadToRepo'
import { createRepo, listRepos } from './repositories'
const envConf = config()
const octokit = new Octokit({ auth: envConf.github.token })

export { createBranch, openPR, uploadToRepo, octokit, createRepo, listRepos }
