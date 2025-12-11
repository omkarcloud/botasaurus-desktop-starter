import { shell, dialog } from 'electron';
import { ipcMain } from './ipc-main';
import * as routes from 'botasaurus-server/task-routes';
import { config } from '../config'

let isBackendSetUp = false;
let isRoutesAdded = false;


function pickId(x) {
  return { id: x.id }
}
export function addRoutesHandler() {
  if (isRoutesAdded) return;

  for (const [key, value] of Object.entries(routes)) {
    if (key === 'createAsyncTask') {
      ipcMain.handle(key, async (_, ...data) => {
      // @ts-ignore
        let result = await value(...data)

        if (!Array.isArray(result)) {
          return pickId(result)
        }

        return [pickId(result[1] ?? result[0])]
      })
    } else {
      // @ts-ignore
      ipcMain.handle(key, (_, ...data) => value(...data))
    }
  }
  isRoutesAdded = true;
}

export function setUpRendererToServerCall() {
  if (isBackendSetUp) return;

  ipcMain.handle('openInFolder', async (_, ...data) => {
    // @ts-ignore
    return shell.showItemInFolder(...data);
  });
  ipcMain.handle('openExternal', async (_, ...data) => {
    // @ts-ignore
    return shell.openExternal(...data);
  });
  ipcMain.handle('dialog:openFolder',  async (_, defaultPath) => {
    const result = await dialog.showOpenDialog({
      title: 'Select a folder',
      buttonLabel: 'Select',
      properties: [
        'openDirectory',
        'createDirectory', // Allow creating new folders (macOS)
        'promptToCreate',  // Prompt to create if doesn't exist (Windows)
      ],
      message: 'Please select a folder', // macOS only

      defaultPath: defaultPath || config.downloadsPath // Falls back to system default if null
    });
    const { canceled, filePaths } = result;
    
    if (!canceled) {
      return filePaths[0];
    }
    return null;
  });

  isBackendSetUp = true;
}

