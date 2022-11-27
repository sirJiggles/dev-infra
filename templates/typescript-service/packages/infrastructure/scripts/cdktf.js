const { execSync } = require('child_process')
require('dotenv').config()

const action = process.env.ACTION || 'deploy'
const stack = process.env.STACK_NAME

if (!stack) {
  console.error('stack name to sync is required')
  process.exit(1)
}

execSync(`cdktf synth`, { stdio: 'inherit' })

// only deploy the infra, the backend for each stack is ONLY DEPLOYED ONCE
// do it manually for each stack, it is a chicken and egg kinda thing
execSync(`cdktf ${action} ${stack}`, { stdio: 'inherit' })
