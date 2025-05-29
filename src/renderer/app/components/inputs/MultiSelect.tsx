import { EuiComboBox } from '@elastic/eui/optimize/es/components/combo_box/combo_box';

export default function MultiSelect({
  options,
  value,
  onChange,
  allowCustomOptions = false,
  ...props
}: any) {
  const selected = value
  const onCreateOption = (searchValue) => {
    const normalizedSearchValue = searchValue.trim()

    if (!normalizedSearchValue) {
      return
    }

    onChange([
      ...selected,
      {
        value: normalizedSearchValue,
        label: normalizedSearchValue
      }
    ])
  }
  return (
    <EuiComboBox
      {...props}
      options={options}
      selectedOptions={selected}
      onChange={option => {
        onChange(option)
      }}
      onCreateOption={allowCustomOptions && onCreateOption}      
      isClearable={true}
    />
  )
}
