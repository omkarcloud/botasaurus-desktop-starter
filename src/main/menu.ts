import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { isDev } from 'botasaurus-server/env';
import {
  buildMacTemplate,
  buildDefaultTemplate,
  MacMenuItemConstructorOptions,
} from './utils/menu-utils';
import { config } from './config';
import { getSupportSubMenu } from './support-sub-menu';

function getIsDev() {
  // For debugging production errors, uncomment the next line to force development mode
  // return true;
  return isDev;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (getIsDev()) {
      this.setupDevelopmentEnvironment();
    }

    const isMac = process.platform === 'darwin';
    const template = isMac
      ? buildMacTemplate(getIsDev(), config.productName, this.mainWindow)
      : buildDefaultTemplate(getIsDev(), this.mainWindow);

    const subMenuHelp: MacMenuItemConstructorOptions = {
      label: 'Support',
      submenu: getSupportSubMenu(),
    };

    template.push(subMenuHelp);

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }
}
