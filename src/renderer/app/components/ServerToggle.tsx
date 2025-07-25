import { EuiLink } from '@elastic/eui/optimize/es/components/link/link';
import { useState } from 'react';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { ipcRenderer } from '../utils/electron';
import SwitchField from './inputs/SwitchField';

// Local variables (outside component)
let serverRunning = null;
let serverPort = null;
let serverApiBasePath = null;
let routeAliases = null;

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

// Listen for server-state once globally (outside component)
ipcRenderer.once('server-state', ({ isRunning, port, apiBasePath, routeAliases: aliases }: any) => {
  serverRunning = isRunning;
  serverPort = port;
  serverApiBasePath = apiBasePath;
  routeAliases = aliases;
});


const ServerToggle = () => {
  const [isRunning, setIsRunning] = useState(serverRunning);

  const handleToggle = (shouldStart) => {
    setIsRunning(shouldStart);
    serverRunning = shouldStart;

    if (shouldStart) {
      ipcRenderer.send('start-server');
    } else {
      ipcRenderer.send('stop-server');
    }
  };

  return (
    <EuiFormRow className="mb-4 !mt-0" label={<>Start API Server on port <EuiLink target={'_blank'} href={getURL(serverPort) + serverApiBasePath}>{serverPort}</EuiLink></>} fullWidth>
      <SwitchField value={isRunning} onChange={handleToggle} />
    </EuiFormRow>
  );
};

export default ServerToggle;
