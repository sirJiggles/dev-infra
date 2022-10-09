import { config } from '../../config'
import { getRepoSecret, setRepoSecret } from '../../providers/github'
import { repositories } from '../repositories'
import { RepositorySecret } from '../repositories/types'
import { SecretDefinition } from './types'
import { RequestError } from '@octokit/types'

// run time type check using guard in ts
function isRequestError(err: unknown | RequestError): err is RequestError {
  return (<RequestError>err).status !== undefined
}

export const syncSecrets = async () => {
  const envConf = config()

  // secrets a repo can have
  const availableSecretValues: Record<RepositorySecret, string> = {
    NPM_AUTH_TOKEN: envConf.npm.token,
    GH_ACCESS_TOKEN: envConf.github.token,
  }

  repositories.forEach(async (repo) => {
    if (!repo.secrets) {
      return
    }
    for (const secret of repo.secrets) {
      const secretDefinition: SecretDefinition = {
        name: secret,
        value: availableSecretValues[secret],
      }
      try {
        await getRepoSecret(secretDefinition.name, repo.name)
      } catch (err: unknown | RequestError) {
        // we know it could not find the secret
        if (isRequestError(err) && err.status === 404) {
          await setRepoSecret({
            secret: secretDefinition,
            repo: repo.name,
          })
        } else {
          // we don't know how to handle it, throw it on up
          throw err
        }
      }
    }
  })
}
