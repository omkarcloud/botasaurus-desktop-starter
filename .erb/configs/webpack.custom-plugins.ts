import { writeFile } from "botasaurus/output"
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path';

function getTempPath(): string {
  return path.join(process.cwd(), 'temp.js')
}

function deleteTempFile() {
  // Delete temp file after execution
  try {
    fs.unlinkSync(getTempPath())
  } catch (e) {
    // Ignore delete errors
  }
}

function runCode(contents:string) {
  writeFile(contents, getTempPath(), false)

  exec('node ./temp.js', (error, stdout, stderr) => {
    deleteTempFile()
    
    if (error) {
      console.error(`Error executing temp.js: ${error}`)
      return
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`)
      return
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
          let contents = fixSourceCode(source)
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

function fixSourceCode(source: string) {
  let contents = withGenerateProps(source)

  // Fixes Input JS and README paths
  contents = fixJsPaths(contents)

  // Disable master logging
  contents = disableKubernetes(contents)
  
  return contents
}

function disableKubernetes(contents: string): string {
  return contents.replaceAll('static async enableKubernetes({ masterEndpoint, taskTimeout = master_executor_1.DEFAULT_TASK_TIMEOUT }) {', 'static async enableKubernetes({ masterEndpoint, taskTimeout = master_executor_1.DEFAULT_TASK_TIMEOUT }) {return;')
}

function fixJsPaths(contents: string): string {
  return contents.replaceAll('if (isElectron) {', 'if (false) {')
}

function withGenerateProps(source: string) {
  return source.replace("main() {", "main() {(0,_utils_generate_app_props__WEBPACK_IMPORTED_MODULE_1__.generateAppProps)();return;")
}
