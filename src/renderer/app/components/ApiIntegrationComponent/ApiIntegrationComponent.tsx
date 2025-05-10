import { createControls } from 'botasaurus-controls'
import { useMemo } from 'react'
import { useState } from 'react'

import { EmptyScraper } from '../Empty/Empty'
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent'
import ScraperSelector from '../ScraperSelector/ScraperSelector'
import ServerToggle from '../ServerToggle'
import { getBaseUrl } from './getBaseUrl'
import { createApiREADME } from './createApiREADME'

const ContentContainer = ({ selectedScraper, hasSingleScraper }: { selectedScraper: any, hasSingleScraper: boolean }) => {
  const baseUrl = getBaseUrl()

  const sorts = selectedScraper.sorts
  const filters = selectedScraper.filters
  const views = selectedScraper.views
  const default_sort = selectedScraper.default_sort

  const controls = useMemo(
    () => createControls(selectedScraper.input_js),
    [selectedScraper]
  )

  //@ts-ignore
  const defdata = controls.getDefaultData()

  const readmeContent = createApiREADME(baseUrl, selectedScraper.scraper_name,hasSingleScraper, defdata, sorts, filters, views, default_sort, selectedScraper.route_path, selectedScraper.max_runs,)
  return <MarkdownComponent content={readmeContent} />
}

const ScraperContainer = ({ scrapers }: { scrapers: any[] }) => {
  const [selectedScraper, setSelectedScraper] = useState(scrapers[0])

  const hasSingleScraper = scrapers.length <= 1
  return (
    <div>
      {hasSingleScraper ? null : (
        <ScraperSelector
          scrapers={scrapers}
          selectedScraper={selectedScraper}
          onSelectScraper={setSelectedScraper}
        />
      )}
      <ServerToggle/>
      <ContentContainer hasSingleScraper={hasSingleScraper} selectedScraper={selectedScraper} />
    </div>
  )
}

const ApiIntegrationComponent = ({ scrapers }: { scrapers: any[] }) => {
  if (!scrapers || scrapers.length === 0) {
    return <EmptyScraper />
  }

  return <ScraperContainer scrapers={scrapers} />
}

export default ApiIntegrationComponent