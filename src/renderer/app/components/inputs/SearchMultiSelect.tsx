import React from 'react'
import { EuiComboBox } from '@elastic/eui'
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty'
import { useState, useCallback } from 'react'
import debounce from 'lodash.debounce'
import BulkEditModal from './BulkEditModal'
import { fetchAndSetOptions } from './SearchSingleSelect'

const lastQueries = {}

export default function SearchMultiSelect({
  value,
  onChange,
  canCreateOptions = false,
  canBulkAdd = false,
  fetchOptions,
  ...props
}: any) {
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const onSearchChange = useCallback(async (query: string) => {
    if (!props.name) {
      throw new Error('name is required')
    }
    const key  = props.name
    
    if (lastQueries[key] === query) {
      return
    }
    lastQueries[key] = query

    await fetchAndSetOptions(setIsLoading, fetchOptions, query, setOptions)
  }, [props.name, fetchOptions])


  const selected = (value ?? []).map(tgt => {
    if (typeof tgt === "string") {
      return options.find(x => x.value === tgt) ?? { value: tgt, label: tgt }
    } else if (typeof tgt === "object" && tgt.value) {
      return tgt
    }
    return tgt
  }).filter(x => !!x)

  const onCreateOption = (searchValue: string) => {
    const normalizedSearchValue = searchValue.trim()

    if (!normalizedSearchValue) {
      return
    }

    const newOption = { value: normalizedSearchValue, label: normalizedSearchValue }
    setOptions([...options, newOption])
    onChange([...(value ?? []), normalizedSearchValue])
  }

  const debouncedOnSearchChange = useCallback(
    debounce((newValue) => {
        onSearchChange(newValue)
    }, 300),
    [onSearchChange]
  )

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
      // Try to find by label first, then by value
      if (currentMap.has(newItem)) {
        return currentMap.get(newItem)
      }
      // Return as new item
      return { value: newItem, label: newItem }
    })

    onChange(matched)
  }

  const hasItems = selected.length > 0
  const bulkButtonText = hasItems ? 'Bulk Edit' : 'Bulk Add'

  const onFocus = (el) => {
    const key = props.name
    if (!lastQueries[key]) {
      const value = (el as any).target.value ?? ''
      onSearchChange(value)
    }
  }
  const onBlur = (el) => {
    const key = props.name
    lastQueries[key] = undefined
    setIsLoading(false)
  }
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
        onFocus={onFocus}
        async
        selectedOptions={selected}
        onChange={option => {
          onChange((option ?? []))
        }}
        onBlur={onBlur}
        isClearable={true}
        onCreateOption={canCreateOptions ? onCreateOption : undefined}
        onSearchChange={debouncedOnSearchChange}
        isLoading={isLoading}
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


