import { useGeneratedHtmlId } from '@elastic/eui/optimize/es/services/accessibility/html_id_generator';
import { EuiCheckbox, } from '@elastic/eui/optimize/es/components/form/checkbox/checkbox';

export default function CheckboxField({ value, onChange, ...props }: any) {
  const handleNumberChange = event => {
    const value = event.target.checked
    onChange(value)
  }

  const id = useGeneratedHtmlId()
  return (
    <EuiCheckbox
      {...props}
      id={id}
      checked={!!value}
      onChange={handleNumberChange}
    />
  )
}
