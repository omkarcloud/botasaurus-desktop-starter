import OutputComponent from '../../components/OutputComponent/OutputComponent'
import Seo from '../../components/Seo'
import AuthedDashboard from '../../components/AuthedDashboard'
import { outputServerSideProps } from '../../utils/props'
import { PageHoc } from '../../components/PageHoc'

const Page = ({ tasks, ...props }: any) => {
  return (
    <>
      <Seo {...props} title={'Output'} />

      <AuthedDashboard {...props}>
      <OutputComponent {...props} tasks={tasks} />
        
      </AuthedDashboard>
    </>
  )
}
export default PageHoc(Page, outputServerSideProps)
