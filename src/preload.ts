import { Command, CommandErrorResponse, CommandHandler, CommandHandlerParam, CommandResponse, ElectronApi, ElectronEvent, EventHandler, EventHandlerParam } from '@electrodesk/types/core'
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

let commandHandlers: CommandHandler[] = []
let eventHandlers: EventHandler[] = []

function commandHandler(_event: IpcRendererEvent, param: CommandHandlerParam) {
  for (const handler of commandHandlers) {
    handler(param)
  }
}

function eventHandler(_event: IpcRendererEvent, param: EventHandlerParam) {
  for (const handler of eventHandlers) {
    handler(param)
  }
}

contextBridge.exposeInMainWorld('electrodesk', {
  // execute command on electron client
  execCommand: <R = unknown>(command: Command): Promise<CommandResponse<R> | CommandErrorResponse> => ipcRenderer.invoke("command:exec", command),
  /**
   * dispatch event from renderer process to main process
   */
  dispatchEvent: (event: ElectronEvent) => ipcRenderer.send('rendererEvent', event),
  /**
   * 
   */
  addEventHandler: (handler: EventHandler) => {
    if (eventHandlers.length === 0) {
      ipcRenderer.on('mainEvent', eventHandler)
    }
    eventHandlers.push(handler)
  },
  /**
   * remove event listener which will send through electron or applications
   */
  removeEventHandler: (handler: EventHandler) => {
    eventHandlers = eventHandlers.filter((registered) => registered !== handler)
    if (eventHandlers.length <= 0) {
      ipcRenderer.off('mainEvent', eventHandler)
    }
  },
  /**
   * Add command handler to handle commands from electon, this is opposite direction
   * to exec where the renderer process sends an command to main process.
   */
  addCommandHandler: (handler: CommandHandler) => {
    if (commandHandlers.length === 0) {
      ipcRenderer.on('command', commandHandler)
    }
    commandHandlers.push(handler)
  },
  /**
   * remove command handler
   */
  removeCommandHandler: (handler: CommandHandler) => {
    commandHandlers = commandHandlers.filter((registered) => registered !== handler)
    if (commandHandlers.length <= 0) {
      ipcRenderer.off('command', commandHandler)
    }
  }
} satisfies ElectronApi)
