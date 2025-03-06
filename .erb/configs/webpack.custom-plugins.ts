import { writeFile } from "botasaurus/output"
import { exec } from 'child_process'
import * as path from 'path'

function runCode(contents) {
  writeFile(contents, path.join(__dirname, "../../", "temp.js"), false)
  // Execute temp.js using Node.js
  exec('node temp.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing temp.js: ${error}`)
      return
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
    }
  })
}

function getAssetNames(assets) {
  const ls:any[] = []
  for (const assetName in assets) {
    ls.push(assetName)
  }
  return ls
}

export class LogContentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('LogContentsPlugin', async (compilation, callback) => {
 const compAssets = compilation.assets
    // console.log(getAssetNames(compAssets))
  for (const assetName in compAssets) {
        const targetFiles = ["main.bundle.dev.js",
          //  "main.js",
          ]
        if (targetFiles.includes( assetName ) ){
          const asset = compAssets[assetName]
          const source:string = asset.source()
          // make dev, and also fix resolve errors of bota server
          let contents = source.replace("process.env.CREATE_API_CONFIG", "true")
          // fix native modules imports
          contents = contents.replaceAll('factory(require("', 'factory(require("./release/app/node_modules/')
          // factory(require("
          try {
            // console.log("Updating index.html")
            runCode(contents)
          } catch (error) {
            console.error(error)
          }
        }
      }
      // console.log(JSON.stringify(ls))
      callback()
    })
  }
}

