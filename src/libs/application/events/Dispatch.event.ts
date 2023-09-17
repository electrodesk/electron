import { EventHandlerParam } from "@electrodesk/electron-types"
import { ApplicationDispatchEventPayload } from "@electrodesk/electron-types/application"
import { container } from "tsyringe"
import { EventHandler } from "../../../core/api/event"
import { eventHandler } from "../../../core/decorators"
import { ApplicationRepository } from "../domain/repository/Application.repository"
import { ApplicationNotFoundException } from "../exceptions"

/**
 * @description handler to dispatch event to other apps. 
 */
@eventHandler({
  channel: 'application:dispatch'
})
export class ApplicationEventHandler implements EventHandler {

  private applicationRegistry = container.resolve(ApplicationRepository)

  /**
   * @description electron fetches an event from renderer process send events
   * to other running applications
   */
  handleEvent(payload: ApplicationDispatchEventPayload, osProcessId?: number): void {
    if (payload.target !== undefined) {
      this.emitEventOnApplication(payload)
      return
    }

    this.broadcastEvent(payload, osProcessId)
  }

  /**
   * @description only emit a message to another application, this is point to point
   * but without any response
   */
  private emitEventOnApplication(event: ApplicationDispatchEventPayload): void {
    const application = this.applicationRegistry.findById(event.target!)

    if (!application) {
      throw new ApplicationNotFoundException()
    }

    const param: EventHandlerParam = {
      event: event.event,
      payload: event.data
    }
    application.send(`mainEvent`, param)
  }

  /**
   * @description broadcast event to all applications, exclude this app by our self
   */
  private broadcastEvent(event: ApplicationDispatchEventPayload, osProcessId?: number): void {
    const applications = this.applicationRegistry.list()
    for (const application of applications) {
      if (osProcessId !== undefined && application.osProcessId === osProcessId) {
        continue
      }

      const param: EventHandlerParam = {
        event: event.event,
        payload: event.data
      }
      application.send(`mainEvent`, event)
    }
  }
}
