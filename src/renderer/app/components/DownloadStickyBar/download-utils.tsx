import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiForm } from '@elastic/eui/optimize/es/components/form/form';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';
import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalHeader } from '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { EuiToolTip } from '@elastic/eui/optimize/es/components/tool_tip/tool_tip';
import { useState } from 'react';

import ClickOutside from '../ClickOutside/ClickOutside';
import CheckboxField from '../inputs/CheckBoxField';
import Tabs from '../Tabs/Tabs';
import { openFolderPicker } from '../../utils/electron';

export interface DownloadPreferences {
  format: string;
  convert_to_english: boolean;
  downloadFolder: string | null;
}

export function getDownloadPrefs(): DownloadPreferences {
  if (typeof window === 'undefined') {
    return { format: 'csv', convert_to_english: true, downloadFolder: null };
  }

  let downloadPreference: DownloadPreferences;
  try {
    downloadPreference = JSON.parse(
      localStorage.getItem('download_preference') ||
        '{"format": "csv", "convert_to_english": true, "downloadFolder": null}'
    );
  } catch (error) {
    console.error('Error parsing download preferences:', error);
    downloadPreference = { format: 'csv', convert_to_english: true, downloadFolder: null };
  }
  return downloadPreference;
}

export let downloadPrefs = getDownloadPrefs();

export function updateDownloadPrefs(change: DownloadPreferences) {
  downloadPrefs = change;
  localStorage.setItem('download_preference', JSON.stringify(change));
}

export const FORMAT_TABS = [
  {
    id: 'excel',
    name: 'Excel',
    content: <></>,
  },
  {
    id: 'csv',
    name: 'CSV',
    content: <></>,
  },
  {
    id: 'json',
    name: 'JSON',
    content: <></>,
  },
  {
    id: 'ndjson',
    name: 'NDJSON',
    content: <></>,
  },
];

function isWindowsBrowser() {
  return navigator.platform.indexOf('Win') > -1;
}

export function getSeparator(): string {
  return isWindowsBrowser() ? '\\' : '/';
}

export const DownloadForm = ({
  onSubmit,
  productName,
}: {
  onSubmit: (data: DownloadPreferences) => void;
  productName: string;
}) => {
  const [state, setState] = useState(getDownloadPrefs);

  function onTabClick(selectedTab: { id: string }) {
    const change = {
      ...state,
      format: selectedTab.id,
    };
    updateDownloadPrefs(change);
    setState(change);
  }

  function handleCheckboxChange(e: boolean) {
    const change = {
      ...state,
      convert_to_english: e,
    };
    updateDownloadPrefs(change);
    setState(change);
  }

  async function handleDownloadFolderChange() {
    try {
      const folderPath = await openFolderPicker(state.downloadFolder);
      if (folderPath) {
        const change = {
          ...state,
          downloadFolder: folderPath,
        };
        updateDownloadPrefs(change);
        setState(change);
      }
    } catch (error) {
      console.error('Error selecting download folder:', error);
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateDownloadPrefs(state);
    if (onSubmit) {
      onSubmit(state);
    }
  };

  const downloadLabel = `Save downloads to folder: ${state.downloadFolder ?? 'Downloads'}${getSeparator()}${productName}`;

  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiFormRow className="remove-tabs-bottom-border" label="Format" fullWidth>
        <Tabs tabs={FORMAT_TABS} selectedTab={state.format} onTabChange={onTabClick} />
      </EuiFormRow>

      <EuiFormRow className="text-left" label={downloadLabel} fullWidth>
        <EuiButton size="s" onClick={handleDownloadFolderChange}>
          Change
        </EuiButton>
      </EuiFormRow>

      <EuiFormRow
        className="text-left"
        label={
          <EuiToolTip content="Convert non-English characters (like é, ñ, あ) to their English equivalents (e, n, a).">
            <span>
              Convert non-English characters to English characters
              <EuiIcon type="questionInCircle" color="subdued" />
            </span>
          </EuiToolTip>
        }
        fullWidth
      >
        <CheckboxField
          id="convert_to_english"
          value={state.convert_to_english}
          onChange={handleCheckboxChange}
        />
      </EuiFormRow>

      <EuiButton type="submit" fill>
        Download
      </EuiButton>
    </EuiForm>
  );
};

export function useDownloadModal(
  onDownload: (data: DownloadPreferences) => void,
  productName: string
) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  function successClose(data: DownloadPreferences) {
    toggleModal();
    onDownload(data);
  }

  const modal = isModalVisible && (
    <EuiModal className="max-w-xl text-center" onClose={toggleModal}>
      <ClickOutside handleClickOutside={toggleModal}>
        <div>
          <EuiModalHeader className="justify-center">
            <EuiModalHeaderTitle>Download Results</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <DownloadForm productName={productName} onSubmit={successClose} />
          </EuiModalBody>
        </div>
      </ClickOutside>
    </EuiModal>
  );

  return { showModal: () => setIsModalVisible(true), modal };
}

export function getFormatLabel(format: string): string {
  return FORMAT_TABS.find((x) => x.id === format)?.name || format;
}

// Task List Download Preferences (separate from task results)
export interface TaskListDownloadPreferences {
  format: string;
}

const TASK_LIST_STORAGE_KEY = 'task_list_download_preference';

export function getTaskListDownloadPrefs(): TaskListDownloadPreferences {
  if (typeof window === 'undefined') {
    return { format: 'csv' };
  }

  try {
    const stored = localStorage.getItem(TASK_LIST_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing task list download preferences:', error);
  }
  return { format: 'csv' };
}

export let taskListDownloadPrefs = getTaskListDownloadPrefs();

export function updateTaskListDownloadPrefs(change: TaskListDownloadPreferences) {
  taskListDownloadPrefs = change;
  localStorage.setItem(TASK_LIST_STORAGE_KEY, JSON.stringify(change));
}

// Simplified form for task list download (format only)
export const TaskListDownloadForm = ({
  onSubmit,
}: {
  onSubmit: (data: TaskListDownloadPreferences) => void;
}) => {
  const [state, setState] = useState(getTaskListDownloadPrefs);

  function onTabClick(selectedTab: { id: string }) {
    const change = {
      ...state,
      format: selectedTab.id,
    };
    updateTaskListDownloadPrefs(change);
    setState(change);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateTaskListDownloadPrefs(state);
    if (onSubmit) {
      onSubmit(state);
    }
  };

  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiFormRow className="remove-tabs-bottom-border" label="Format" fullWidth>
        <Tabs tabs={FORMAT_TABS} selectedTab={state.format} onTabChange={onTabClick} />
      </EuiFormRow>

      <EuiButton type="submit" fill>
        Download
      </EuiButton>
    </EuiForm>
  );
};

export function useTaskListDownloadModal(
  onDownload: (data: TaskListDownloadPreferences) => void
) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  function successClose(data: TaskListDownloadPreferences) {
    toggleModal();
    onDownload(data);
  }

  const modal = isModalVisible && (
    <EuiModal className="max-w-xl text-center" onClose={toggleModal}>
      <ClickOutside handleClickOutside={toggleModal}>
        <div>
          <EuiModalHeader className="justify-center">
            <EuiModalHeaderTitle>Download Task List</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <TaskListDownloadForm onSubmit={successClose} />
          </EuiModalBody>
        </div>
      </ClickOutside>
    </EuiModal>
  );

  return { showModal: () => setIsModalVisible(true), modal };
}
