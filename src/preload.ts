import { Command, CommandErrorResponse, CommandHandler, CommandHandlerParam, CommandResponse, ElectronApi, ElectronEvent } from '@electrodesk/types/core'
import { ApplicationEventHandler, ApplicationEvent } from '@electrodesk/types/application'
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'


let commandHandlers: CommandHandler[] = []
let eventHandlers: ApplicationEventHandler[] = []

function commandHandler(_event: IpcRendererEvent, param: CommandHandlerParam) {
  for (const handler of commandHandlers) {
    handler(param)
  }
}

function eventHandler(_event: IpcRendererEvent, event: ApplicationEvent) {
  for (const handler of eventHandlers) {
    handler(event)
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
  addEventHandler: (handler: ApplicationEventHandler) => {
    if (eventHandlers.length === 0) {
      // sollten uns nur einmal auf den main Event registrieren und der sollte alle aufrufen, like broadcast
      ipcRenderer.on('mainEvent', eventHandler)
    }
    eventHandlers.push(handler)
  },
  /**
   * remove event listener which will send through electron or applications
   */
  removeEventHandler: (handler: ApplicationEventHandler) => {
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
