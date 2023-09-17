import { container } from "tsyringe";
import { CommandRegistry } from "../domain/registry/Command.registry";
import { CommandConfig } from "../api";
import { TaskConstructor } from "../queue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;

export function command(config: CommandConfig) {
  const commandRegistry = container.resolve(CommandRegistry);

  return (ctor: Constructor): Constructor => {
    commandRegistry.register(ctor as TaskConstructor, config.path, config.queue);
    return ctor;
  }
}
