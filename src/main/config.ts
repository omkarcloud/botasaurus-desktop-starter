import { app } from 'electron';

const isDev: boolean =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const config = {
  productName: "Todo My App Name",
  protocol: "todo-my-app-name",
  downloadsPath: app ? app.getPath('downloads') : process.cwd(),
  userDataPath: app ? app.getPath('userData') : process.cwd(),
  isDev: isDev,
};

global.ELECTRON_CONFIG = config;
