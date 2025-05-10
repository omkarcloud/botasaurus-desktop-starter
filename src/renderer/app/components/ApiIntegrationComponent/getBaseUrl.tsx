import { getPort } from '../ServerToggle'

export function getBaseUrl(): string {
  const port = getPort()
  if (port !== 8000) {
    return `http://127.0.0.1:${port}`
  }
  return ''
}
