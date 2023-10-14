import { ErrorCode } from "../domain/entity/ErrorCode.entity";
import { AbstractException } from "./Abstract.Exception";

export class DotEnvFileReadException extends AbstractException {
  readonly errorCode = ErrorCode.DOT_ENV_FILE_READ_ERROR;
}
