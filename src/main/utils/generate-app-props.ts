import fs from 'fs';
import '../../scraper/backend/server';
import '../../scraper/backend/api-config';
import * as path from 'path';
import { writeFile, readFile } from 'botasaurus/output';
import { getAppProps } from 'botasaurus-server/task-routes';
import { isDev } from 'botasaurus-server/env';
import { hasAPI } from './electron-utils'

/**
 * Check if a JavaScript string has valid syntax using Function constructor
 * @param {string} codeString - The JavaScript code to validate
 * @param {boolean} strictMode - Whether to check in strict mode
 * @returns {{isValid: boolean, error?: Error, errorDetails?: object}}
 */
function isValidJavaScriptSyntaxFunction(codeString) {
  try {
    const code = `"use strict";\nconst a =${codeString}`;
    // Create a function without calling it
    new Function(code);
    return true
  } catch (error) {
    return false
  }
}

  function makeScraperToInputJs(appProps: { scrapers: any[] }): [string, boolean] {
    let scraperToInputJs = ''
    appProps.scrapers.forEach(scraper => {
      scraperToInputJs += `\n    "${scraper.scraper_name}": (controls) => {
${scraper.input_js}
        return getInput(controls);
    },`

      // Remove input_js from scraper object after processing
      delete scraper['input_js']
    })

    const asObject = `{${scraperToInputJs}\n};`



    // Wrap in module export
    const isValid = isValidJavaScriptSyntaxFunction(asObject)
    scraperToInputJs = `export default ${asObject}`
    return [scraperToInputJs, isValid]
  }


function writeFiles(scraperToInputJs: string) {
  const rendererScraperPath = path.join(
    __dirname,'../../',
    'src/renderer/app/utils/scraper-to-input-js.ts'
  )
  const currentRendererScraperContents = readFile(rendererScraperPath)
  if (currentRendererScraperContents !== scraperToInputJs) {
    writeFile(scraperToInputJs, rendererScraperPath, false)
    console.log('Updated renderer scraperToInputJs')
  }

  // Write scraperToInputJs file to main process
  const mainScraperPath = path.join(
    __dirname,'../../',
    'src/main/utils/scraper-to-input-js.ts'
  )
  const currentMainScraperContents = readFile(mainScraperPath)
  if (currentMainScraperContents !== scraperToInputJs) {
    writeFile(scraperToInputJs, mainScraperPath, false)
    console.log('Updated main scraperToInputJs')
  }
}
function getProductNameFromPackageJson() {
  let data = fs.readFileSync('./package.json', { encoding: 'utf-8' });
  data = JSON.parse(data);
  return [data['productName'], data['name']];
}

function writeConfig(productName: any, name: any) {
  /**
   * Updates the main config file with the provided product name and protocol name.
   * @param productName - The product name to set in the config.
   * @param name - The protocol name to set in the config.
   */
    
    const configPath = path.join(__dirname,'../../', 'src/main/config.ts')
    const configContent = readFile(configPath)

    const newConfigContent = configContent.replace(/productName:.*$/m, `productName: "${productName}",`).replace(/protocol:.*$/m, `protocol: "${name}",`)

    if (newConfigContent !== configContent) {
          writeFile(newConfigContent, configPath, false)
    }
  }


function generateAppProps() {
  const [productName, name] = getProductNameFromPackageJson()
  

  const appProps = getAppProps();
    appProps['productName'] = productName
  
  if (hasAPI()) {
    // @ts-ignore
    appProps.show_api_integration_tab = true
  }

  // Build scraperToInputJs string
  let [scraperToInputJs, isInputJsValid] = makeScraperToInputJs(appProps)

  if (!isInputJsValid){
    return
  }

  

  // Write scraperToInputJs file to renderer process
  writeFiles(scraperToInputJs)

  const props = isDev
    ? JSON.stringify(appProps, null, 4)
    : JSON.stringify(appProps);

  const content = `export const appProps = ${props}`;

  const outputFilePath = path.join(
    __dirname,'../../',
    'src/renderer/app/utils/app-props.ts',
  );
  const currentContents = readFile(outputFilePath);

  if (currentContents !== content) {
    writeFile(content, outputFilePath, false);
  }
  writeConfig(productName, name)
}

export { generateAppProps };