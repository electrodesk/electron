import { ApplicationReadDTO } from "@electrodesk/types/application";
import { BrowserWindow } from "electron";
import type { Observable } from "rxjs";
import { ApplicationListenerModel } from "../domain/model/Application.Listener.model";

// Observable state changed
export const enum ApplicationState {
  PENDING = 0,
  OPEN = 1,
  CLOSED = 2,
}

export type ApplicationModelConstructor = new(browserWindow: BrowserWindow) => ApplicationModel

export interface ApplicationModel extends ApplicationReadDTO {

  readonly browserWindow: BrowserWindow

  readonly listeners: ApplicationListenerModel

  open(url: string): Promise<void>

  stateChange(): Observable<ApplicationState>

  send(channel: string, payload: unknown): void
}
