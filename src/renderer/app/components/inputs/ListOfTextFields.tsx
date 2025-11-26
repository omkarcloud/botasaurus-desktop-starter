import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty';
import { EuiButtonIcon } from '@elastic/eui/optimize/es/components/button/button_icon/button_icon';
import { EuiFieldText } from '@elastic/eui/optimize/es/components/form/field_text/field_text';
import { EuiFlexGroup } from '@elastic/eui/optimize/es/components/flex/flex_group';
import { EuiFlexItem } from '@elastic/eui/optimize/es/components/flex/flex_item';
import { useState } from 'react';
import { EuiText } from '@elastic/eui/optimize/es/components/text/text';
import BulkEditModal, { getLink, isNotEmpty } from './BulkEditModal';

function isBulkEdit(value, islinks) {
  if (islinks) {
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      if (getLink(element)){
        return true
      }
    }
  }else {
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      if (isNotEmpty(element)){
        return true
      }
    }
  }
  return false

}const ListOfTextFields = ({ id, islinks, value, onChange, placeholder, disabled, title }) => {
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleFieldChange = (index, newValue) => {
    const updatedValue = value.map((item, i) => (i === index ? newValue : item));
    onChange(updatedValue);
  };

  const handleRemoveField = (index) => {
    const updatedValue = value.filter((_, i) => i !== index);
    onChange(updatedValue);
  };

  const handleAddField = () => {
    onChange([...value, '']); // Add an empty string as a new field
  };

  const hasMoreThan8 = value.length >= 8;
  const hasMoreThan100 = value.length > 100;
  const slicedValue = hasMoreThan100 ? value.slice(0, 100):value;
  const remainingCount = value.length - 100;

  return (
    <div>
      {showModal && (
        <BulkEditModal
          id={id}
          value={value}
          onChangeValue={onChange}
          islinks={islinks}
          closeModal={closeModal}
          
        />
      )}
      <div
        className={
          value.length
            ? hasMoreThan8
              ? 'mb-3 scrollable-lt pr-4 space-y-3'
              : 'mb-3 pr-4 space-y-3'
            : 'pr-4'
        }
      >
        {slicedValue.map((item, index) => (
          <EuiFlexGroup key={index} alignItems="center">
            <EuiFlexItem>
              <EuiFieldText
                title={title}
                disabled={disabled}
                placeholder={placeholder}
                value={item}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                fullWidth
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                title={title}
                disabled={disabled}
                aria-label="Remove field"
                iconType="cross"
                color="danger"
                onClick={() => handleRemoveField(index)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
      {hasMoreThan100 && (
        <EuiText size='s'>
        <p className="m-0 mt-3">
          And <strong>{remainingCount}</strong> more {remainingCount === 1 ? 'item' : 'items...'}
        </p>
        </EuiText>
      )}
      </div>
      <EuiButton
        className="mr-2"
        title={title}
        disabled={disabled}
        onClick={handleAddField}
        iconType="plusInCircle"
      >
        Add Field
      </EuiButton>
      <EuiButtonEmpty disabled={disabled} color="text" onClick={openModal}>
        {isBulkEdit(value, islinks) ? 'Bulk Edit' : 'Bulk Add'}
      </EuiButtonEmpty>
    </div>
  );
};

export default ListOfTextFields