import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../domain/entity/ErrorCode.entity"

export class ApplicationInvalidPropertyKeyException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_INVALID_PROPERTY_KEY

  constructor(property: string) {
    super(`No valid property for application: ${property}`)
  }
}
