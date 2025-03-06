import { EuiText } from '@elastic/eui/optimize/es/components/text/text';

const Description = ({ description }) => {
  return (
    <EuiText size="m">
      <p>{description}</p>
    </EuiText>
  )
}

export default Description
