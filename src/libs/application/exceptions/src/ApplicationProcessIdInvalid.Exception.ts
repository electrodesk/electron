import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../domain/entity/ErrorCode.entity"

export class InvalidProcessIdException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_INVALID_PROCESS_ID

  constructor() {
    super(`No valid application process id`)
  }
}
