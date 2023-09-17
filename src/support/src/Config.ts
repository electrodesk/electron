import { singleton } from "tsyringe";

export declare type ConfigValue = string | undefined | number | boolean
export declare type ConfigKey = 
  | "APPLICATIONS_REPOSITORY"
  | "START_APPLICATION"

@singleton()
export class ConfigService {

  private configMap: Map<ConfigKey, ConfigValue> = new Map();

  setValue(key: ConfigKey, value: ConfigValue): void {
    this.configMap.set(key, value)
  }

  getValue(key: ConfigKey): ConfigValue {
    return this.configMap.get(key)
  }
}
