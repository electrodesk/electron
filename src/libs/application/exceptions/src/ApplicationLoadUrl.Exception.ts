import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from '../../domain/entity/ErrorCode.entity'

export class ApplicationLoadUrlException extends CommandException {

  protected readonly errorCode = ErrorCode.APPLICATION_OPEN_EXCEPTION

  constructor(url: string) {
    super(`Could not open Application on given url: ${url}`)
  }
}
