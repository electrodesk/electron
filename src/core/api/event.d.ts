import { ElectronEvent } from "@electrodesk/types/core"
import type { ApplicationEntity } from "../../libs/application/"

export interface EventHandlerConfig {
  channel: string
}

/**
 * global
 */
export interface EventData<T = unknown> {
  /**
   * event name
   */
  event: string
  /**
   * if no target is set broadcast message
   */
  target?: ApplicationEntity['uuid']
  /**
   *
   */
  data?: T
}

/**
 * Electron only
 */
export interface EventParam extends EventData {
  /** process id who sends the message */
  osProcessId: number
}

export interface ApplicationEventParam extends Omit<EventParam, 'target'> {
  target: ApplicationEntity['id']
}

export interface EventHandlerConstructor {
  new(...args?: unknown[]): EventHandler
}

export interface EventHandler {
  handleEvent(data: ElectronEvent['payload'], osProcessId?: number): void
}