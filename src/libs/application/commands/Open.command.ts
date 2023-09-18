import { OpenCommandParam } from "@electrodesk/types/application"
import { container } from "tsyringe"
import { command } from "../../../core/decorators"
import { AbstractTask } from "../../../core/queue"
import { WindowBuilder } from "../../../support"
import { Application } from "../domain/model/Application.model"
import { ApplicationRepository } from "../domain/repository/Application.repository"
import { ApplicationLoadUrlException, ApplicationNotFoundException } from "../exceptions"
import { ApplicationEntity } from "../types/Application.properties"

@command({
  path: 'application:open',
  queue: 'system' // add to system queue to open new applications 
})
export class ApplicationOpenTask extends AbstractTask {
  private readonly applicationRepository = container.resolve(ApplicationRepository)

  constructor(
    private readonly param: OpenCommandParam,
    private readonly osProcessId: number
  ) {
    super();
  }

  async execute(): Promise<void> {
    try {
      const applicationId = await this.openApplication()
      super.complete(applicationId)
    } catch (error) {
      super.error(error as Error)
    }
  }

  private async openApplication(): Promise<string> {
    const application = this.createApplication()
    this.applicationRepository.add(application)

    // application.browserWindow.webContents.openDevTools()
    try {
      await application.open(this.param.application)
      return application.uuid
    } catch (error) {
      throw new ApplicationLoadUrlException(this.param.application)
    }
  }

  private createApplication(): ApplicationEntity {
    const builder = container.resolve(WindowBuilder)
    let browserWindowBuilder = builder
      .withDimension(800, 600)
      .withTitle('Todo pass title')
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
      this.param.data
    )
  }
}
