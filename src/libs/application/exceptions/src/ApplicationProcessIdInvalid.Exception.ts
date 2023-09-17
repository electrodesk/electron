import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../types/error-codes"

export class InvalidProcessIdException extends CommandException {
  readonly code = ErrorCode.APPLICATION_INVALID_PROCESS_ID

  constructor() {
    super(`No valid application process id`)
  }
}
