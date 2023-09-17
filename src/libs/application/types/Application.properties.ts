import { ApplicationReadDTO } from "@electrodesk/types/application";
import { BrowserWindow } from "electron";
import type { Observable } from "rxjs";

// Observable state changed
export const enum ApplicationState {
  PENDING = 0,
  OPEN = 1,
  CLOSED = 2,
}

export interface ApplicationEntityConstructor {
  new(browserWindow: BrowserWindow): ApplicationEntity
}

export interface ApplicationEntity extends ApplicationReadDTO {

  readonly browserWindow: BrowserWindow

  open(url: string): Promise<void>

  stateChange(): Observable<ApplicationState>

  send(channel: string, payload: unknown): void
}
