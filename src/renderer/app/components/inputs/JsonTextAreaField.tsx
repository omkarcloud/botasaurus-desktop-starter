import { EuiTextArea } from '@elastic/eui/optimize/es/components/form/text_area/text_area'
import Browser from '../../utils/browser'

export default function JsonTextAreaField({ value, onChange, rows = 6, ...props }: any) {
  const handleChange = event => {
    const newValue = Browser.inputValue(event)
    // Try to parse as JSON, if it fails keep as string
    try {
      const parsed = JSON.parse(newValue)
      onChange(parsed)
    } catch {
      // Invalid JSON, pass the raw string
      onChange(newValue)
    }
  }

  // Convert object to string for display
  const displayValue = typeof value === 'object' && value !== null 
    ? JSON.stringify(value, null, 2) 
    : (value ?? '')

  return (
    <EuiTextArea
      fullWidth
      rows={rows}
      value={displayValue}
      onChange={handleChange}
      style={{ fontFamily: 'monospace' }}
      {...props}
    />
  )
}
