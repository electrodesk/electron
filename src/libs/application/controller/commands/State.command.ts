import { command } from "../../../../core/decorators";
import { AbstractTask } from "../../../../core/queue";

@command({
  path: 'application:state'
})
export class ApplicationStateCommand extends AbstractTask {

  execute(): void {
    super.complete();
  }
}
