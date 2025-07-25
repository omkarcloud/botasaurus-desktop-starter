import { shell } from 'electron';
import { ipcMain } from './ipc-main';
import * as routes from 'botasaurus-server/task-routes';
import setUpErrorForwardingToRenderer from './set-up-error-forwarding-to-renderer';

let isBackendSetUp = false;


function pickId(x) {
  return { id: x.id }
}
export function setUpRendererToServerCall() {
  if (isBackendSetUp) return;
  isBackendSetUp = true;

    
  setUpErrorForwardingToRenderer();

  for (const [key, value] of Object.entries(routes)) {
    if (key === 'createAsyncTask') {
      ipcMain.handle(key, async (_, ...data) => {
        // @ts-ignore
        let result = await value(...data);
        
        if (!Array.isArray(result)){
            return pickId(result)
        }
        
        return result.slice(0, 1).map(pickId);
      });
    } else {
      ipcMain.handle(key, async (_, ...data) => {
        // @ts-ignore
        const result = await value(...data);
        return result;
      });
    }
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
