/* eslint global-require: off, no-console: off, promise/always-return: off */
import './config'
import { app, BrowserWindow, powerSaveBlocker, shell } from 'electron'
import path from 'path'
import { setUpRendererToServerCall } from './utils/set-up-renderer-to-server-call'
import { isDev } from 'botasaurus-server/env'
import { initAutoIncrementDb } from 'botasaurus-server/models'
import {getAssetPath, resolveHtmlPath, enableElectronDebugTools, registerDeepLinkProtocol, restoreAndFocusMainWindow } from './utils/electron-utils'
import { generateApiConfig } from './utils/generate-api-config'
import MenuBuilder from './menu'
import { onClose } from "botasaurus/on-close";
import { getWindow, setWindow } from './utils/window'

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { AppUpdater } from './utils/AppUpdater'


let powerSaveId;

if (process.env.CREATE_API_CONFIG) {
  generateApiConfig();
} else {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    
    registerDeepLinkProtocol()
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      restoreAndFocusMainWindow()
    });
    

    if (isDev) {
      enableElectronDebugTools()
    }

    const createWindow = async () => {
      const mainWindow = new BrowserWindow({
        show: false,
        // fullscreen: !isDev, // Set the window to open in full screen mode
        // autoHideMenuBar: true, // Automatically hide the menu bar

        icon: getAssetPath('icon.png'),
        webPreferences: {
          backgroundThrottling: false,
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
      });
      setWindow(mainWindow);
      mainWindow.loadURL(resolveHtmlPath('index.html'));
      setUpRendererToServerCall();

      mainWindow.on('ready-to-show', () => {
        if (!getWindow()) {
          throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
          getWindow().minimize();
        } else {
          getWindow().show();
        }
      });

      mainWindow.on('closed', () => {
        setWindow(null)
      });


      const menuBuilder = new MenuBuilder(getWindow());
      menuBuilder.buildMenu();

      // Open urls in the user's browser
      mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
      });

      // Remove this if your app does not use auto updates
      // eslint-disable-next-line
      AppUpdater.init()
    };

    /**
     * Add event listeners...
     */

    app.on('window-all-closed', () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app
      .whenReady()
      .then(() => {
        createWindow();
        initAutoIncrementDb()
        
        powerSaveId = powerSaveBlocker.start('prevent-app-suspension');

        app.on('activate', () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (getWindow() === null) createWindow();
        });
        app.on('before-quit', async () => {
          // 
          if (powerSaveId) {
            if (powerSaveBlocker.isStarted(powerSaveId)) {
              powerSaveBlocker.stop(powerSaveId);
            }            
          }
          await onClose()
        });
      })
      .catch(console.log);
  }
}
