import { EuiFieldNumber } from '@elastic/eui/optimize/es/components/form/field_number/field_number';

import Browser from '../../utils/browser';
import { readNumber } from '../../utils/missc';


export default function NumberField({ value, onChange, ...props }: any) {
  const handleNumberChange = event => {
    const value = Browser.inputValue(event)
    onChange(readNumber(value))
  }

  return (
    <EuiFieldNumber
      {...props}
      fullWidth
      onBlur={() => onChange(value)}
      value={value ?? ''}
      onChange={handleNumberChange}
    />
  )
}
