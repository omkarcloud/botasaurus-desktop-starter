import cogoToastRoute from './update-toasts'

type IpcHandler =  {
    send(channel: string, value?: any): void;
    on(channel: string, callback: (...args: unknown[]) => void): () => void;
    off(channel: string, callback: (...args: unknown[]) => void): void;
    invoke<T = any>(channel: string, ...args: any[]): Promise<T>;
    once(channel: string, func: (...args: unknown[]) => void): void;
    getPathForFile: (file: File) => string;
}

// @ts-ignore
export const handler: IpcHandler = ipc


handler.on("log", console.log)


for (const [key, value] of Object.entries(cogoToastRoute)) {
    handler.on(key, value);
}
