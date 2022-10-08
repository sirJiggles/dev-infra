# What❓

Repo to manage dev infrastructure, right now it is just things like repositories, secrets, templates and bots in repositories.

# Why 🤷‍♂️

So developers can get started quickly with:

- Readily made templates for repositories and not spend a morning messing with packages
- Git CI workflows for those repos out of the box
- Setting up secrets that repositories need without needing access to them
- Not have to configure bots like changeset every time they make a repo

And our repositories benefit from:

- keep a consistent, predictable code structure within repositories
- automatic PR's to all repos "under management" when things change, like "adding a bot" or "tslint rules for the company" for example

And admins benefit form:

- Not worrying about developers needing full rights on repositories
- Not needing to allow access to secrets within repositories
- Not needing to allow access to integrations within repositories
- Knowing, not just anyone can delete a repository

# How ⚙️

### Set up for my company

@TODO talk about how to configure the repo that will use this code, like setting up secrets and so on

### Repository management

In the repositories folder, add repository configurations to the list. Adding a new entry creates a new repository automatically on merge to main.

An example of a repo could be something like:

```typescript
const repos = {
  name: 'managed-test-repo',
  description: 'this is a test repository',
  bots: ['changeset', 'dependabot'],
  team: 'team-awesome',
  template: 'typescript-service',
  actions: ['test', 'release', 'deploy-dev', 'pre-release'],
}
```

# Configuration 🔧

For all config settings there are some env vars also needed that you can set in the git hub settings or just in an env file if you do not want to run this via git actions. If you would like this repo to auto push to your other repos, I would advice simply set the configurations in github settings.

### NPM

`NPM_TOKEN` is needed so repos that use npm can publish to the registry. Get this token generated in your NPM account with the right access (an automation token, to bypass MFA)

### Github

For github there are a few config settings, mainly as the sync of the repos and how they are configured is done using the [octokit](https://github.com/octokit/octokit.js) client, which requires values for various operations, they are:

- `GH_ACCESS_TOKEN` (to authenticate)
- `GH_ORG_NAME` (for configuring repos)

For all of the github configs and why you need them, have a look at how they are used in the providers/github folder of this repo. And, in the docs for the [octokit](https://github.com/octokit/octokit.js) client.

To make a token, a developer with the required access (normally an admin in the org), needs to make a personal access token. This can be done following instructions [here](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Dry run / debugging

If you would like to first to see what the script will do, set an env var of `DRY_RUN` to anything. no API changes will happen. It will just show you in the console what would have happened 🎉

# Infrastructure 🏘

@TODO but I don't think it will be needed (maybe something like pulumi for secret management 🤷‍♂️)

# Deployments 🚀

Merging to main will run the sync script via a git action that will run all steps needed for resources under management. This means for example if you add a repo to the repo list config then on merge to main a repository will be created using the configuration.

There is another git action for push that will do a dry run for pushing to any branch before merge

You can run this script manually by simply running:

```bash
npm run build
npm run syncInfra
```

I would personally do something like:

```bash
npm run syncInfra DRY_RUN=true
```

if doing some local testing before push
