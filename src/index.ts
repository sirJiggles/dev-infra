// make sure the repos on the account are in sync, just use the github API for this

import { syncRepos } from './syncRepos'

const run = async () => {
  // sync all the repos under management
  const reposSynced = await syncRepos()

  // just some output for now, lets see how we are going to handle it later
  console.log('synced repos', reposSynced)
}

// run the main f
run()
