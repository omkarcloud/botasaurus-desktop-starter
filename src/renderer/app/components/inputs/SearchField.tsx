import { EuiFieldSearch } from '@elastic/eui/optimize/es/components/form/field_search/field_search'
import Browser from '../../utils/browser'

export default function SearchField({
  value,
  onChange,
  onApply,
  ...props
}: any) {
  const handleChange = event => {
    const value = Browser.inputValue(event)
    onChange(value)
  }

  return (
    <EuiFieldSearch
      fullWidth
      placeholder="Search..."
      aria-label="Search field"
      {...props}
      isClearable={true}
      onSearch={onApply}
      onBlur={() => onChange(value)}
      value={value ?? ''}
      onChange={handleChange}
    />
  )
}
