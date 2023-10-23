import { ApplicationMaximizeCommandParam } from "@electrodesk/types/application";
import { container } from "tsyringe";
import { command } from "../../../../core/decorators";
import { AbstractTask } from "../../../../core/queue";
import { ApplicationRepository } from "../../domain/repository/Application.repository";
import { ApplicationNotFoundException } from "../../exceptions";

/**
 * Command to execute something on application
 */
@command({
  path: "application:maximize",
  queue: "application",
})
export class ApplicationMaximizeCommand extends AbstractTask {
  private applicationRegistry = container.resolve(ApplicationRepository);

  constructor(
    private readonly param: ApplicationMaximizeCommandParam,
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
    if (browserWindow.maximizable && !browserWindow.isMaximized()) {
      browserWindow.focus();
      browserWindow.maximize();
    }
    super.complete();
  }
}
