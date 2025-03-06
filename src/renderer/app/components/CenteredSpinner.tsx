import { EuiLoadingSpinner } from '@elastic/eui/optimize/es/components/loading/loading_spinner';
export default function CenteredSpinner({ addMargin = false }) {
  return (
    <div
      className={addMargin ? 'mt-48' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>
      <EuiLoadingSpinner size="xxl" />
    </div>
  )
}
