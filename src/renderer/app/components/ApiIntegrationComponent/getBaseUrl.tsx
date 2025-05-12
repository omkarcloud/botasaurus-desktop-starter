import { getPort, getURL } from '../ServerToggle'

export function getBaseUrl(): string {
  const port = getPort()
  if (port !== 8000) {
    return getURL(port)
  }
  return ''
}
