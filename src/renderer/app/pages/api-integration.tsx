import ApiIntegrationComponent from '../components/ApiIntegrationComponent/ApiIntegrationComponent';
import AuthedDashboard from '../components/AuthedDashboard';
import Tabs, { TabsId } from '../components/PagesTabs/PagesTabs';
import Seo from '../components/Seo';
import { Container, TabWrapper } from '../components/Wrappers';
import Api from '../utils/api';

const Page = () => {
  const props = Api.getAppProps()

  return (
    <>
      <Seo title={'Api'} />

      <AuthedDashboard {...props}>
        <Container>
          <Tabs showApiIntegrationTab={true} initialSelectedTab={TabsId.API_INTEGRATION} />
          <TabWrapper>
            <ApiIntegrationComponent {...props} />
          </TabWrapper>
        </Container>
      </AuthedDashboard>
    </>
  );
};

export default Page;
