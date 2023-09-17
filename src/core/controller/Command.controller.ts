

import { Command, CommandErrorResponse, CommandResponse } from "@trueffelmafia/electron-types";
import { IpcMainInvokeEvent, ipcMain } from "electron";
import { lastValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { singleton } from "tsyringe";
import { CommandRegistry } from "../domain/registry/Command.registry";
import { CommandException } from "../exceptions/Command.Exception";
import { ErrorCode } from '../exceptions/error.codes';
import { AbstractTask, ITaskResponse, Queue, TaskState } from "../queue";

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
    private readonly commandRegistry: CommandRegistry
  ) {
    ipcMain.handle('command:exec', (event: IpcMainInvokeEvent, command: Command) => {
      if (!command.command) {
        throw new Error(`No command defined`)
      }
      return this.executeCommand(command, event.sender.getOSProcessId());
    })
  }

  public exec(command: Command): CommandResponse | CommandErrorResponse {
    return this.executeCommand(command)
  }

  /**
   * @description execute command request
   */
  private executeCommand(command: Command, senderProcessId?: number): CommandResponse | CommandErrorResponse {
    try {
      const commandEntity = this.commandRegistry.get(command.command);
      const { ctor, queue } = commandEntity

      if (!this.queueMap.has(queue.name)) {
        this.queueMap.set(queue.name, this.createQueue(queue.parallelCount))
      }

      const task = new ctor(command, senderProcessId)
      const completed$ = task.completed.pipe(
        map((res) => this.handleCommandCompletedResponse(res)),
      )

      this.queueMap.get(queue.name)!.registerAndStart(task)
      return lastValueFrom(
        completed$,
        { defaultValue: { code: 0, data: void 0 } }
      ) as CommandResponse

    } catch (error) {
      if (error instanceof CommandException) {
        return Promise.resolve({
          code: error.code,
          error: error
        })
      }
      throw error;
    }
  }

  /**
   * @description create new queue which can handle at least 5 tasks in parallel
   */
  private createQueue(parallelCount = 5): Queue<AbstractTask> {
    const queue = new Queue();
    queue.parallelCount = parallelCount;
    return queue
  }

  private handleCommandCompletedResponse(res: ITaskResponse): unknown {
    if (res.state === TaskState.ERROR) {
      const errorRes = {
        code: ErrorCode.COMMAND_ERROR,
        error: res.error
      }

      if (res.error instanceof CommandException) {
        errorRes.code = res.error.code;
      }

      return errorRes
    }
    return res.result
  }
}
