import { singleton } from "tsyringe";
import winston from "winston";
import { join } from "path";
import { app } from "electron";
import util from "util";

// https://github.com/winstonjs/winston/issues/1427
const combineMessageAndSplat = () => ({
  transform(info: any) {
    const { [Symbol.for("splat")]: args = [], message } = info;
    info.message = util.format(message, ...args);
    return info;
  },
});

@singleton()
export class Logger {
  private winstonLogger: winston.Logger;

  constructor() {
    this.winstonLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        combineMessageAndSplat(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    });

    const isDev = this.isDev()
    const logDirPath = isDev ? "." : app.getPath("userData");
    this.winstonLogger.add(
      new winston.transports.File({
        level: "debug",
        filename: join(logDirPath, "app.log"),
        options: { flags: "a" },
      })
    );

    if (isDev) {
      this.winstonLogger.add(new winston.transports.Console())
    }
  }

  warn(message: string): void {
    this.winstonLogger.warn(message)
  }

  error(message: string, error: Error): void {
    this.winstonLogger.error(message, error)
  }

  private isDev(): boolean {
    const isEnvSet = "ELECTRON_IS_DEV" in process.env;
    const getFromEnv =
      Number.parseInt(process.env.ELECTRON_IS_DEV ?? "0", 10) === 1;
    return isEnvSet ? getFromEnv : !app.isPackaged;
  }
}
