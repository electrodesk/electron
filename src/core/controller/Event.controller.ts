import { ElectronEvent } from "@electrodesk/electron-types/core";
import { singleton } from "tsyringe";
import { EventRegistry } from "../domain/registry/Event.registry";

@singleton()
export class EventController {

  constructor(
    private readonly eventRegistry: EventRegistry
  ) {
  }

  /**
   * @description sends message to eventHandler
   */
  dispatchEvent(event: ElectronEvent, osProcessId?: number): void {
    const handlers = this.eventRegistry.resolveHandler(event.name)
    for (const handler of handlers) {
      handler.handleEvent(event.payload, osProcessId);
    }
  }
}
