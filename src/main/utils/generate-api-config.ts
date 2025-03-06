import '../../scraper/backend/server'
import * as path from 'path'
import { writeFile, readFile } from "botasaurus/output"
import { getApiConfig } from 'botasaurus-server/task-routes'
import { isDev } from 'botasaurus-server/env'

function generateApiConfig() {
  const newLocal = getApiConfig()

    const config =  isDev? JSON.stringify(newLocal, null, 4):JSON.stringify(newLocal)

    // const content = "export const apiConfig:any = " + config
    const content = `export const apiConfig = ${config}`
    
    const outputFilePath = path.join(__dirname,  "src/renderer/app/utils/api-config.ts")
    // const outputFilePath = path.join(__dirname, "../../", "src/renderer/index.ejs")
    const currentContents = readFile(outputFilePath)
    
    
    if (currentContents !== content) {
      writeFile(content, outputFilePath, false)  
      console.log("Updated")
    } else {
      console.log("No Update")
    }
  }
  generateApiConfig
  
  export { generateApiConfig}