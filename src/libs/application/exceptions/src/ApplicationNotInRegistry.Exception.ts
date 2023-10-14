import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../domain/entity/ErrorCode.entity"

export class ApplicationNotInRegistryException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_NOT_IN_REGISTRY_EXCEPTION

  constructor(name: string) {
    super(`Application ${name} was not found in Registry`)
  }
}
