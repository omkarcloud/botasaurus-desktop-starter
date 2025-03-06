import { EuiLink } from '@elastic/eui/optimize/es/components/link/link';
import { useEffect, useRef, useState } from 'react';
import { EuiText } from '@elastic/eui/optimize/es/components/text/text';

import Api from '../../utils/api';
import { isEmpty, isEmptyObject } from '../../utils/missc';
import { hasFilters, hasSorts, hasViews, isDoing, TaskStatus } from '../../utils/models';
import CenteredSpinner from '../CenteredSpinner';
import DownloadStickyBar from '../DownloadStickyBar/DownloadStickyBar';
import { EmptyAborted, EmptyFailed, EmptyFilterResults, EmptyInProgress, EmptyPending, EmptyResults } from '../Empty/Empty';
import { Link } from '../Link';
import { Pagination } from '../Pagination';
import { Container, OutputContainerWithBottomPadding, OutputTabsContainer } from '../Wrappers';
import DataPanel from './DataPanel';
import { FilterComponent } from './FilterComponent';
import { SortComponent } from './SortComponent';
import { ViewComponent } from './ViewComponent';
import cogoToast from 'cogo-toast-react-17-fix'

function sentenceCase(string) {
  // Convert a string into Sentence case.
  if (!string) {
    return ''
  }
  // Add space between separators and numbers
  string = string
    .split(/([\W_\d])/)
    .filter(s => s)
    .join(' ')
  // Remove separators (except numbers)
  string = string.replace(/[\W_]/g, ' ').split(/\s+/).join(' ')
  // Manage capital letters and capitalize the first character
  return string
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^\w/, c => c.toUpperCase())
}

function titleCase(string) {
  // Convert a string into Title Sentence Case.
  if (!string) {
    return ''
  }
  return sentenceCase(string)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function clean_filter_data(filter_data, filters) {
  const cleanedFilterData = { ...filter_data } // Create a copy to modify

  for (const filter of filters) {
    const filterKey = filter.id
    // Special handling for MultiSelectDropdown type filters
    if (filter.type === 'MultiSelectDropdown') {
      const filterValue = cleanedFilterData[filter.id]
      if (filterKey in cleanedFilterData) {
        // If the value's length is 0, delete the filter entry from cleanedData
        if (filterValue.length === 0) {
          delete cleanedFilterData[filter.id]
        } else {
          const dt = filterValue.map(option => option.value)
          // Map the value to extract the id for each selected option
          cleanedFilterData[filter.id] = dt
        }
      }
      // fix filter issues
    } else if (filter.type === 'MinNumberInput' || filter.type === 'MaxNumberInput') {
      if (cleanedFilterData[filter.id] === null) {
        delete cleanedFilterData[filter.id]
      }
    } else if (filter.type === 'SearchTextInput') {
      if (cleanedFilterData[filter.id] === null||cleanedFilterData[filter.id] === undefined || cleanedFilterData[filter.id].trim() === '')
        delete cleanedFilterData[filter.id]
    }
  }

  return cleanedFilterData
}

function isNullishObject(obj) {
  if (isEmptyObject(obj)) {
    return true
  }
  for (const key in obj) {
    if (obj[key] === false || isEmpty(obj[key])) {
      return true
    }
  }
  return false
}

function caseFields(fieldNames) {
  return fieldNames.map(({ key }) => ({
    key,
    label: titleCase(key),
  }))
}

function determineFields(results) {
  // Check if the results array is empty
  if (!results || results.length === 0) {
    return [] // Return an empty array if there are no results
  }

  return Object.keys(results[0]).map(fieldName => ({
    key: fieldName,
  }))
}
function removeHiddenFields(selectedFields, hiddenFields) {
  // Convert hiddenFields array to a Set for efficient lookup
  const hiddenFieldsSet = new Set(hiddenFields)

  // Filter out objects from selectedFields whose key is in hiddenFieldsSet
  return selectedFields.filter(field => !hiddenFieldsSet.has(field.key))
}
const TaskComponent = ({
  sorts,
  filters,
  views,
  default_sort,
  response: initialResponse,
  taskId,
}) => {
  const functionsRef = useRef<any[]>([]);

  const addFunction = (newFunction) => {
    functionsRef.current.push(newFunction);
  };

  const closeAll  = async () => {
    for (let index = 0; index < functionsRef.current.length; index++) {
      const element = functionsRef.current[index];
      await element()
      
    }
    };

  useEffect(()=>{
    return  () =>{
       closeAll()
       // no need to set functionsRef.current to empty array as we are exiting
    }
  }, [])
  const [response, setResponse] = useState(initialResponse)
  const defaultView = views.length > 0 ? views[0].id : null

  const [sort, setSort] = useState(default_sort || '')
  const [pageAndView, setPageAndView] = useState({
    currentPage: 0,
    view: defaultView,
    filter_data: {},
  })
  const [loading, setLoading] = useState(false)
  const filter_data = pageAndView.filter_data

  const onDownload = async data => {
    const params = {
      sort,
      filters: clean_filter_data(filter_data, filters),
      view: pageAndView.view,
      ...data,
    }
    const output_path = (await Api.downloadTaskResults(taskId, params)).data
    // @ts-ignore
    const {hide} = cogoToast.success('Successfully downloaded. Click to open in folder.', {
      hideAfter:10, 
      position: 'bottom-right',
      onClick: async () => {
        await Api.openInFolder(output_path)
        hide!();
      },
    });
    addFunction(hide)
  }

  // For Filters
  const mountedRef = useRef(false)

  useEffect(() => {

    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!taskId){
      return 
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const per_page_records = 25;
        const params = {
          sort,
          filters: clean_filter_data(filter_data, filters),
          view: pageAndView.view,
          page: pageAndView.currentPage + 1,
          per_page: per_page_records,
        };
        const { data } = await Api.getUiTaskResults(taskId, params, false, );
        setResponse(data);
      } catch (error) {
        // @ts-ignore
        if (error.message === 'canceled'){
          return 
        }
        
        console.error('Failed to fetch task:', error);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
    };
  }, [taskId, sort, filter_data, pageAndView.view, pageAndView.currentPage]);

  // For Updates
  useEffect(() => {
    const isExecuting = isDoing(response.task) // Assuming isDoing is a function to check task status
    if (isExecuting) {
      const fetchData = async () => {
        try {
          // First check if the task has been updated
          const isUpdatedResponse = await Api.isTaskUpdated(taskId, response.task.updated_at, response.task.status)
          if (isUpdatedResponse.data.result) {
            // If the task has been updated, fetch the task results
            const per_page_records = 25
            const params = {
              sort,
              filters: clean_filter_data(filter_data, filters),
              view: pageAndView.view,
              page: pageAndView.currentPage + 1,
              per_page: per_page_records,
            }
            const { data } = await Api.getUiTaskResults(taskId, params)
            if ((pageAndView.currentPage + 1) > data.total_pages) {
              setPageAndView((x) => ({ ...x, currentPage: 0 }))
            }
            setResponse(data)
          }
        } catch (error) {
          console.error('Failed to fetch task:', error)
        }
      }

      const intervalId = setInterval(fetchData, 1000) // Polling every 1000 milliseconds
      return () => clearInterval(intervalId)
    }
  }, [response.task.updated_at, taskId, response.task.status, sort, filter_data, pageAndView.view, pageAndView.currentPage])

  let selectedFields =
    !pageAndView.view
      ? determineFields(response.results)
      : views.find(v => v.id === pageAndView.view)?.fields ?? null

  if (selectedFields) {
    selectedFields = caseFields(selectedFields)
  }

  const handlePageClick = page => {
    setPageAndView(prev => ({ ...prev, currentPage: page }))
  }

  const handleViewSet = view => {
    closeAll()
    setPageAndView((x) => ({ ...x, view, currentPage: 0 }))
  }

  const hasResults = !!response.count
  const showPagination = hasResults && response.total_pages > 1

  const isResultsNotArray = !Array.isArray(response.results)
  if (isResultsNotArray) {
    switch (response.task.status) {
      case TaskStatus.PENDING:
        return (
          <Container>
            <EmptyPending />
          </Container>
        )
      case TaskStatus.IN_PROGRESS:
        return (
          <Container>
            <EmptyInProgress />
          </Container>
        )
      case TaskStatus.FAILED:
        return (
          <Container>
            <EmptyFailed error={response.results} />
          </Container>
        )
      case TaskStatus.ABORTED:
        return (
          <Container>
            <EmptyAborted />
          </Container>
        )
      default:
        break
    }
  }

  const setFilter = (id, value) => {
    setPageAndView((prev) => ({
      ...prev,
      filter_data: {
        ...prev.filter_data,
        [id]: value,
      },
    }))
  }
  const outputContainerClass:any = hasResults && response.results.length <= 5 ? "OutputContainerWithBottomPadding" : null
  const is_large = response.task.is_large
  const filterComponent = hasFilters(filters) ? (
    <FilterComponent
      filter_data={filter_data}
      setFilter={setFilter}
      filters={filters} />
  ) : null
  const sortComponent = hasSorts(sorts) ? (
    <div><SortComponent sort={sort} setSort={setSort} sorts={sorts} /></div>
  ) : null
  const can_sort_filter = filterComponent || sortComponent
  
  return (
    <>
      <OutputTabsContainer>
        <div className='space-y-6 '>
          <Link href={`/output`} passHref>
            <EuiLink>View All Tasks</EuiLink>
          </Link>
          {can_sort_filter && (is_large ? 
            <EuiText size='s'>
          <p>
          {getTooLargeMessage(filterComponent, sortComponent) }
          </p>
          </EuiText>
          : <>
            {filterComponent}
            {sortComponent}
            </>)}
          
        </div>

        {hasViews(views) ? <div className="pb-6 pt-2">
          <ViewComponent
            view={pageAndView.view}
            setView={handleViewSet}
            views={views}
          />
        </div> : <div className=' pt-4' />}
      </OutputTabsContainer>
      
      <OutputContainerWithBottomPadding className={outputContainerClass}>
        {loading ? (
          <CenteredSpinner></CenteredSpinner>
        ) : hasResults ? (
          <>
            <DataPanel response={response} fields={response.hidden_fields && response.hidden_fields.length ? removeHiddenFields(selectedFields, response.hidden_fields) : selectedFields} />
            {showPagination ? (
              <Pagination {...{ total_pages: response.total_pages, activePage: pageAndView.currentPage, onPageClick: handlePageClick }} />
            ) : (
              <div />
            )}
            {
              <DownloadStickyBar
                showPagination={showPagination}
                onDownload={onDownload}
              />
            }
          </>
        ) : (
          <>
            {isNullishObject(filter_data) ? (
              <EmptyResults />
            ) : (
              <EmptyFilterResults />
            )}
          </>
        )}
      </OutputContainerWithBottomPadding>
    </>
  )
}

export default TaskComponent
function getTooLargeMessage(filterComponent: any, sortComponent: any): string {
  return filterComponent && sortComponent 
    ? 'Filtering and sorting are disabled because the result is too large.' 
    : (filterComponent 
      ? 'Filtering is disabled because the result is too large.' 
      : 'Sorting is disabled because the result is too large.');
}