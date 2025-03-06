/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import { isDev } from 'botasaurus-server/env'
import { getWindow } from './window';
/* eslint global-require: off, no-console: off, promise/always-return: off */
import { config } from '../config'

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
