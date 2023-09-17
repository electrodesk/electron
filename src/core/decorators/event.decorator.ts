import { container } from "tsyringe"
import { EventHandlerConfig, EventHandlerConstructor } from "../api/event"
import { EventRegistry } from "../domain/registry/Event.registry"

export function eventHandler(config: EventHandlerConfig) {
  const eventRegistry = container.resolve(EventRegistry)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctor: EventHandlerConstructor): any => {
    eventRegistry.register(config, ctor)
    return ctor
  }
}
