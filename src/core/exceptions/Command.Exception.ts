import { ErrorCode } from "../domain/entity/ErrorCode.entity";
import { AbstractException } from "./Abstract.Exception";

export class CommandException extends AbstractException {
  protected readonly errorCode: number = ErrorCode.COMMAND_ERROR;
}

export class CommandAllreadyExistsExecption extends CommandException {
  protected errorCode = ErrorCode.COMMAND_ALLREADY_REGISTERED;
}

export class CommandNotRegisteredException extends CommandException {
  readonly errorCode = ErrorCode.COMMAND_NOT_REGISTERED;
}
