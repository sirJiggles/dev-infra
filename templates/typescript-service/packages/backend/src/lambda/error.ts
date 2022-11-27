export class LambdaError extends Error {
  public statusCode
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}
