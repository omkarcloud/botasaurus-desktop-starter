import { BrowserWindow } from "electron"

let mainWindow: BrowserWindow
const setWindow = (win:BrowserWindow|null): void => {
// @ts-ignore
  mainWindow = win
}
const getWindow = (): BrowserWindow => {
  return mainWindow;
}
export {setWindow, getWindow}