import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../types/error-codes"

export class ApplicationLoadUrlException extends CommandException {

  public readonly code = ErrorCode.APPLICATION_OPEN_EXCEPTION

  constructor(url: string) {
    super(`Could not open Application on given url: ${url}`)
  }
}
