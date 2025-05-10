import { useEffect, useState } from 'react';

import { pushToRoute } from '../../utils/next';
import { useRouter } from '../Link';
import Tabs from '../Tabs/Tabs';

export const TabsId = {
  INPUT: 'input',
  OUTPUT: 'output',
  ABOUT: 'about',
  API_INTEGRATION: 'api-integration',
}

const tabs = [
  { route: '/', id: TabsId.INPUT, name: 'Input', content: <></> },
  { route: '/output', id: TabsId.OUTPUT, name: 'Output', content: <></> },
  { route: '/about', id: TabsId.ABOUT, name: 'About', content: <></> },
  
]


const tabsWithApi =tabs.concat(
  {
    route: '/api-integration',
    id: TabsId.API_INTEGRATION,
    name: 'API Integration',
    content: <></>,
  })


const PagesTabs = ({ initialSelectedTab,showApiIntegrationTab, onTabChange = null }) => {
  const [selectedTabId, setSelectedTabId] = useState(initialSelectedTab)
  const router = useRouter()

  useEffect(() => {
    setSelectedTabId(initialSelectedTab)
  }, [initialSelectedTab])

  const handleTabChangeFn = tab => {
    setSelectedTabId(tab.id)
    pushToRoute(router, tab.route)
    if (onTabChange) {
      // @ts-ignore
      onTabChange(tab.id)
    }
  }

  return (
    <Tabs
      className="mt-2"
      tabs={showApiIntegrationTab ?tabsWithApi:tabs}
      selectedTab={selectedTabId}
      onTabChange={handleTabChangeFn}
    />
  )
}

export default PagesTabs
