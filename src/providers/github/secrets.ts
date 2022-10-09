import { seal } from 'tweetsodium'
import { octokitInstance as octokit } from '.'
import { config } from '../../config'
import { SecretDefinition } from '../../resources/secrets/types'

export const getRepoSecret = async (name: string, repoName: string) => {
  const envConf = config()
  return await octokit.rest.actions.getRepoSecret({
    repo: repoName,
    owner: envConf.github.org,
    secret_name: name,
  })
}

export const setRepoSecret = async ({
  secret,
  repo,
}: {
  secret: SecretDefinition
  repo: string
}) => {
  const envConf = config()

  await octokit.rest.actions.createOrUpdateRepoSecret({
    repo,
    encrypted_value: encryptSecret(secret.value),
    secret_name: secret.name,
    owner: envConf.github.org,
  })
}

const encryptSecret = (secret: string) => {
  const key = 'base64-encoded-public-key'

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secret)
  const keyBytes = Buffer.from(key, 'base64')

  // Encrypt using LibSodium.
  const encryptedBytes = seal(messageBytes, keyBytes)

  // Base64 the encrypted secret
  return Buffer.from(encryptedBytes).toString('base64')
}
