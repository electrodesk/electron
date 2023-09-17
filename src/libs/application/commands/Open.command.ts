import { OpenCommandParam } from "@electrodesk/electron-types/application"
import { container } from "tsyringe"
import { command } from "../../../core/decorators"
import { AbstractTask } from "../../../core/queue"
import { WindowBuilder } from "../../../support"
import { Application } from "../domain/model/Application.model"
import { ApplicationRepository } from "../domain/repository/Application.repository"
import { ApplicationNotFoundException } from "../exceptions"
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
    await this.isAuthorized()
    await this.hasPermission()

    super.complete(await this.openApplication())
  }

  private async isAuthorized(): Promise<boolean> {
    return Promise.resolve(true)
  }

  private hasPermission(): Promise<boolean> {
    return Promise.resolve(true)
  }

  private async openApplication(): Promise<string> {
    const application = this.createApplication()
    this.applicationRepository.add(application)
    application.browserWindow.webContents.openDevTools()
    await application.open(this.param.application)
    return application.uuid
  }

  private createApplication(): ApplicationEntity {
    const builder = container.resolve(WindowBuilder)
    let browserWindowBuilder = builder
      .withDimension(800, 600)
      .withTitle('Platzhirsch: Ralf')
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
