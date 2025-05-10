import '../../scraper/backend/server';
import '../../scraper/backend/api-config';
import * as path from 'path';
import { writeFile, readFile } from 'botasaurus/output';
import { getAppProps } from 'botasaurus-server/task-routes';
import { isDev } from 'botasaurus-server/env';
import { hasAPI } from './electron-utils'

function generateAppProps() {
  const appProps = getAppProps();
  if (hasAPI()) {
    // @ts-ignore
    appProps.show_api_integration_tab = true
    
  }
  const config = isDev
    ? JSON.stringify(appProps, null, 4)
    : JSON.stringify(appProps);

  // const content = "export const appProps:any = " + config
  const content = `export const appProps = ${config}`;

  const outputFilePath = path.join(
    __dirname,
    'src/renderer/app/utils/app-props.ts',
  );
  // const outputFilePath = path.join(__dirname, "../../", "src/renderer/index.ejs")
  const currentContents = readFile(outputFilePath);

  if (currentContents !== content) {
    writeFile(content, outputFilePath, false);
    console.log('Updated');
  } else {
    console.log('No Update');
  }
}

export { generateAppProps };
