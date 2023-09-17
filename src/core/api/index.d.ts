interface QueueConfig {
  name: string
  parallelCount: number
}

export interface CommandConfig {
  path: string,
  queue?: string | QueueConfig
}

export interface CommandParam<P = unknown> {
  osProcessId?: number
  payload: P
}