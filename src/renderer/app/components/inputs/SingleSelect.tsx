import { EuiComboBox } from '@elastic/eui/optimize/es/components/combo_box/combo_box'

export default function SingleSelect({
  options,
  value,
  onChange,
  allowCustomOptions = false,
  ...props
}: any) {
  let selected = options.find(x => x.value === value)
  if (!selected && value) {
    selected = { value, label: value }
  }

  const onCreateOption = (searchValue) => {
    const normalizedSearchValue = searchValue.trim()

    if (!normalizedSearchValue) {
      return
    }

    onChange(normalizedSearchValue)
  }
  return (
    <EuiComboBox
      isClearable={true}
      {...props}
      options={options}
      selectedOptions={selected ? [selected] : []}
      onChange={option => {
        const change = option.length === 0 ? null : option[0].value
        onChange(change)
      }}
      singleSelection={{ asPlainText: true }}
      onCreateOption={allowCustomOptions && onCreateOption}      
    />
  )
}
