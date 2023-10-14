
export abstract class AbstractException extends Error {
  protected abstract readonly errorCode: number

  constructor(message: string, error?: Error) {
    super(message, { cause: { error } })
  }

  get code(): number {
    return this.errorCode
  }

  get error(): Error | undefined {
    return this.cause as Error | undefined
  }
}
