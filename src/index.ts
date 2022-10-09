// as soon as possible require the env
import * as dotenv from 'dotenv'
dotenv.config()

// make sure the repos on the account are in sync, just use the github API for this
import { syncRepos } from './resources/repositories'

const run = async () => {
  // sync all the repos under management
  const reposSynced = await syncRepos()

  // just some output for now, lets see how we are going to handle it later
  // console.log('synced repos', reposSynced)
}

// run the main function
run()
