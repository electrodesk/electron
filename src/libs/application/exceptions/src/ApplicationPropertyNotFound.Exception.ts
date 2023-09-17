import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../types/error-codes"

export class ApplicationInvalidPropertyKeyException extends CommandException {
  readonly code = ErrorCode.APPLICATION_INVALID_PROPERTY_KEY

  constructor(property: string) {
    super(`No valid property for application: ${property}`)
  }
}
