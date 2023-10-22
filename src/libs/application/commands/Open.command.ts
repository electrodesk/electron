import { ApplicationEntity, ApplicationReadDTO, OpenCommandParam } from "@electrodesk/types/application"
import { container } from "tsyringe"
import { command } from "../../../core/decorators"
import { AbstractTask } from "../../../core/queue"
import { WindowBuilder } from "../../../core/services"
import { Application } from "../domain/model/Application.model"
import { ApplicationRegistry } from "../domain/repository/Application.registry"
import { ApplicationRepository } from "../domain/repository/Application.repository"
import { ApplicationAllReadyRunningException, ApplicationNotFoundException } from "../exceptions"
import type { ApplicationModel } from "../types/Application.properties"

@command({
  path: 'application:open',
  queue: 'system' // add to system queue to open new applications 
})
export class ApplicationOpenTask extends AbstractTask {
  private readonly applicationRepository = container.resolve(ApplicationRepository)

  private readonly applicationRegistry = container.resolve(ApplicationRegistry)

  constructor(
    private readonly param: OpenCommandParam,
    private readonly osProcessId: number
  ) {
    super();
  }

  execute(): void {
    this.openApplication()
      .then((applicationId) => super.complete(applicationId))
      .catch((error: Error) => super.error(error))
  }

  /**
   * @description open application by given name
   */
  private async openApplication(): Promise<ApplicationReadDTO> {
    const applicationEntity = await this.applicationRegistry.find(this.param.application);

    // check application can opened multiple times, if not and it is running throw error
    if (applicationEntity.multi === false) {
      const application = this.applicationRepository.findBy("name", applicationEntity.name)
      if (application) {
        throw new ApplicationAllReadyRunningException(applicationEntity.name)
      }
    }

    const application = this.createApplication(applicationEntity)
    this.applicationRepository.add(application)
    await application.open(applicationEntity.url)
    return {
      uuid: application.uuid,
      osProcessId: application.osProcessId,
      data: application.data /** das wollen wir nicht wirklich */
    }
  }

  /**
   * @description create new application
   */
  private createApplication(application: ApplicationEntity): ApplicationModel {
    const builder = container.resolve(WindowBuilder)
    let browserWindowBuilder = builder
      .withDimension(800, 600)
      .withTitle(application.name)
      .withShow(false)
      .withDevTools(true);

    if (this.param.asChild) {
      const parent = this.applicationRepository.findByProcessId(this.osProcessId)
      if (!parent) {
        throw new ApplicationNotFoundException()
      }
      browserWindowBuilder = browserWindowBuilder.withParent(parent.browserWindow)
    }

    return new Application(
      browserWindowBuilder.build(),
      this.param.data,
      application.name
    )
  }
}
