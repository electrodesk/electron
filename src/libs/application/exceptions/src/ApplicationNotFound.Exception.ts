import { CommandException } from '../../../../core/exceptions';
import { ErrorCode } from "../../domain/entity/ErrorCode.entity";

export class ApplicationNotFoundException extends CommandException {
  protected readonly errorCode = ErrorCode.APPLICATION_NOT_FOUND

  constructor() {
    super(`No application found with given ID`)
  }
}
