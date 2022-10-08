export class RequiredConfigError extends Error {
  constructor(requiredParam: string) {
    super()
    this.message = `required config param missing: ${requiredParam}`
  }
}
