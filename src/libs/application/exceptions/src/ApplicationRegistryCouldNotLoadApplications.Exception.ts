import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../constants/error.codes"

/**
 * @description exception throws if registry could not be loaded. So check .env file the property 
 * APPLICATIONS_REPOSITORY what is defined.
 */
export class ApplicationRegistryCouldNotLoadApplicationsException extends CommandException {
  readonly code = ErrorCode.APPLICATION_REGISTRY_COULD_NOT_LOAD_APPLICATIONS

  constructor() {
    super(`Coult not load applications from registry`)
  }
}
