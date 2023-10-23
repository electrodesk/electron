import { ApplicationRestoreCommandParam } from "@electrodesk/types/application";
import { container } from "tsyringe";
import { command } from "../../../../core/decorators";
import { AbstractTask } from "../../../../core/queue";
import { ApplicationRepository } from "../../domain/repository/Application.repository";
import { ApplicationNotFoundException } from "../../exceptions";

/**
 * @description if application is minimized it will restore application window
 */
@command({
  path: "application:restore",
  queue: "application",
})
export class ApplicationRestoreCommand extends AbstractTask {
  private applicationRegistry = container.resolve(ApplicationRepository);

  constructor(
    private readonly param: ApplicationRestoreCommandParam,
    private readonly processId: number
  ) {
    super();
  }

  execute(): void {
    const application =
      this.param.id !== undefined
        ? this.applicationRegistry.findById(this.param.id)
        : this.applicationRegistry.findByProcessId(this.processId);

    if (!application) {
      throw new ApplicationNotFoundException();
    }

    const browserWindow = application.browserWindow;

    if (browserWindow.isMinimized() || browserWindow.isMaximized()) {
      browserWindow.restore();
      browserWindow.focus();
    }

    super.complete();
  }
}
