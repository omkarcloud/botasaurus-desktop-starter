import AboutComponent from '../components/AboutComponent/AboutComponent'
import AuthedDashboard from '../components/AuthedDashboard'
import Description from '../components/Description/Description'
import Tabs, { TabsId } from '../components/PagesTabs/PagesTabs'
import Seo from '../components/Seo'
import { Container, TabWrapper } from '../components/Wrappers'
import Api from '../utils/api'

const Page = () => {
  const props = Api.getApiConfig()
  const markdownContent = props.readme

  return (
    <>
      <Seo {...props} title={'About'} />

      <AuthedDashboard {...props}>
        <Container>
          <Description {...props} />
          <Tabs initialSelectedTab={TabsId.ABOUT} />
          <TabWrapper>
            <AboutComponent markdownContent={markdownContent} />
          </TabWrapper>
        </Container>
      </AuthedDashboard>
    </>
  )
}

export default Page
