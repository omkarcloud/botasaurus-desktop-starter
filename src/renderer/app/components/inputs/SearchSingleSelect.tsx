import React from 'react'
import { EuiComboBox } from '@elastic/eui'
import { useState, useCallback } from 'react'
import Toast from '../../utils/cogo-toast'
import debounce from 'lodash.debounce'


export async function fetchAndSetOptions(setIsLoading, fetchOptions: any, query: string, setOptions) {
  setIsLoading(true)
  try {
    const result = await fetchOptions(query)
    const error_message = result.message ?? result.error ?? result.response?.data?.error ?? result.response?.data?.message
    if (error_message) {
      Toast.error(error_message)
      setOptions([])
    } else {
      setOptions(result)
    }
  } catch (error: any) {
    const error_message = error.message ?? error.error ?? error.response?.data?.error ?? error.response?.data?.message
    if (error_message) {
      Toast.error(error_message)
      setOptions([])
    }
    setOptions([])
  } finally {
    setIsLoading(false)
  }
}
const lastQueries = {}

export default function SearchSingleSelect({
  value,
  onChange,
  canCreateOptions = false,
  fetchOptions, 
  ...props
}: any) {
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const onSearchChange = useCallback(async (query: string) => {
    if (!props.name) {
      throw new Error('name is required')
    }

    const key = props.name
    
    if (lastQueries[key] === query) {
      return
    }
    lastQueries[key] = query

    await fetchAndSetOptions(setIsLoading, fetchOptions, query, setOptions)
  }, [props.name])

  const debouncedOnSearchChange = useCallback(
    debounce((newValue) => {
      onSearchChange(newValue)
    }, 300),
    [onSearchChange]
  )

  let selected: any = null
  if (typeof value === "string") {
    selected = options.find(x => x.value === value)
    if (!selected && value) {
      selected = { value, label: value }
    }
  } else if (typeof value === "object" && value?.value) {
    selected = value
  }

  const onCreateOption = (searchValue: string) => {
    const normalizedSearchValue = searchValue.trim()

    if (!normalizedSearchValue) {
      return
    }

    const newOption = { value: normalizedSearchValue, label: normalizedSearchValue }
    setOptions([...options, newOption])
    onChange(normalizedSearchValue)
  }

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
    <EuiComboBox
      {...props}
      options={options}
      onFocus={onFocus}
      async
      selectedOptions={selected ? [selected] : []}
      onChange={option => {
        const change = option.length === 0 ? null : option[0]
        onChange(change)
      }}
      onBlur={onBlur}
      isClearable={true}
      singleSelection={{ asPlainText: true }}
      onCreateOption={canCreateOptions ? onCreateOption : undefined}
      onSearchChange={debouncedOnSearchChange}
      isLoading={isLoading}
    />
  )
}

