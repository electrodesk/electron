import { ErrorCode } from "./error.codes";

export abstract class CommandException extends Error {
  abstract readonly code: number;
  protected originalError: Error | null = null;

  get error(): Error | null {
    return this.originalError
  }
}

export class CommandAllreadyExistsExecption extends CommandException {
  readonly code = ErrorCode.COMMAND_ALLREADY_REGISTERED;

  protected originalError: Error | null = null;

  get error(): Error | null {
    return this.originalError
  }
}

export class CommandNotRegisteredException extends CommandException {
  readonly code = ErrorCode.COMMAND_NOT_REGISTERED;

  protected originalError: Error | null = null;

  get error(): Error | null {
    return this.originalError
  }
}
