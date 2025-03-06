import AuthedDashboard from '../components/AuthedDashboard'
import Description from '../components/Description/Description'
import InputComponent from '../components/InputComponent/InputComponent'
import Tabs, { TabsId } from '../components/PagesTabs/PagesTabs'
import Seo from '../components/Seo'
import { Container, TabWrapper } from '../components/Wrappers'
import Api from '../utils/api'

// Create a Container Component adds padding
function Page() {
  const props = Api.getApiConfig()
  return (
    <>
      <Seo {...props} title={'Home'} />
      <AuthedDashboard {...props}>
        <Container>
          <Description {...props} />
          <Tabs initialSelectedTab={TabsId.INPUT} />
          <TabWrapper>
            <InputComponent {...props} />
          </TabWrapper>
        </Container>
      </AuthedDashboard>    </>
  )
}
export default Page

