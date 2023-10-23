import { singleton } from "tsyringe";
import { QueueConfig } from "../../api";
import { CommandAllreadyExistsExecption, CommandNotRegisteredException } from "../../exceptions";
import { TaskConstructor } from "../../queue";
import { Logger } from "../../services";

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

  constructor(private readonly logger: Logger) {}

  /**
   * @description register new command 
   */
  register(
    ctor: TaskConstructor,
    command: string,
    queue: QueueConfig | string = { name: 'global', parallelCount: 5 }
  ): void {
    try {
      if (this.commandRegistry.has(command)) {
        throw new CommandAllreadyExistsExecption(`Command "${command}" allready registered`)
      }

      if (typeof queue === 'string') {
        queue = { name: queue, parallelCount: 5 }
      }

      this.commandRegistry.set(command, { queue, ctor })
    } catch (error: unknown) {
      this.logger.error(`Command Registry:`, error as Error)
    }
  }

  get(command: string): CommandEntity {
    if (this.commandRegistry.has(command)) {
      return this.commandRegistry.get(command) as CommandEntity;
    }

    throw new CommandNotRegisteredException(`Command "${command}" not found`)
  }
}
