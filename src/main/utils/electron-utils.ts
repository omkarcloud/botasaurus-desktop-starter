/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import { isDev } from 'botasaurus-server/env'
import { getWindow } from './window';
/* eslint global-require: off, no-console: off, promise/always-return: off */
import { config } from '../config'
import { cleanBasePath } from 'botasaurus-server/utils'

export function restoreAndFocusMainWindow() {
    const w = getWindow()
    if (w) {
      if (w.isMinimized()) {w.restore()}
        w.focus()
    }
  }


  export function registerDeepLinkProtocol() {
    let electronAppUniversalProtocolClient
    try {
      electronAppUniversalProtocolClient = require('./electron-app-universal-protocol-client').default
      electronAppUniversalProtocolClient.on(
        'request',
        (url)=>{
          restoreAndFocusMainWindow()
          if (url.includes('target-url')) {
            console.log(url)
            // TODO: Write code to handle app specific deeplinks
            
          }
        },
      );
       return electronAppUniversalProtocolClient.initialize({
        protocol: config.protocol,
        mode: isDev ? 'development': 'production', // Make sure to use 'production' when script is executed in bundled app
      });
  
    } catch (e) {
      console.log('electronAppUniversalProtocolClient not found')
    }     
  }

export function enableElectronDebugTools() {
    require('electron-debug')({ showDevTools: true })

} 
export function resolveHtmlPath(htmlFileName: string) {
  if (isDev) {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}


let cachedResourcesPath: string | null = null;

function getResourcesPath(): string {
    if (!cachedResourcesPath) {
        cachedResourcesPath = app.isPackaged
            ? path.join(process.resourcesPath, 'assets')
            : path.join(__dirname, '../../assets');
    }
    return cachedResourcesPath;
}
export const getAssetPath = (...paths: string[]): string => {
return path.join(getResourcesPath(), ...paths);
};

export function getApiArgs() {
  const args = process.argv
  // Parse arguments
  let port: number = null as any; // default
  let onlyRunApi = false;
  let hasServerArguments = false;
  let apiBasePath: string  = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      hasServerArguments = true;
      if (i + 1 < args.length) {
        try {
          port = parseInt(args[i + 1]);
          if (port > 1) {
            i++;
          }
        } catch (error) {
          console.error(port);
        }
      }
    } else if (args[i] === '--only-start-api') {
      hasServerArguments = true;
      onlyRunApi = true;
    } else if (args[i] === '--api-base-path') {
      hasServerArguments = true;
      if (i + 1 < args.length) {
        if (args[i + 1]) {
          apiBasePath = cleanBasePath(args[i + 1]) as any  
        }
        i++;
      }
    }
  }
  return { port, onlyRunApi, hasServerArguments, apiBasePath};
}


/**
 * Checks if the API configuration is available globally.
 * @returns {boolean} - Returns true if `global.ApiConfig` exists, otherwise false.
 */
export function hasAPI(): boolean {
  // @ts-ignore
  return  global.ApiConfig !== undefined;
}


export function getAPI(): any {
  // @ts-ignore
  return  global.ApiConfig;
}
export function startServer(...args: any[]): any {
  // @ts-ignore
  return global.startServer(...args);
}

export function stopServer(): any {
  // @ts-ignore
  return  global.stopServer();
}

export function createRouteAliasesObj(API: any) {
  const routeAliases = API.routeAliases
  const routeAliasesObj: Record<string, string[]> = {}
  for (const [fn, aliases] of routeAliases.entries()) {
    if (typeof fn === 'function' && fn.__name__) {
      routeAliasesObj[fn.__name__] = aliases
    }
  }
  return routeAliasesObj
}