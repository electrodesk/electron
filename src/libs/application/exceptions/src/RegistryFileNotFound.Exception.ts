import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from "../../domain/entity/ErrorCode.entity"

export class RegistryFileNotFoundException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_ALLREADY_RUNNING_EXCEPTION
}
