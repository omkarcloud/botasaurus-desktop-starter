import {  useGeneratedHtmlId } from '@elastic/eui/optimize/es/services/accessibility/html_id_generator'
import { EuiSwitch } from '@elastic/eui/optimize/es/components/form/switch/switch'

export default function SwitchField({ value, onChange, ...props }: any) {
  const handleSwitchChange = event => {
    const value = event.target.checked
    onChange(value)
  }

  const id = useGeneratedHtmlId()
  return (
    <EuiSwitch
      {...props}
      id={id}
      label={''}
      showLabel={false}
      checked={!!value}
      onChange={handleSwitchChange}
    />
  )
}
