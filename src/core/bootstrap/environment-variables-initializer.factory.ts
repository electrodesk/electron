import { config as dotenvConfig } from 'dotenv'
import { DotEnvFileReadException } from '../exceptions/DotEnvFileRead.Exception'
import { ConfigKey, ConfigService, ConfigValue } from '../services/src/Config'

export function environmentVariablesInitializerFactory(configService: ConfigService): () => void {
  return () => {
    const result = dotenvConfig({ path: './.env', processEnv: {}, encoding: 'utf8' })

    if (result.error) {
      throw new DotEnvFileReadException(`Could not open .env file`, result.error)
    }

    for (const [key, value] of Object.entries<ConfigValue>(result.parsed ?? {})) {
      configService.setValue(key as ConfigKey, value)
    }
  }
}
