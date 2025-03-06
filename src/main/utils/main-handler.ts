

import { IpcRendererEvent } from 'electron'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { getWindow,  } from './window'

const MainHandler = {
    send: (channel: string, ...args: any[]) => {
        const window = getWindow()
        window?.webContents.send(channel, ...args)
    },

    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
        ipcMain.on(channel, listener as any)
    },
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
        ipcMain.removeAllListeners(channel)
        ipcMain.once(channel, listener as any)
    },
    handle: (channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>) => {
        ipcMain.handle(channel, listener)
    },
    log: (...args: any[]) => {
        // @ts-ignore
        try {
            MainHandler.send("log", ...args)    
        } catch (error:any) {
            // can't console error as it is modified in set-up-error-forwarding-to-renderer.ts
            console.log(error?.message)
            console.log(error?.stack)
        }
        
    }

}

export { MainHandler }
