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

# Configuration 🔧

@TODO but I don't think it will be needed, maybe for secrets like NPM_AUTH token etc

# Infrastructure 🏘

@TODO but I don't think it will be needed

# Deployments 🚀

Merging to main will run the sync script via a git action that will run all steps needed for resources under management. This means for example if you add a repo to the repo list config then on merge to main a repository will be created using the configuration.
