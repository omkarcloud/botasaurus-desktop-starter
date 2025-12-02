import { EuiComboBox } from '@elastic/eui/optimize/es/components/combo_box/combo_box';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty'
import { useState } from 'react'
import BulkEditModal from './BulkEditModal'

export default function InputMultiSelect({
  options,
  value,
  onChange,
  canCreateOptions = false,
  canBulkAdd = false,
  ...props
}: any) {
  const [showModal, setShowModal] = useState(false)

  const selected = (value ?? []).map(tgt=>{
    if (typeof tgt ==="string") {
      return options.find(x => x.value === tgt) ?? { value: tgt, label: tgt }
    }
    return tgt
  }).filter(x=> !!x)

  const onCreateOption = (searchValue: string) => {
    const normalizedSearchValue = searchValue.trim()

    if (!normalizedSearchValue) {
      return
    }

    const result = [...(value ?? []), normalizedSearchValue]
    onChange(result)
  }

  const handleBulkChange = (newItems: string[]) => {
    // Get current selected items as a map for quick lookup
    const currentMap = new Map<string, any>()
    selected.forEach((item: any) => {
      if (item.label) {
        currentMap.set(item.label, item)
      }
    })

    // Try to match new strings with previous values
    const matched = newItems.map(newItem => {
      // Try to find by label first
      if (currentMap.has(newItem)) {
        return currentMap.get(newItem).value
      }
      // Return as new item
      return newItem
    })

    onChange(matched)
  }

  const hasItems = selected.length > 0
  const bulkButtonText = hasItems ? 'Bulk Edit' : 'Bulk Add'
  
  return (
    <div>
      {showModal && (
        <BulkEditModal
          closeModal={() => setShowModal(false)}
          id={props.name}
          value={selected.map((item: any) => item.label || item.value)}
          onChangeValue={handleBulkChange}
        />
      )}
      <EuiComboBox
        {...props}
        options={options}
        selectedOptions={selected}
        onChange={option => {
          onChange((option??[]).map(x=>x.value))
        }}
        isClearable={true}
        onCreateOption={canCreateOptions ? onCreateOption : undefined}
      />
      {canBulkAdd && (
        <div className="mt-3">
          <EuiButtonEmpty color="text" onClick={() => setShowModal(true)}>
            {bulkButtonText}
          </EuiButtonEmpty>
        </div>
      )}
    </div>
  )
}

