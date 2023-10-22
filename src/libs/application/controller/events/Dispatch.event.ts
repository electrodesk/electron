import { EventHandlerParam } from "@electrodesk/types"
import { ApplicationReadDTO, ApplicationDispatchEvent, ApplicationEvent } from "@electrodesk/types/application"
import { container } from "tsyringe"
import { EventHandler } from "../../../../core/api/event"
import { eventHandler } from "../../../../core/decorators"
import { ApplicationRepository } from "../../domain/repository/Application.repository"
import { ApplicationNotFoundException } from "../../exceptions"

/**
 * @description handler to dispatch event to other apps. 
 */
@eventHandler({
  channel: 'application:dispatch'
})
export class ApplicationEventHandler implements EventHandler {

  private applicationRegistry = container.resolve(ApplicationRepository)

  /**
   * @description application sends an event
   * @param payload - event data
   * @param osProcessId - processId of sender
   */
  handleEvent(dispatchEvent: ApplicationDispatchEvent<ApplicationEvent>, osProcessId?: number): void {
    if (dispatchEvent.broadcast) {
      this.broadcastEvent(dispatchEvent, osProcessId)
      return
    }

    if (osProcessId === undefined) {
      return;
    }

    const application = this.applicationRegistry.findByProcessId(osProcessId)
    if (!application) {
      return;
    }

    const event: ApplicationEvent = {
      ...dispatchEvent.payload,
      senderId: application.uuid,
    }

    for (let listener of application.listeners.list()) {
      this.dispatchEventOnApplication(listener, event)
    }
  }

  /**
   * @description send event to an other application
   * @param target - uuid of application we want to send event
   * @param event - event name which is send by application
   * @param payload - payload for the event
   */
  private dispatchEventOnApplication(target: ApplicationReadDTO['uuid'], event: ApplicationEvent): void {
    const application = this.applicationRegistry.findById(target)

    if (!application) {
      throw new ApplicationNotFoundException()
    }

    application.send(`mainEvent`, event)
  }

  /**
   * @description broadcast event to all applications, exclude sender
   */
  private broadcastEvent(event: ApplicationDispatchEvent<ApplicationEvent>, osProcessId?: number): void {

    console.log(event);

    const applications = this.applicationRegistry.list()
    for (const application of applications) {
      if (osProcessId !== undefined && application.osProcessId === osProcessId) {
        continue
      }

      application.send(`mainEvent`, event.payload)
    }
  }
}
