import { container } from "tsyringe";
import { command } from "../../../core/decorators";
import { AbstractTask } from "../../../core/queue";
import { ApplicationRepository } from "../domain/repository/Application.repository";

@command({
  path: 'application:state'
})
export class ApplicationStateCommand extends AbstractTask {
  private readonly ApplicationRepository = container.resolve(ApplicationRepository);

  constructor(
    private readonly param: unknown,
  ) {
    super();
  }

  execute(): void {
    super.complete();
  }
}
