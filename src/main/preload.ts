// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent , webUtils} from 'electron';


const electronHandler = {
    send(channel: string, value: any = null) {
      ipcRenderer.send(channel, value)
    },
    on(channel: string, callback: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        callback(...args)
      ipcRenderer.on(channel, subscription)
  
      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    off(channel: string, callback: (...args: unknown[]) => void) {
      ipcRenderer.off(channel, callback);
    },
    invoke<T = any>(channel: string, ...args: any[]): Promise<T> {
      return ipcRenderer.invoke(channel, ...args);
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    getPathForFile: webUtils.getPathForFile,
};

contextBridge.exposeInMainWorld('ipc', electronHandler);

export type ElectronHandler = typeof electronHandler;
