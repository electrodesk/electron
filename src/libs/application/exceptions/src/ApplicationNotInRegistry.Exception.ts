import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../constants/error.codes"

export class ApplicationNotInRegistryException extends CommandException {
  readonly code = ErrorCode.APPLICATION_NOT_IN_REGISTRY_EXCEPTION

  constructor(name: string) {
    super(`Application ${name} was not found in Registry`)
  }
}
