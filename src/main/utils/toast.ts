/* eslint import/prefer-default-export: off */
import { app } from 'electron';
import { getWindow } from './window';
/* eslint global-require: off, no-console: off, promise/always-return: off */
import { ipcMain } from './ipc-main';

function waitForWindowLoadAndShowToast(channel: string, ...args: any[]) {
  const win = getWindow();
  if (win && !win.webContents.isLoading()) {
    ipcMain.send(channel, ...args);
  } else {
    setTimeout(() => waitForWindowLoadAndShowToast(channel, ...args), 500);
  }
}

export function postToast(channel: string, ...args: any[]) {
  app.whenReady()
    .then(() => waitForWindowLoadAndShowToast(channel, ...args))
    .catch((err) => console.error('postToast error:', err));
}
