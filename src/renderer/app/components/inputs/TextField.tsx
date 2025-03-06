import { EuiFieldText } from '@elastic/eui/optimize/es/components/form/field_text/field_text'
import Browser from '../../utils/browser'

export default function TextField({ value, onChange, ...props }: any) {
  const handleChange = event => {
    const value = Browser.inputValue(event)
    onChange(value)
  }

  return (
    <EuiFieldText
      {...props}
      fullWidth
      value={value ?? ''}
      onChange={handleChange}
    />
  )
}
