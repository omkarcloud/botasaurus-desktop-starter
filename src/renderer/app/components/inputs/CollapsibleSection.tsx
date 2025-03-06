import { EuiAccordion,  } from '@elastic/eui/optimize/es/components/accordion/accordion';
import { EuiFlexGroup,  } from '@elastic/eui/optimize/es/components/flex/flex_group';
import { EuiFlexItem,  } from '@elastic/eui/optimize/es/components/flex/flex_item';
import {  EuiTitle } from '@elastic/eui/optimize/es/components/title/title';

const CollapsibleSection= ({
  title,
  children,
  forceState ,onToggle
}) => {
  const buttonContent = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3>{title}</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )


  return (
    <EuiAccordion
      id={title}
      forceState={forceState}
      onToggle={onToggle}
      className="mt-4"
      element="fieldset"
      buttonContent={buttonContent}>
      <div className="px-4 pt-4">{children}</div>
    </EuiAccordion>
  )
}

export default CollapsibleSection
