import {
  Command,
  CommandResponse,
  CommandErrorResponse,
} from "@electrodesk/types";
import { IpcMainInvokeEvent, ipcMain } from "electron";
import { lastValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { singleton } from "tsyringe";
import { CommandRegistry } from "../domain/registry/Command.registry";
import { AbstractTask, ITaskResponse, Queue, TaskState } from "../queue";
import { Logger } from "../services";
import { AbstractException } from "../exceptions/Abstract.Exception";

export interface ITask {
  execute(): void;
}

@singleton()
export class CommandController {
  /**
   * @description holds all available queues which exists, every queue can run 5 tasks at the
   * to avoid we make to many operations at once.
   */
  private queueMap: Map<string, Queue<AbstractTask>> = new Map();

  constructor(
    private readonly commandRegistry: CommandRegistry,
    private readonly logger: Logger
  ) {
    this.registerForCommandExecEvent();
  }

  public exec(command: Command): Promise<CommandResponse> {
    return this.executeCommand(command);
  }

  /**
   * @description registers and execute electron renderer event command:exec
   */
  private registerForCommandExecEvent(): void {
    ipcMain.handle(
      "command:exec",
      (event: IpcMainInvokeEvent, command: Command) => {
        if (!command.command) {
          throw new Error(`No command defined`);
        }

        return this.executeCommand(
          command,
          event.sender.getOSProcessId()
        ).catch((error: unknown) => this.createErrorResponse(error));
      }
    );
  }

  /**
   * @description create error response if called from renderer @see registerForCommandExecEvent
   */
  private createErrorResponse(error: unknown): CommandErrorResponse {
    this.logger.error("CommandController electron renderer event command exec:", error as Error);
    if (error instanceof AbstractException) {
      return {
        code: error.code,
        error,
      };
    }

    return {
      code: 500,
      error: error as Error,
    };
  }

  /**
   * @description execute command request
   */
  private executeCommand(
    command: Command,
    senderProcessId?: number
  ): Promise<CommandResponse> {
    const commandEntity = this.commandRegistry.get(command.command);
    const { ctor, queue } = commandEntity;

    if (!this.queueMap.has(queue.name)) {
      this.queueMap.set(queue.name, this.createQueue(queue.parallelCount));
    }

    const task = new ctor(command, senderProcessId);
    const completed$ = task.completed.pipe(
      map((res) => this.handleCommandCompletedResponse(res))
    );

    this.queueMap.get(queue.name)!.registerAndStart(task);

    return lastValueFrom(completed$, {
      defaultValue: { code: 0, data: void 0 },
    });
  }

  /**
   * @description create new queue which can handle at least 5 tasks in parallel
   */
  private createQueue(parallelCount = 5): Queue<AbstractTask> {
    const queue = new Queue();
    queue.parallelCount = parallelCount;
    return queue;
  }

  private handleCommandCompletedResponse(res: ITaskResponse): CommandResponse {
    if (res.state === TaskState.ERROR) {
      throw res.error;
    }

    return {
      code: 0,
      data: res.result,
    };
  }
}
