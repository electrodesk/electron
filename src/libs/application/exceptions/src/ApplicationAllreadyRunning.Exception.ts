import { CommandException } from "../../../../core/exceptions"
import { ErrorCode } from '../../domain/entity/ErrorCode.entity'

export class ApplicationAllReadyRunningException extends CommandException {

  protected readonly errorCode = ErrorCode.APPLICATION_ALLREADY_RUNNING_EXCEPTION

  constructor(name: string) {
    super(`Application with name ${name} is allready running and can not opened again`)
  }
}
