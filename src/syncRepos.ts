import { log } from './log'
import { createRepo, listRepos, createTemplatePR } from './providers/github'
import { repositories } from './repositories'
import { Repository } from './repositories/types'
import fs from 'fs-extra'
import { config } from './config'

// function to connect to git hub and manage the repos
export const syncRepos = async () => {
  // create the repo if it does not exist
  const reposInGithub = await listRepos()
  const reposInGithubNames = reposInGithub.map((repo) => repo.name)

  const reposSynced = repositories.map(async (repo) => {
    // create the repo if it does not exist
    if (!reposInGithubNames.includes(repo.name)) {
      await createRepo(repo)

      // when creating a repo, we make a PR to copy over the template of choice if there is one
      // this is ONLY done on repo creation else it will mess up what might have been done after

      // assemble the template in the template tmp folder with all the things they want for the repo
      await assembleTemplateFiles(repo)

      await createTemplatePR(repo)
    } else {
      log('info', `repo: ${repo.name}, already exists. Not creating`)
    }

    return repo.name
  })

  // for now just return the names of the repos we will sync
  return reposSynced
}

const assembleTemplateFiles = async (repo: Repository) => {
  const envConf = config()
  const templatePath = envConf.templates.directory

  // empty the templates tmp dir
  await fs.emptyDir(`${templatePath}/tmp`)

  // first copy the template
  await fs.copy(`${templatePath}/${repo.template}`, `${templatePath}/tmp`)

  // then the single files
  const filesToCopy = [
    `${templatePath}/README.md`,
    `${templatePath}/pull_request_template.md`,
  ]

  // copy single files
  await Promise.all(
    filesToCopy.map((filePath) => {
      const destination = filePath.replace(templatePath, '')
      fs.copyFile(filePath, `${templatePath}/tmp/${destination}`)
    })
  )

  // modify files based on repo settings
  await updatePackageJson(repo)
}

const updatePackageJson = async (repo: Repository) => {
  const envConf = config()
  const templatePath = envConf.templates.directory

  let fileContents = await fs.readFile(
    `${templatePath}/tmp/package.json`,
    'utf8'
  )
  fileContents = fileContents.replace(
    '@scope/service',
    `@${envConf.npm.scope || 'scope'}/${repo.name}`
  )
  fileContents = fileContents.replace(/DESCRIPTION/g, repo.description)
  fileContents = fileContents.replace(
    /YOURREPO/gm,
    `${envConf.github.org}/${repo.name}`
  )
  fs.writeFile(`${templatePath}/tmp/package.json`, fileContents)
}
