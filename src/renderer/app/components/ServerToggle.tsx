import { EuiLink } from '@elastic/eui/optimize/es/components/link/link';
import { useState } from 'react';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { ipcRenderer } from '../utils/electron';
import SwitchField from './inputs/SwitchField';

// Local variables (outside component)
let serverRunning = null;
let serverPort = null;

export function getPort() {
  return serverPort
}

export function getURL(port = getPort()): string {
  return `http://127.0.0.1:${port}`
}

// Listen for server-state once globally (outside component)
ipcRenderer.once('server-state', ({ isRunning, port }: any) => {
  serverRunning = isRunning;
  serverPort = port;
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
    <EuiFormRow className="mb-4 !mt-0" label={<div>Start API Server on port <EuiLink target={'_blank'} href={getURL(serverPort)}>{serverPort}</EuiLink></div>} fullWidth>
      <SwitchField value={isRunning} onChange={handleToggle} />
    </EuiFormRow>
  );
};

export default ServerToggle;
