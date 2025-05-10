import { shell } from 'electron';
import { ipcMain } from './ipc-main';
import * as routes from 'botasaurus-server/task-routes';
import setUpErrorForwardingToRenderer from './set-up-error-forwarding-to-renderer';

let isBackendSetUp = false;



export function setUpRendererToServerCall() {
  if (isBackendSetUp) return;
  isBackendSetUp = true;
  setUpErrorForwardingToRenderer();

  for (const [key, value] of Object.entries(routes)) {
    ipcMain.handle(key, async (_, ...data) => {
      // @ts-ignore
      const result = await value(...data);
      return result;
    });
  }
  ipcMain.handle('openInFolder', async (_, ...data) => {
    // @ts-ignore
    return shell.showItemInFolder(...data);
  });
  ipcMain.handle('openExternal', async (_, ...data) => {
    // @ts-ignore
    return shell.openExternal(...data);
  });
}
