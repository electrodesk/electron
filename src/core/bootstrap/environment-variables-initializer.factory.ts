import { config as dotenvConfig } from 'dotenv'
import { ConfigKey, ConfigService, ConfigValue } from '../services/src/Config'

export function environmentVariablesInitializerFactory(configService: ConfigService): () => void {
  return () => {
    const env = {}
    dotenvConfig({ path: './.env', processEnv: env, encoding: 'utf8' })

    for (const [key, value] of Object.entries<ConfigValue>(env)) {
      configService.setValue(key as ConfigKey, value)
    }
  }
}
