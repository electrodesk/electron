import { OpenCommand } from "@electrodesk/types/application";
import { ElectronEvent } from "@electrodesk/types/core";
import { App, BrowserWindow, ipcMain } from "electron";
import { EOL } from 'os';
import { fromEvent, map } from "rxjs";
import { container } from "tsyringe";
import { bootstrap } from "./core/bootstrap/bootstrap";
import { CommandController } from "./core/controller/Command.controller";
import { EventController } from "./core/controller/Event.controller";
import { ErrorCode } from "./core/domain/entity/ErrorCode.entity";
import { AbstractException } from "./core/exceptions/Abstract.Exception";
import { ConfigService, Logger } from "./core/services";

export class Main {
  static mainWindow?: BrowserWindow
  static application: App;
  static BrowserWindow: typeof BrowserWindow;

  private static onWindowAllClosed(): void { }

  private static logger: Logger = container.resolve(Logger)

  private static onReady(): void {
    bootstrap()
      .then(() => {
        Main.registerEvent()
        return Main.runMainApplication()
      })
      .catch((error) => Main.handleError(error))
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the  
    // Electron.BrowserWindow into this function 
    // so this class has no dependencies. This 
    // makes the code easier to write tests for 
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
  }

  private static runMainApplication(): any {
    const configService = container.resolve(ConfigService)
    const commandManager = container.resolve(CommandController)

    const openStartappCommand: OpenCommand = {
      application: configService.getValue('START_APPLICATION') as string ?? '',
      command: 'application:open',
    }
    return commandManager.exec(openStartappCommand)
  }

  private static handleError(error: Error): void {
    let code = ErrorCode.SYSTEM_ERROR 

    // log error message
    if (error instanceof AbstractException) {
      this.logger.error(`Error Starting Electron Application:`, error)
      code = error.code
    }

    process.exit(code)
  }

  /**
   * @description register to "rendererEvent" event from renderer process
   */
  private static registerEvent(): void {
    const eventController = container.resolve(EventController)
    fromEvent(ipcMain, 'rendererEvent').pipe(
      map((event) => event as [Electron.IpcMainEvent, ElectronEvent]),
    ).subscribe(([e, event]) => eventController.dispatchEvent(event, e.sender.getOSProcessId()))
  }
}
