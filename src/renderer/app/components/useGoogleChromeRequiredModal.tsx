import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalHeader } from  '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from  '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { useState } from 'react';
import ClickOutside from './ClickOutside/ClickOutside'
import MarkdownComponent from './MarkdownComponent/MarkdownComponent'

export function useGoogleChromeRequiredModal() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  
    const toggleModal = () => {
      setIsModalVisible(!isModalVisible)
    }
  
    const modal = isModalVisible && (
      <ClickOutside
      exceptions={['euiModal']}
          handleClickOutside={() => {
            toggleModal()
          }}>
      <EuiModal className="max-w-xl " onClose={toggleModal}>
        
            <EuiModalHeader className="justify-center">
              <EuiModalHeaderTitle>⚠️ Google Chrome Required</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <MarkdownComponent use_target_blank={true} content={`Google Chrome is not installed on your system. This tool requires Google Chrome to run. 
Please visit [https://www.google.com/chrome/](https://www.google.com/chrome/) to download and install Google Chrome.`}>

                
              </MarkdownComponent>
            
            </EuiModalBody>
        
      </EuiModal>
      </ClickOutside>
    )
  
    return { showModal: () => setIsModalVisible(true), modal }
  }