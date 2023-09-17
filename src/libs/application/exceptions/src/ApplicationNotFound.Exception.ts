import { CommandException } from '../../../../core/exceptions';
import { ErrorCode } from "../../constants/error.codes";

export class ApplicationNotFoundException extends CommandException {
  readonly code = ErrorCode.APPLICATION_NOT_FOUND

  constructor() {
    super(`No application found with given ID`)
  }
}
