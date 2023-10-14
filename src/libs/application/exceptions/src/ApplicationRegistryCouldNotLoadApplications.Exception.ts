import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../domain/entity/ErrorCode.entity"

export class ApplicationRegistryCouldNotLoadApplicationsException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_REGISTRY_COULD_NOT_LOAD_APPLICATIONS

  constructor() {
    super(`Could not load applications from registry`)
  }
}
