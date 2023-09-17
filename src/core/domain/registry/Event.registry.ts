
import { singleton } from "tsyringe";
import { EventHandler, EventHandlerConfig, EventHandlerConstructor } from "../../api/event";

@singleton()
export class EventRegistry {

  private readonly eventHandlerCtorMap = new WeakMap<EventHandlerConstructor, EventHandler>();

  private readonly eventRegistry = new Map<string, EventHandlerConstructor[]>();

  /**
   * @description register new message eventHandler for given namespace
   */
  register(config: EventHandlerConfig, handler: EventHandlerConstructor) {
    if (!config.channel) {
      return;
    }

    if (!this.eventRegistry.has(config.channel)) {
      this.eventRegistry.set(config.channel, [handler])
      return
    }

    this.eventRegistry.set(config.channel, [...this.eventRegistry.get(config.channel)!, handler])
  }

  get(channel: string): EventHandlerConstructor[] {
    if (this.eventRegistry.has(channel)) {
      return this.eventRegistry.get(channel) as EventHandlerConstructor[]
    }

    throw new Error(`channel not found`)
  }

  resolveHandler(channel: string): EventHandler[] {
    const handlers = this.get(channel);
    return handlers.map((handler) => {
      let eventHandlerInstance = this.eventHandlerCtorMap.get(handler);
      if (!eventHandlerInstance) {
        eventHandlerInstance = new handler()
        this.eventHandlerCtorMap.set(handler, eventHandlerInstance)
      }
      return eventHandlerInstance;
    })
  } 
}
