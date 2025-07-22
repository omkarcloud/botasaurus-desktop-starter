import { createControls } from 'botasaurus-controls'
import { useMemo } from 'react'
import { useState } from 'react'
import scraperToInputJs from '../../utils/scraper-to-input-js'

import { EmptyScraper } from '../Empty/Empty'
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent'
import ScraperSelector from '../ScraperSelector/ScraperSelector'
import ServerToggle, { getApiBasePath, getRouteAliases } from '../ServerToggle'
import { getBaseUrl } from './getBaseUrl'
import { createApiREADME } from './createApiREADME'

const ContentContainer = ({ selectedScraper, hasSingleScraper , enable_cache}: { selectedScraper: any, hasSingleScraper: boolean  , enable_cache: boolean}) => {
  const baseUrl = getBaseUrl()

  const sorts = selectedScraper.sorts
  const filters = selectedScraper.filters
  const views = selectedScraper.views
  const default_sort = selectedScraper.default_sort

  const controls = useMemo(
    () => createControls(scraperToInputJs[selectedScraper.scraper_name]),
    [selectedScraper.scraper_name]
  )

  //@ts-ignore
  const defdata = controls.getDefaultData()

  const readmeContent = createApiREADME(baseUrl, selectedScraper.scraper_name,hasSingleScraper, defdata, sorts, filters, views, default_sort, selectedScraper.route_path, selectedScraper.max_runs, getApiBasePath(), getRouteAliases()[selectedScraper.scraper_name] ?? [], enable_cache)
  return <MarkdownComponent content={readmeContent} />
}

const ScraperContainer = ({ scrapers, enable_cache }: { scrapers: any[] , enable_cache: boolean}) => {
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
      <ContentContainer enable_cache={enable_cache} hasSingleScraper={hasSingleScraper} selectedScraper={selectedScraper} />
    </div>
  )
}

const ApiIntegrationComponent = ({ scrapers, enable_cache }) => {
  if (!scrapers || scrapers.length === 0) {
    return <EmptyScraper />
  }

  return <ScraperContainer enable_cache={enable_cache} scrapers={scrapers} />
}

export default ApiIntegrationComponent