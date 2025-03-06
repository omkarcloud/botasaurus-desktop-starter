import { app, BrowserWindow,Menu, MenuItemConstructorOptions } from 'electron';

export interface MacMenuItemConstructorOptions extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: MacMenuItemConstructorOptions[] | Menu;
  }
export function buildMacTemplate(isDev: boolean, appName: string, mainWindow: BrowserWindow): MenuItemConstructorOptions[] {
  const subMenuAbout: MacMenuItemConstructorOptions = {
    label: appName,
    submenu: [
      {
        label: `About ${appName}`,
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      { type: 'separator' },
      {
        label: `Hide ${appName}`,
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const subMenuEdit: MacMenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };

  const subMenuView: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      ...(isDev
        ? [
            {
              label: 'Reload',
              accelerator: 'Command+R',
              click: () => {
                mainWindow.webContents.reload();
              },
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'Alt+Command+I',
              click: () => {
                mainWindow.webContents.toggleDevTools();
              },
            },
          ]
        : []),
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
    ],
  };

  const subMenuWindow: MacMenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
      { type: 'separator' },
      { label: 'Bring All to Front', selector: 'arrangeInFront:' },
    ],
  };

  return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
}

export function buildDefaultTemplate(isDev: boolean, mainWindow: BrowserWindow): MenuItemConstructorOptions[] {
  const subMenuFile: MenuItemConstructorOptions = {
    label: '&File',
    submenu: [
      {
        label: '&Open',
        accelerator: 'Ctrl+O',
      },
      {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click: () => {
          mainWindow.close();
        },
      },
    ],
  };

  const subMenuView: MenuItemConstructorOptions = {
    label: '&View',
    submenu: isDev
    ? [
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(
              !mainWindow.isFullScreen(),
            );
          },
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
      ]
    : [
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(
              !mainWindow.isFullScreen(),
            );
          },
        },
      ],
  };

  return [subMenuFile, subMenuView];
}