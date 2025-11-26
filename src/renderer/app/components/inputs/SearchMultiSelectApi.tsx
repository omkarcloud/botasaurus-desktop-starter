import React from 'react'
import Api from '../../utils/api'
import SearchMultiSelect from './SearchMultiSelect'



export default function SearchMultiSelectApi({
  controls,
  value,
  onChange,
  searchMethod,
  canCreateOptions = false,
  data = {},
  ...props
}: any) {
  const fetchOptions = (query) => Api.getSearchOptions(searchMethod, query, controls.getParsedControlData(data))
  return <SearchMultiSelect value={value} onChange={onChange} canCreateOptions={canCreateOptions} fetchOptions={fetchOptions} {...props} />
}
