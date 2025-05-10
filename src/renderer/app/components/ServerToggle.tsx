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
    <EuiFormRow className="mb-4 !mt-0" label={`Start API Server on port ${serverPort}`} fullWidth>
      <SwitchField value={isRunning} onChange={handleToggle} />
    </EuiFormRow>
  );
};

export default ServerToggle;
