import React from 'react'
import Api from '../../utils/api'
import SearchSingleSelect from './SearchSingleSelect'



export default function SearchSingleSelectApi({
  controls,
  value,
  onChange,
  searchMethod,
  canCreateOptions = false,
  data = {},
  ...props
}: any) {
  const fetchOptions = (query) => Api.getSearchOptions(searchMethod, query, controls.getParsedControlData(data))
  return <SearchSingleSelect value={value} onChange={onChange} canCreateOptions={canCreateOptions} fetchOptions={fetchOptions} {...props} />
}
