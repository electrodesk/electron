import { singleton } from "tsyringe";
import { CommandAllreadyExistsExecption, CommandNotRegisteredException } from "../../exceptions";
import { QueueConfig } from "../../api";
import { TaskConstructor } from "../../queue";

interface CommandEntity {
  queue: QueueConfig

  ctor: TaskConstructor
}

@singleton()
export class CommandRegistry {

  /**
   * @description all possible commands
   */
  private commandRegistry: Map<string, CommandEntity> = new Map();

  /**
   * @description register new command 
   */
  register(
    ctor: TaskConstructor,
    command: string,
    queue: QueueConfig | string = { name: 'global', parallelCount: 5 }
  ): void {
    if (this.commandRegistry.has(command)) {
      throw new CommandAllreadyExistsExecption()
    }

    if (typeof queue === 'string') {
      queue = { name: queue, parallelCount: 5 }
    }

    this.commandRegistry.set(command, { queue, ctor })
  }

  get(command: string): CommandEntity {
    if (this.commandRegistry.has(command)) {
      return this.commandRegistry.get(command) as CommandEntity;
    }

    throw new CommandNotRegisteredException()
  }
}
