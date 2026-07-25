import { EuiLink } from '@elastic/eui/optimize/es/components/link/link';
import { useEffect, useState } from 'react';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { ipcRenderer } from '../utils/electron';
import SwitchField from './inputs/SwitchField';

// Local variables (outside component)
let serverRunning = null;
let serverPort = null;
let serverApiBasePath = null;
let routeAliases = null;

const serverStateListeners = new Set<() => void>();

function notifyServerStateListeners() {
  serverStateListeners.forEach((listener) => listener());
}

export function getApiBasePath():any {
  return serverApiBasePath;
}

export function getPort() {
  return serverPort;
}

export function getURL(port = getPort()): string {
  return `http://127.0.0.1:${port}`;
}

export function getRouteAliases():any {
  return routeAliases;
}

// Listen for server-state globally (outside component), main re-sends it with the actual port when the server starts
ipcRenderer.on('server-state', ({ isRunning, port, apiBasePath, routeAliases: aliases }: any) => {
  serverRunning = isRunning;
  serverPort = port;
  serverApiBasePath = apiBasePath;
  routeAliases = aliases;
  notifyServerStateListeners();
});

export function useServerState() {
  const [state, setState] = useState({ isRunning: serverRunning, port: serverPort });

  useEffect(() => {
    const sync = () => setState({ isRunning: serverRunning, port: serverPort });
    serverStateListeners.add(sync);
    sync(); // catch a server-state that arrived between initial render and mount
    return () => {
      serverStateListeners.delete(sync);
    };
  }, []);

  return state;
}

const ServerToggle = () => {
  const { isRunning, port } = useServerState();

  const handleToggle = (shouldStart) => {
    serverRunning = shouldStart;
    notifyServerStateListeners();

    if (shouldStart) {
      ipcRenderer.send('start-server');
    } else {
      ipcRenderer.send('stop-server');
    }
  };

  return (
    <EuiFormRow className="mb-4 !mt-0" label={<>Start API Server on port <EuiLink target={'_blank'} href={getURL(port) + serverApiBasePath}>{port}</EuiLink></>} fullWidth>
      <SwitchField value={isRunning} onChange={handleToggle} />
    </EuiFormRow>
  );
};

export default ServerToggle;
