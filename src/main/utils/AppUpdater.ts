import { autoUpdater } from 'electron-updater';
import { ipcMain } from './ipc-main'
import { sleep } from 'botasaurus/utils';
import { getOs } from 'botasaurus/env';


function getCurrentVersion() {
  return autoUpdater.currentVersion.toString()
}

function canUpdate(result) {
  return result && result.updateInfo && result.updateInfo.version !== getCurrentVersion()
}

class _AppUpdater {
  private initialized: boolean = false;

  constructor() {}

  init() {
    
    if (this.initialized) {
      return;
    }

    if (this.isWindows()) {
      return;
    }

    this.initialized = true;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    try {
      this.listenEvents();
      autoUpdater.checkForUpdates()
    } catch (error) {
      console.error(error);
    }
  }

  private isWindows() {
    return getOs() === 'windows'
  }

  async listenEvents(){

      // autoUpdater.on('checking-for-update', () => {
      //   ipcMain.log('Checking for updates...');
      // });

      autoUpdater.on('update-available', (info) => {
        ipcMain.log('Update available:', info);
        // Only Download the Latest Version
        autoUpdater.downloadUpdate();
      });

      // autoUpdater.on('update-not-available', (info) => {
      //   ipcMain.log('Update not available:', info);
      // });

      autoUpdater.on('error', (err) => {
        ipcMain.log('Error in auto-updater:', err);
      });

      autoUpdater.on('update-downloaded', (info) => {
        ipcMain.log('Update downloaded:', info);
      });    
  }

  async updateApp() {
    this.init()

    if (this.isWindows()) {
      return;
    }

    try {
      ipcMain.send('checkingForUpdates')
      const startTime = Date.now();
      const result = await autoUpdater.checkForUpdates();
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime < 2000) {
        await sleep(2)
      }
      if (canUpdate(result)) {
        ipcMain.send('downloadingUpdates')
        await autoUpdater.downloadUpdate(); // Start downloading the update
        ipcMain.send('quittingToApplyUpdates')
        // wait for 10 seconds
        await sleep(10)
        ipcMain.send('hideAll')
  
        autoUpdater.quitAndInstall(false, true); // Quit and install the update
        ipcMain.log('Updated')
      } else {
        ipcMain.send('success', getCurrentVersion())
      }
    } catch (error) {
      console.error(error)
      ipcMain.send('hideAll')
    }
  }
}

const AppUpdater = new _AppUpdater();

export { AppUpdater };
