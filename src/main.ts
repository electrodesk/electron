import { OpenCommand } from "@electrodesk/types/application";
import { CommandErrorResponse, ElectronEvent } from "@electrodesk/types/core";
import { App, BrowserWindow, ipcMain } from "electron";
import { fromEvent, map } from "rxjs";
import { container } from "tsyringe";
import { bootstrap } from "./core/bootstrap/bootstrap";
import { CommandController } from "./core/controller/Command.controller";
import { EventController } from "./core/controller/Event.controller";
import { ConfigService, WindowBuilder } from "./core/services";
import { ApplicationLoadUrlException, ApplicationNotInRegistryException } from "./libs/application/exceptions";

export class Main {
  static mainWindow?: BrowserWindow
  static application: App;
  static BrowserWindow: typeof BrowserWindow;

  private static onWindowAllClosed(): void { }

  private static async onReady(): Promise<void> {
    await bootstrap()
    Main.registerEvent()
    Main.runMainApplication()
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
  }

  private static runMainApplication(): void {
    const configService = container.resolve(ConfigService)
    const commandManager = container.resolve(CommandController)

    const openStartappCommand: OpenCommand = {
      application: configService.getValue('START_APPLICATION') as string ?? '',
      command: 'application:open',
    }

    commandManager.exec(openStartappCommand)
      .then((res) => {
        // hide splash screen

        if (res.code !== 0) {
          throw (res as CommandErrorResponse).error;
        }
      })
      .catch((error: unknown) => Main.handleStartError(error))
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

  /**
   * @description handle errors which occours on starting electron client
   */
  private static handleStartError(error: unknown): void {
    switch (true) {
      case error instanceof ApplicationNotInRegistryException:
        Main.openErrorPage('./static/start-page-not-found-error.html')
      break;

      case error instanceof ApplicationLoadUrlException:  
        Main.openErrorPage('./static/start-page-not-ready.html')
      break;

      default:
        throw error;
    }
  }

  /**
   * @description show error page
   */
  private static openErrorPage(page: string): void {
    const window = new WindowBuilder()
      .withShow(false)
      .build()

    window.loadFile(page)
    window.once('ready-to-show', () => window.show())
  }
}
