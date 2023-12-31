import { BrowserWindow } from "electron";
import { BehaviorSubject, Observable } from "rxjs";
import { v4 as uuid } from "uuid";
import { ApplicationLoadUrlException } from "../../exceptions";
import { ApplicationState, type ApplicationModel } from "../../types/Application.properties";
import { ApplicationListenerModel } from "./Application.Listener.model";

export class Application implements ApplicationModel {

  /**
   * application id which is used to register our self into application manager
   */
  private readonly applicationId = uuid()

  /**
   * subscribe to get notified for application state changes
   */
  private readonly applicationState$ = new BehaviorSubject<ApplicationState>(ApplicationState.PENDING)

  private readonly payload: unknown

  /**
   * @description channels which are opened by application, eigentlich sind hier
   * nur empfaenger drinnen
   * 
   * eigentlich sind das ApplicationListeners
   */
  readonly listeners = new ApplicationListenerModel()

  get uuid(): string {
    return this.applicationId
  }

  get osProcessId(): number | undefined {
    return this.browserWindow?.webContents.getOSProcessId()
  }

  get initialData(): unknown {
    return this.payload
  }

  constructor(
    public readonly browserWindow: BrowserWindow,
    public readonly data: unknown,
    public readonly name: string
  ) {}

  getBrowserWindow(): BrowserWindow | undefined {
    return this.browserWindow;
  }

  close(force = false): void {
    if (force) {
      this.browserWindow?.destroy()
      return;
    }

    this.browserWindow?.close()
  }

  async open(url: string): Promise<void> {
    this.registerEvents()
    try {
      this.browserWindow.once('ready-to-show', () => this.browserWindow.show())
      await this.browserWindow.loadURL(url)
    } catch (error) {
      this.close(true)
      throw new ApplicationLoadUrlException(url)
    }
  }

  /**
   * @description send message to application window
   * @param channel - more like the event we want to execute
   * @param payload - data which is send with the event
   */
  send(channel: string, payload: unknown): void {
    this.browserWindow?.webContents.send(channel, payload);
  }

  getInitialData(): unknown {
    return this.initialData
  }

  /**
   * return observable to get notified state of application window changed
   */
  stateChange(): Observable<ApplicationState> {
    return this.applicationState$.asObservable();
  }

  /**
   * Register on browser Events
   */
  private registerEvents(): void {
    if (this.browserWindow) {
      this.browserWindow.once('closed', () => this.handleApplicationClosed())
      this.browserWindow.on('show', () => this.handleApplicationShow())
    }
  }

  /**
   * handle application gets closed
   */
  private handleApplicationClosed(): void {
    this.applicationState$.next(ApplicationState.CLOSED)
    this.applicationState$.complete()
  }

  /**
   * handle application is shown
   */
  private handleApplicationShow(): void {
    this.applicationState$.next(ApplicationState.OPEN)
  }
}