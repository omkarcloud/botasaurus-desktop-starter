import fs from 'fs';
import { app } from 'electron';

const isDev: boolean =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

function getProductNameFromPackageJson() {
  let data = fs.readFileSync('./package.json', { encoding: 'utf-8' });
  data = JSON.parse(data);
  return data['productName'] ?? data['name'];
}

export const config = {
  productName: app ? app.getName() : getProductNameFromPackageJson(),
  downloadsPath: app ? app.getPath('downloads') : process.cwd(),
  userDataPath: app ? app.getPath('userData') : process.cwd(),
  protocol: 'todo-my-app-name',
  isDev: isDev,
};

global.ELECTRON_CONFIG = config;
