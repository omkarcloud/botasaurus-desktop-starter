import { writeFile } from "botasaurus/output"
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path';

function getTempPath(): string {
  return path.join(process.cwd(), 'temp.js')
}

function runCode(contents:string) {
  writeFile(contents, getTempPath(), false)

  exec('node ./temp.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing temp.js: ${error}`)
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
    }
    // Delete temp file after execution
    try {
      fs.unlinkSync(getTempPath())
    } catch (e) {
      // Ignore delete errors
    }
  })
}

export class GenerateApiPropsPlugin {
  apply(compiler:any) {
    compiler.hooks.emit.tapAsync('GenerateApiPropsPlugin', async (compilation:any, callback:any) => {
 const compAssets = compilation.assets
  for (const assetName in compAssets) {
        const targetFiles = ["main.bundle.dev.js"]
        if (targetFiles.includes( assetName ) ){
          const asset = compAssets[assetName]
          const source:string = asset.source()
          let contents = source.replace("main() {", "main() {(0,_utils_generate_app_props__WEBPACK_IMPORTED_MODULE_1__.generateAppProps)();return;")


          // Fixes Input JS and README paths
          contents = contents.replaceAll('if (isElectron) {', 'if (false) {')
          
          // Disable master logging
          contents = contents.replaceAll('static async enableKubernetes({ masterEndpoint, taskTimeout = master_executor_1.DEFAULT_TASK_TIMEOUT }) {', 'static async enableKubernetes({ masterEndpoint, taskTimeout = master_executor_1.DEFAULT_TASK_TIMEOUT }) {return;')
          contents = contents.replaceAll('factory(require("', 'factory(require("./release/app/node_modules/')
          // Sentry FIX
          contents = contents.replace('function __webpack_require__(moduleId) {', 'function __webpack_require__(moduleId) {if (moduleId.includes("sentry")){return {}};')
          try {
            runCode(contents)
          } catch (error) {
            console.error(error)
          }
        }
      }
      callback()
    })
  }
}

