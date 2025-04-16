import { EuiFilePicker } from '@elastic/eui/optimize/es/components/form/file_picker/file_picker';
import { getPathForFile } from '../../utils/electron'

export default function DragDropFileUploader({ filePickerRef, onChange, multiple = true, acceptedFileTypes = [], ...props }) {
    const handleFileChange = (files) => {
    const final:any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item = {
        name: file.name,
        path: getPathForFile(file),
        size: file.size,
        last_modified: file.lastModified
      }
      final.push(item);
    }
    onChange(final);
  };

  const acceptedFiles = acceptedFileTypes && acceptedFileTypes.length? acceptedFileTypes.map((f) => `.${f}`).join(','): undefined

  return (
      <EuiFilePicker
        {...props}
        ref={filePickerRef}
        isLoading={false}
        accept={acceptedFiles}
        id="dragDropFiles"
        multiple={multiple}
        initialPromptText="Click or drag and drop files"
        onChange={handleFileChange}
        display="large"
        fullWidth
        compressed
      />
  );
}