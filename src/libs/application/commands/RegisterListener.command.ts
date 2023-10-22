import { ApplicationRegisterListenerCommandParam } from "@electrodesk/types/application";
import { container } from "tsyringe";
import { command } from "../../../core/decorators";
import { AbstractTask } from "../../../core/queue";
import { ApplicationRepository } from "../domain/repository/Application.repository";
import { ApplicationNotFoundException } from "../exceptions";

/**
 * @description register listener to running application
 */
@command({
  path: "application:register-listener",
  queue: "application",
})
export class ApplicationRegisterListenerCommand extends AbstractTask {
  private readonly applicationRepository = container.resolve(
    ApplicationRepository
  );

  constructor(
    private readonly param: ApplicationRegisterListenerCommandParam,
    private readonly osProcessId: number
  ) {
    super();
  }

  execute(): void {
    const target = this.applicationRepository.findById(this.param.id);
    const listener = this.applicationRepository.findByProcessId(
      this.osProcessId
    );

    if (!target) {
      throw new ApplicationNotFoundException();
    }

    if (!listener) {
      throw new ApplicationNotFoundException();
    }

    target.listeners.register(listener.uuid);
    super.complete();
  }
}
