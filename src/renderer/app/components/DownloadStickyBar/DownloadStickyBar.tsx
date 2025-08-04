import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiForm } from '@elastic/eui/optimize/es/components/form/form';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';
import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalHeader } from  '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from  '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { EuiToolTip } from '@elastic/eui/optimize/es/components/tool_tip/tool_tip';
import { useState } from 'react';

import ClickOutside from '../ClickOutside/ClickOutside';
import CheckboxField from '../inputs/CheckBoxField';
import Tabs from '../Tabs/Tabs';
import { openFolderPicker } from '../../utils/electron'

function getprefs() {
  if (typeof window === 'undefined') {
    return { format: 'csv', convert_to_english: true, downloadFolder: null }
  }

  let downloadPreference
  try {
    downloadPreference = JSON.parse(
      localStorage.getItem('download_preference') ||
        '{"format": "csv", "convert_to_english": true, "downloadFolder": null}'
    )
  } catch (error) {
    console.error('Error parsing download preferences:', error)
    downloadPreference = { format: 'csv', convert_to_english: true, downloadFolder: null } // Default value in case of error
  }
  return downloadPreference
}

let prefs = getprefs()

const tabs = [
  {
    id: 'csv',
    name: 'CSV',
    content: <></>, // Assuming no content is needed for the sorting tabs
  },
  {
    id: 'json',
    name: 'JSON',
    content: <></>, // Assuming no content is needed for the sorting tabs
  },
  {
    id: 'excel',
    name: 'Excel',
    content: <></>, // Assuming no content is needed for the sorting tabs
  },
]

function isWindowsBrowser() {
  return navigator.platform.indexOf('Win') > -1;
}

export function getSeparator(): string {
  return isWindowsBrowser() ? '\\' : '/';
}

const DownloadForm = ({ onSubmit , productName}) => {

  function updatePrefs(change) {
      prefs = change
      localStorage.setItem('download_preference', JSON.stringify(change))
  }

  const [state, setState] = useState(getprefs)



  function onTabClick(selectedTab) {
    const change = {
      ...state,
      format: selectedTab.id,
    }
    updatePrefs(change)
    setState(change)
  }

  function handleCheckboxChange(e) {
    const change = {
      ...state,
      convert_to_english: e,
    }
    updatePrefs(change)
    setState(change)
  }

  async function handleDownloadFolderChange() {
    try {
        const folderPath  = await openFolderPicker(state.downloadFolder)
      if (folderPath) {
        const change = {
          ...state,
          downloadFolder: folderPath,
        }
        updatePrefs(change)
        setState(change)
      }
    } catch (error) {
      console.error('Error selecting download folder:', error)
    }
  }
  const handleSubmit = event => {
    event.preventDefault()
    updatePrefs(state)
    if (onSubmit) {
      onSubmit(state)
    }
  }

  const downloadLabel = `Save downloads to folder: ${state.downloadFolder ?? 'Downloads'}${getSeparator()}${productName}`
  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiFormRow
        className="remove-tabs-bottom-border"
        label="Format"
        fullWidth>
        <Tabs tabs={tabs} selectedTab={state.format} onTabChange={onTabClick} />
      </EuiFormRow>

      <EuiFormRow
            className="text-left"

        label={downloadLabel }
        fullWidth>
            <EuiButton

            size="s"
            onClick={handleDownloadFolderChange}
          >
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
        fullWidth>
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
  )
}

function useDownloadModal(onDownload, productName) {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  // Call this function when the download is successfully initiated
  function successClose(data) {
    toggleModal()
    onDownload(data) // Call the passed function on successful submission/download
  }

  const modal = isModalVisible && (
    <EuiModal className="max-w-xl text-center" onClose={toggleModal}>
      <ClickOutside
        handleClickOutside={() => {
          toggleModal()
        }}>
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
  )

  return { showModal: () => setIsModalVisible(true), modal }
}
const DownloadStickyBar = ({ productName, onDownload, showPagination }) => {
  function directDownload() {
    // gets download preference from local storage, if not then it is {"format": "csv", "convert_to_english": true }
    // if convert_to_english is true then the language will be converted to english
    onDownload(prefs)
  }

  const { modal, showModal } = useDownloadModal(onDownload, productName)
  // @ts-ignore
  const fmt = `Download ${tabs.find(x => x.id === prefs.format).name}`
  return (
    <div className={showPagination ? 'pt-2' : 'pt-6'}>
      {modal}
      <EuiButton className="mr-2" onClick={directDownload} iconType="download">
        {fmt}
      </EuiButton>
      <EuiIcon
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        type="arrowDown"
        onClick={showModal}
      />
    </div>
  )
}

export default DownloadStickyBar
