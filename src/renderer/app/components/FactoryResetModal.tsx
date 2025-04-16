import { EuiModalFooter } from '@elastic/eui/optimize/es/components/modal/modal_footer';
import { EuiText } from '@elastic/eui/optimize/es/components/text/text';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty';
import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalHeader } from '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { useEffect, useState } from 'react';
import ClickOutside from './ClickOutside/ClickOutside';
import { ipcRenderer } from '../utils/electron';

export default function FactoryResetModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const showModal = () => setIsModalVisible(true);
    ipcRenderer.on('show-reset-prompt', showModal);
    return () => {
      ipcRenderer.off('show-reset-prompt', showModal);
    };
  }, []);

  return isModalVisible ? (
    <EuiModal onClose={closeModal}>
      <ClickOutside
        handleClickOutside={() => {
          closeModal();
        }}
      >
        <div>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Confirm Factory Reset</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiText>
              Are you sure you want to reset the app and clear all data? Please
              make sure you have downloaded all the data you need before
              proceeding. This action is <b>irreversible</b>.
            </EuiText>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
            <EuiButton
              onClick={() => {
                ipcRenderer.send('perform-reset');
                closeModal();
              }}
            >
              Reset App
            </EuiButton>
          </EuiModalFooter>
        </div>
      </ClickOutside>
    </EuiModal>
  ) : null;
}
