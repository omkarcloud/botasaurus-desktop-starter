import { shell } from 'electron';
import run from 'botasaurus-server/run';
import { MainHandler } from './main-handler';
import * as routes from 'botasaurus-server/task-routes';
import setUpErrorForwardingToRenderer from './set-up-error-forwarding-to-renderer';

let isBackendSetUp = false;



export function setUpRendererToServerCall() {
  if (isBackendSetUp) return;
  isBackendSetUp = true;
  setUpErrorForwardingToRenderer();

  for (const [key, value] of Object.entries(routes)) {
    MainHandler.handle(key, async (_, ...data) => {
      // @ts-ignore
      const result = await value(...data);
      // writeTempJson(result)
      return result;
    });
  }
  MainHandler.handle('openInFolder', async (_, ...data) => {
    // @ts-ignore
    return shell.showItemInFolder(...data);
  });
  MainHandler.handle('openExternal', async (_, ...data) => {
    // @ts-ignore
    return shell.openExternal(...data);
  });

  run();
}
