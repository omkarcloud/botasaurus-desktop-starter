import AuthedDashboard from '../../components/AuthedDashboard';
import Seo from '../../components/Seo';
import TaskComponent from '../../components/TaskComponent/TaskComponent';
import { OutputTaskHoc } from '../../components/PageHoc'

function findScraperConfig(scrapers: any, task: any) {
  return scrapers.find(
    scraper => scraper.scraper_name === task.scraper_name
  )
}

const Page = ({ taskId, scrapers, ...props }: any) => {
  const response = props.response
  const task = response.task
  const scraperConfig = findScraperConfig(scrapers, task)

  if (!scraperConfig) {
    return <div>No Scraper Config Found, Did you forgot to add Scraper?</div>
  }

  return (
    <>
      <Seo title={`Task ${taskId}`} />
      <AuthedDashboard {...props}>
        <TaskComponent taskId={taskId} response={response} {...scraperConfig} />
      </AuthedDashboard>
    </>
  )
}


export default OutputTaskHoc(Page)