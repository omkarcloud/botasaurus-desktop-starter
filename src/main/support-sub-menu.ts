import { shell, MenuItemConstructorOptions } from 'electron';
import { app, session } from 'electron';
import {
  pathTaskResults,
  targetDirectory,
  db_path,
  id_path,
} from 'botasaurus-server/utils';
import { removeSync } from 'botasaurus/utils';
import { AppUpdater } from './utils/AppUpdater';
import { getBotasaurusStorage } from 'botasaurus/botasaurus-storage';
import { ipcMain } from './utils/ipc-main';
import { Server } from 'botasaurus-server/server';

export function getSupportSubMenu(): MenuItemConstructorOptions[] {
  const supportMenuItems: MenuItemConstructorOptions[] = [];

  if (Server.whatsAppSupport) {
    const { number, countryCallingCode, message } = Server.whatsAppSupport;
    supportMenuItems.push({
      label: 'Contact Support via WhatsApp',
      click() {
        const whatsappNumber = `${countryCallingCode}${number}`;
        const whatsappMessage = encodeURIComponent(message);
        const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappMessage}`;

        shell.openExternal(whatsappURL);
      },
    });
  }

  if (Server.emailSupport) {
    const { email, subject, body } = Server.emailSupport;
    supportMenuItems.push({
      label: 'Contact Support via Email',
      click() {
        const emailSubject = encodeURIComponent(subject);
        const emailBody = encodeURIComponent(body);
        const emailURL = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;

        shell.openExternal(emailURL);
      },
    });
  }

  supportMenuItems.push(
    {
      label: 'Update to Latest Version',
      click() {
        AppUpdater.updateApp();
      },
    },
    {
      label: 'Show User Data',
      click() {
        shell.showItemInFolder(targetDirectory);
      },
    },
    {
      label: 'Factory Reset App and Clear All Data',
      click: () => {
        ipcMain.send('show-reset-prompt');
        ipcMain.once('perform-reset', performFactoryReset);
      },
    },
  );

  return supportMenuItems;
}

function clearRendererStorage() {
  return session.defaultSession.clearStorageData().catch(console.error);
}

function deleteAppData() {
  return removeSync([pathTaskResults, db_path, id_path]);
}

function quitAndReopen() {
  app.relaunch();
  app.quit();
}

async function performFactoryReset() {
  await clearRendererStorage();
  deleteAppData();
  resetStorage();
  quitAndReopen();
}

function resetStorage(): void {
  getBotasaurusStorage().resetStorage();
}
