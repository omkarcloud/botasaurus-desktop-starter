import AboutComponent from '../components/AboutComponent/AboutComponent'
import AuthedDashboard from '../components/AuthedDashboard'

import Tabs, { TabsId } from '../components/PagesTabs/PagesTabs'
import Seo from '../components/Seo'
import { Container, TabWrapper } from '../components/Wrappers'
import Api from '../utils/api'

const Page = () => {
  const props = Api.getAppProps()
  const markdownContent = props.readme

  return (
    <>
      <Seo title={'About'} />

      <AuthedDashboard {...props}>
        <Container>
          <Tabs showApiIntegrationTab={props.show_api_integration_tab} initialSelectedTab={TabsId.ABOUT} />
          <TabWrapper>
            <AboutComponent markdownContent={markdownContent} />
          </TabWrapper>
        </Container>
      </AuthedDashboard>
    </>
  )
}

export default Page
