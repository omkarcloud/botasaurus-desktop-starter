/* eslint global-require: off, no-console: off, promise/always-return: off */
import { config } from './config'
import { generateAppProps } from './utils/generate-app-props'
import { app, BrowserWindow, powerSaveBlocker, shell } from 'electron'
import path from 'path'
import { addRoutesHandler, setUpRendererToServerCall } from './utils/set-up-renderer-to-server-call'
import { isDev, isMaster, isWorker } from 'botasaurus-server/env'
import { initAutoIncrementDb } from 'botasaurus-server/models'
import {getAssetPath, resolveHtmlPath, enableElectronDebugTools, registerDeepLinkProtocol, restoreAndFocusMainWindow, getApiArgs, getAPI, startServer, stopServer, createRouteAliasesObj } from './utils/electron-utils'
import MenuBuilder from './menu'
import { onClose } from "botasaurus/on-close";
import { getWindow, setWindow } from './utils/window'
import scraperToInputJs from './utils/scraper-to-input-js'
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


function exitHandler(options) {
  if (options.cleanup) {
    // 1. Stop accepting new requests
    stopServer()
    
    // 2. Release in-progress tasks back to master (K8s worker only)
    if (global.cleanupWorker) {
      global.cleanupWorker(options.signal || 'shutdown')
    }
    
    // 3. Close all Chrome instances
    if (global.closeAllChromes) {
      global.closeAllChromes()
    }
  }
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {cleanup:true, exit:true}));
process.on('SIGTERM', exitHandler.bind(null, {cleanup:true, exit:true}));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {cleanup:true, exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {cleanup:true, exit:true}));

process.on('uncaughtException', exitHandler.bind(null, {cleanup:true, exit:true}));


let powerSaveId;


function main() {

  const apiArgs = getApiArgs()

  if (isWorker) {
    console.log('[APP] Starting in Worker mode, without Api')
    console.log(`[Worker] Started with PID: ${process.pid}`);
    initDbAndExecutor(null)
    return;
  }

  if (config.isDev) {
    generateAppProps();
  }

  if (!app) {
    return;
  }

  registerDeepLinkProtocol()

  const gotTheLock = app.requestSingleInstanceLock();

  if (gotTheLock) {
    runAppAndApi(apiArgs)
    return;
  }

  console.log('[APP] App already running, closing this instance')
  app.quit();
}
main()


function runAppAndApi(apiArgs: ReturnType<typeof getApiArgs>) {
  const { port, onlyRunApi, hasServerArguments, apiBasePath, } = apiArgs
  const API = getAPI()
  
  let finalPORT:number
  let onQuit

  if (isMaster && !API) {
    throw new Error(
`The API is not enabled in "api-config.ts".
To enable it:
1. Follow the instructions at:
   https://www.omkar.cloud/botasaurus/docs/botasaurus-desktop/botasaurus-desktop-api/adding-api#how-to-add-an-api-to-your-app`
    );
  }
  if (API) {
    finalPORT = port || API.apiPort
    onQuit = stopServer

    if (API.apiOnlyMode || onlyRunApi) {
       
       return runAppWithoutWindow(onQuit, () => {
        return startServer(finalPORT, Server.getScrapersConfig(), apiBasePath || API.apiBasePath, createRouteAliasesObj(API), Server.cache)
      })
    }
  } else if (hasServerArguments) {
    console.error('Kindly enable the API in "api-config.ts" before passing API arguments.');
    app.exit(1);
  }
  runApp(onQuit, () => {
    if (API) {
      ipcMain.on('start-server', () => {
        getBotasaurusStorage().setItem('shouldStartServer', true)
        startServer(finalPORT, Server.getScrapersConfig(), apiBasePath || API.apiBasePath, createRouteAliasesObj(API), Server.cache)
      })

      ipcMain.on('stop-server', () => {
        getBotasaurusStorage().setItem('shouldStartServer', false)
        stopServer()
      })
        const shouldStartServer = getBotasaurusStorage().getItem('shouldStartServer', API.autoStart)
        ipcMain.send('server-state', { isRunning: shouldStartServer, port: finalPORT,  apiBasePath: apiBasePath || API.apiBasePath, routeAliases:createRouteAliasesObj(API) })
        if (shouldStartServer) {
          startServer(finalPORT, Server.getScrapersConfig(), apiBasePath || API.apiBasePath, createRouteAliasesObj(API), Server.cache)
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
  addRoutesHandler()
  
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
    onWindowMade?.()
    runFn?.()
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

}



async function initDbAndExecutor(onReady) {
  
      await initAutoIncrementDb()
      // Set the scraper input functions
      Server.setScraperToInputJs(scraperToInputJs); 
      await run()
      if (onReady) {
        await onReady()  
      }
      
      checkMasterHealth()
      // Remove this if your app does not use auto updates
      // eslint-disable-next-line
      if (!config.isDev && !isWorker && !isMaster) {
        AppUpdater.init()
      }
  
}
/*
  If in K8s, check if the master is healthy
  If the master is not healthy, app will exit
*/
function checkMasterHealth() {
  if (global.checkMasterHealth) {
    global.checkMasterHealth()
  }
}

function runApp(onQuit, onWindowMade) {
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
        return initDbAndExecutor(null)
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
        await onQuit?.()
      })
    })
    .catch(console.log)
}

function runAppWithoutWindow(onQuit, onReady) {
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
      initDbAndExecutor(onReady)

      powerSaveId = powerSaveBlocker.start('prevent-app-suspension')

      app.on('before-quit', async () => {
        if (powerSaveId) {
          if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId)
          }
        }
        await onClose()
        await onQuit?.()
        
      })
    })
    .catch(console.log)
}