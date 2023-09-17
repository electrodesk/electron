import { command } from "../../../../core/decorators";
import { AbstractTask } from "../../../../core/queue";

@command({
  path: 'system:ping',
  queue: 'system'
})
export class PingCommand extends AbstractTask {

  execute(): void {
    super.complete('pong');
  }
}
