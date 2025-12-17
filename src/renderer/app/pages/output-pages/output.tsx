import OutputComponent from '../../components/OutputComponent/OutputComponent'
import Seo from '../../components/Seo'
import AuthedDashboard from '../../components/AuthedDashboard'
import { outputServerSideProps } from '../../utils/props'
import { OutputPageHoc } from '../../components/PageHoc'

const Page = ({ tasks, initialFilters, initialPage, ...props }: any) => {
  return (
    <>
      <Seo title={'Tasks'} />

      <AuthedDashboard {...props}>
        <OutputComponent 
          {...props} 
          tasks={tasks} 
          initialFilters={initialFilters}
          initialPage={initialPage}
        />
      </AuthedDashboard>
    </>
  )
}
export default OutputPageHoc(Page, outputServerSideProps)
