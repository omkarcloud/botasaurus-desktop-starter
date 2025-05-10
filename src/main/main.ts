/* eslint global-require: off, no-console: off, promise/always-return: off */
import './config'
import { generateAppProps } from './utils/generate-app-props'
import { app, BrowserWindow, powerSaveBlocker, shell } from 'electron'
import path from 'path'
import { setUpRendererToServerCall } from './utils/set-up-renderer-to-server-call'
import { isDev } from 'botasaurus-server/env'
import { initAutoIncrementDb } from 'botasaurus-server/models'
import {getAssetPath, resolveHtmlPath, enableElectronDebugTools, registerDeepLinkProtocol, restoreAndFocusMainWindow, getApiArgs, getAPI, startServer, stopServer } from './utils/electron-utils'
import MenuBuilder from './menu'
import { onClose } from "botasaurus/on-close";
import { getWindow, setWindow } from './utils/window'
import run from 'botasaurus-server/run';
import { Server } from 'botasaurus-server/server';

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { AppUpdater } from './utils/AppUpdater'
import { getBotasaurusStorage } from 'botasaurus/botasaurus-storage'
import { ipcMain } from './utils/ipc-main'

// Get all command line arguments
let powerSaveId;

if (process.env.CREATE_API_CONFIG) {
  generateAppProps();
} else {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    runAppAndApi()
  }
}

function closeServerOnExit() {

function exitHandler(options, exitCode) {
  if (options.cleanup) {
    stopServer()
  };
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

  
}

function runAppAndApi() {
  const API = getAPI()
  let { port, onlyRunApi, hasServerArguments } = getApiArgs()
  let finalPORT:number
  let onQuit
  if (API) {
    finalPORT = port || API.apiPort
    onQuit = stopServer

    if (API.apiOnlyMode || onlyRunApi ) {
       
       return runAppWithoutWindow(onQuit, () => {
        closeServerOnExit()
        startServer(finalPORT, Server.getScrapersConfig())
      })
    }
  } else if (hasServerArguments) {
    throw new Error('Kindly enable the server following https://github.com/microsoft/playwright/issues/13288 before passing server arguments')
  }
  runApp(onQuit, () => {
    if (API) {
      closeServerOnExit()
      ipcMain.on('start-server', () => {
        getBotasaurusStorage().setItem('shouldStartServer', true)
        startServer(finalPORT, Server.getScrapersConfig())
      })

      ipcMain.on('stop-server', () => {
        getBotasaurusStorage().setItem('shouldStartServer', false)
        stopServer()
      })
        const shouldStartServer = getBotasaurusStorage().getItem('shouldStartServer', API.autoStart)
        ipcMain.send('server-state', { isRunning: shouldStartServer, port: finalPORT })
        if (shouldStartServer) {
          startServer(finalPORT, Server.getScrapersConfig())
      }

    }
  })
}

const createWindow = async (onWindowMade, runFn) => {
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
  })
  setWindow(mainWindow)
  mainWindow.loadURL(resolveHtmlPath('index.html'))
  setUpRendererToServerCall()
  

  mainWindow.on('ready-to-show', () => {
    if (!getWindow()) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      getWindow().minimize()
    } else {
      getWindow().show()
    }
    runFn?.()
    onWindowMade?.()
  })

  mainWindow.on('closed', () => {
    setWindow(null)
  })


  const menuBuilder = new MenuBuilder(getWindow())
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  AppUpdater.init()
}

function runApp(onQuit, onWindowMade) {
  registerDeepLinkProtocol()
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    restoreAndFocusMainWindow()
  })


  if (isDev) {
    enableElectronDebugTools()
  }

  /**
   * Add event listeners...
   */
  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app
    .whenReady()
    .then(() => {
      createWindow(onWindowMade, () => {
        run()
        initAutoIncrementDb()
      })
      powerSaveId = powerSaveBlocker.start('prevent-app-suspension')

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (getWindow() === null) createWindow(null, null)
      })
      app.on('before-quit', async () => {
        if (powerSaveId) {
          if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId)
          }
        }

        await onClose()
        await onQuit()
      })
    })
    .catch(console.log)
}

function runAppWithoutWindow(onQuit, onReady) {
  registerDeepLinkProtocol()
  if (isDev) {
    enableElectronDebugTools()
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app
    .whenReady()
    .then(() => {
      run()
      initAutoIncrementDb()
      onReady()

      powerSaveId = powerSaveBlocker.start('prevent-app-suspension')

      app.on('before-quit', async () => {
        if (powerSaveId) {
          if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId)
          }
        }
        await onQuit()
        await onClose()
        
      })
    })
    .catch(console.log)
}