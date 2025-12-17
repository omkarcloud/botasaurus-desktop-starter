import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';

import {
  downloadPrefs,
  getFormatLabel,
  useDownloadModal,
  DownloadPreferences,
} from './download-utils';

// Re-export for backwards compatibility
export { getSeparator } from './download-utils';

const DownloadStickyBar = ({
  productName,
  onDownload,
  showPagination,
}: {
  productName: string;
  onDownload: (data: DownloadPreferences) => void;
  showPagination: boolean;
}) => {
  function directDownload() {
    onDownload(downloadPrefs);
  }

  const { modal, showModal } = useDownloadModal(onDownload, productName);
  const fmt = `Download ${getFormatLabel(downloadPrefs.format)}`;

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
  );
};

export default DownloadStickyBar;
