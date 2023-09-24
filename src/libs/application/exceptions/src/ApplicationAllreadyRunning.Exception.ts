import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from '../../constants/error.codes'

export class ApplicationAllReadyRunningException extends CommandException {

  public readonly code = ErrorCode.APPLICATION_ALLREADY_RUNNING_EXCEPTION

  constructor(name: string) {
    super(`Application with name ${name} is allready running and can not opened again`)
  }
}
