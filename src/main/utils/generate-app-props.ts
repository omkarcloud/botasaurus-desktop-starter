import '../../scraper/backend/server';
import '../../scraper/backend/api-config';
import * as path from 'path';
import { writeFile, readFile } from 'botasaurus/output';
import { getAppProps } from 'botasaurus-server/task-routes';
import { isDev } from 'botasaurus-server/env';
import { hasAPI } from './electron-utils'
import { config } from '../config'

  function makeScraperToInputJs(appProps: { scrapers: any[] }) {
    let scraperToInputJs = ''
    appProps.scrapers.forEach(scraper => {
      scraperToInputJs += `\n    "${scraper.scraper_name}": (controls) => {
${scraper.input_js}
        return getInput(controls);
    },`

      // Remove input_js from scraper object after processing
      delete scraper['input_js']
    })

    // Wrap in module export
    scraperToInputJs = `export default {${scraperToInputJs}\n};`
    return scraperToInputJs
  }


function writeFiles(scraperToInputJs: string) {
  const rendererScraperPath = path.join(
    __dirname,
    'src/renderer/app/utils/scraper-to-input-js.ts'
  )
  const currentRendererScraperContents = readFile(rendererScraperPath)
  if (currentRendererScraperContents !== scraperToInputJs) {
    writeFile(scraperToInputJs, rendererScraperPath, false)
    console.log('Updated renderer scraperToInputJs')
  }

  // Write scraperToInputJs file to main process
  const mainScraperPath = path.join(
    __dirname,
    'src/main/utils/scraper-to-input-js.ts'
  )
  const currentMainScraperContents = readFile(mainScraperPath)
  if (currentMainScraperContents !== scraperToInputJs) {
    writeFile(scraperToInputJs, mainScraperPath, false)
    console.log('Updated main scraperToInputJs')
  }
}

function generateAppProps() {
  const appProps = getAppProps();
  appProps['productName'] = config.productName
  
  if (hasAPI()) {
    // @ts-ignore
    appProps.show_api_integration_tab = true
  }

  // Build scraperToInputJs string
  let scraperToInputJs = makeScraperToInputJs(appProps)

  // Write scraperToInputJs file to renderer process
  writeFiles(scraperToInputJs)

  const props = isDev
    ? JSON.stringify(appProps, null, 4)
    : JSON.stringify(appProps);

  // const content = "export const appProps:any = " + config
  const content = `export const appProps = ${props}`;

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
