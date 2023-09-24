import { ApplicationEntity } from "@electrodesk/types/application";
import { container } from "tsyringe";
import { command } from "../../../core/decorators";
import { AbstractTask } from "../../../core/queue";
import { ApplicationRegistry } from "../domain/repository/Application.registry";

/**
 * loads all available applications from application repository. The path should be defined
 * inside .env file as APPLICATIONS_REPOSITORY and is loaded from .env file
 */
@command({
  path: 'application:list'
})
export class ApplicationListCommand extends AbstractTask {
  private readonly applicationRegistry = container.resolve(ApplicationRegistry);

  execute(): void {
    this.applicationRegistry.list()
      .then((applications: ApplicationEntity[]) => super.complete(applications))
      .catch((error) => super.error(error))
  }
}
