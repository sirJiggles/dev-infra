export const passBody = (body: string) => {
  // @TODO I have NO IDEA why but sometimes the body is base 64 encoded
  // as we are using a lambda proxy, but sometimes not. so we try both 😅
  // I think it might be an order of execution thing in terraform
  // and maybe depends on resources settings,
  try {
    return JSON.parse(body)
  } catch {
    return JSON.parse(Buffer.from(body, 'base64').toString('utf-8'))
  }
}
