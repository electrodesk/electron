import { ApplicationExecCommandParam, CommandCompletedEvent } from "@electrodesk/electron-types/application";
import { CommandHandlerParam, ElectronEvent } from "@electrodesk/electron-types/core";
import { ipcMain } from "electron";
import { Event } from "electron/main";
import { Observable, filter, fromEvent, map, take, takeUntil } from "rxjs";
import { container } from "tsyringe";
import { v4 as uuid } from "uuid";
import { command } from "../../../core/decorators";
import { AbstractTask } from "../../../core/queue";
import { ApplicationRepository } from "../domain/repository/Application.repository";
import { ApplicationNotFoundException } from "../exceptions";
import { ApplicationEntity } from "../types/Application.properties";

/**
 * Command to execute something on application
 */
@command({
  path: 'application:exec',
  queue: 'application'
})
export class ApplicationExecCommand extends AbstractTask {

  private applicationRegistry = container.resolve(ApplicationRepository)

  private application?: ApplicationEntity;

  constructor(
    private readonly param: ApplicationExecCommandParam
  ) {
    super()
  }

  execute(): void {
    this.application = this.applicationRegistry.findById(this.param.applicationId);
    this.runExecCommand()
      .pipe(takeUntil(this.completed))
      .subscribe((response) => super.complete(response))
  }

  private runExecCommand(): Observable<unknown> {
    if (!this.application) {
      throw new ApplicationNotFoundException()
    }

    const commandId = uuid()
    const { payload } = this.param;
    const commandPayload: CommandHandlerParam = {
      commandId,
      command: payload.command, // command name
      payload: payload.data
    }

    this.application.send('command', { type: 'command', ...commandPayload })

    //** listen to renderer event since all messages are passed through
    return (fromEvent(ipcMain, 'rendererEvent') as Observable<[Event, ElectronEvent]>).pipe(
      map(([, event]) => event),
      filter((event): event is CommandCompletedEvent => event.name === `command:completed`),
      filter((event) => event.payload.commandId === commandId),
      map((event) => event.payload.data),
      take(1)
    )
  }
}
