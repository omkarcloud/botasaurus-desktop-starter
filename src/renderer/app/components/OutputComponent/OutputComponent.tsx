import { EuiBadge } from '@elastic/eui/optimize/es/components/badge/badge';
import { EuiBasicTable } from '@elastic/eui/optimize/es/components/basic_table/basic_table';
import { EuiBasicTableColumn } from '@elastic/eui/optimize/es/components/basic_table/basic_table';
import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty';
import { EuiFieldSearch } from '@elastic/eui/optimize/es/components/form/field_search/field_search';
import { EuiFlexGroup } from '@elastic/eui/optimize/es/components/flex/flex_group';
import { EuiFlexItem } from '@elastic/eui/optimize/es/components/flex/flex_item';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';
import { EuiLink } from '@elastic/eui/optimize/es/components/link';
import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalFooter } from '@elastic/eui/optimize/es/components/modal/modal_footer';
import { EuiModalHeader } from '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { EuiText } from '@elastic/eui/optimize/es/components/text/text';
import { formatDate } from '@elastic/eui/optimize/es/services/format/format_date';
import cogoToast from 'cogo-toast-react-17-fix';
import { useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

import { ipcRenderer } from '../../utils/electron';

import RefreshIcon from '../RefreshIcon/RefreshIcon';
import Select from '../inputs/Select';
import {
  getFormatLabel,
  taskListDownloadPrefs,
  TaskListDownloadPreferences,
  useTaskListDownloadModal,
} from '../DownloadStickyBar/download-utils';
import Tabs, { TabsId } from '../../components/PagesTabs/PagesTabs';
import ServerStatusComponent from '../../components/ServerStatusComponent';
import {
  OutputContainer,
  OutputTabsContainer,
  TabWrapper,
} from '../../components/Wrappers';
import Api from '../../utils/api';
import Toast from '../../utils/cogo-toast';
import { isEmpty } from '../../utils/missc';
import { filterAndMapAllOrInProgressTasks, filterIsPendingTasks, filterIsProgressTasks, TaskStatus } from '../../utils/models';
import CenteredSpinner from '../CenteredSpinner';
import ClickOutside from '../ClickOutside/ClickOutside';
import { EmptyFilterResults, EmptyOutputs, EmptyScraper } from '../Empty/Empty';
import { Link, buildUrlWithParams } from '../Link';
import { Pagination } from '../Pagination';

// Filter types
interface TaskFilters {
  search: string;
  status: string;
  taskKind: string;
  scraperName: string;
}

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'any',
  taskKind: 'any',
  scraperName: 'any',
};

const STATUS_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'aborted', label: 'Aborted' },
];

const TASK_KIND_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'parent', label: 'Parent Task' },
  { value: 'subtask', label: 'Subtask' },
];

// Check if any filter is active (non-default)
function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.search !== '' ||
    filters.status !== 'any' ||
    filters.taskKind !== 'any' ||
    filters.scraperName !== 'any'
  );
}

// Convert filters to API params
function filtersToApiParams(filters: TaskFilters) {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status !== 'any') params.status = filters.status;
  if (filters.taskKind !== 'any') params.task_kind = filters.taskKind;
  if (filters.scraperName !== 'any') params.scraper_name = filters.scraperName;
  return params;
}

// Task Filters Component
const TaskFilters = ({
  scrapers,
  filters,
  onFiltersChange,
  totalCount,
  isLoading,
  onDownload,
}: {
  scrapers: any[];
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  totalCount: number;
  isLoading: boolean;
  onDownload: (data: TaskListDownloadPreferences) => void;
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  
  // Determine which filters to show
  const showScraperFilter = scrapers.length > 1;
  const showTaskKindFilter = scrapers.some((s) => s.create_all_task === true);

  // Build scraper options
  const scraperOptions = useMemo(() => {
    return [
      { value: 'any', label: 'Any Scraper' },
      ...scrapers.map((s) => ({
        value: s.scraper_name,
        label: s.name || s.scraper_name,
      })),
    ];
  }, [scrapers]);

  // Use refs to access latest values without recreating debounced function
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Create debounced search function only once
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onFiltersChangeRef.current({ ...filtersRef.current, search: value });
    }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchValue('');
    onFiltersChange({ ...filters, search: '' });
  };

  // Sync local search state with filters prop
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const isFiltersActive = hasActiveFilters(filters);

  // Download modal
  const { modal, showModal } = useTaskListDownloadModal(onDownload);

  // Direct download with current preferences
  const directDownload = () => {
    onDownload(taskListDownloadPrefs);
  };

  const formatLabel = `Download ${getFormatLabel(taskListDownloadPrefs.format)}`;

  return (
    <div style={{ marginBottom: '16px' }}>
      {modal}
      <EuiFlexGroup
        gutterSize="m"
        alignItems="center"
        wrap
        responsive={false}
      >
        {/* Search Input */}
        <EuiFlexItem grow={false} style={{ minWidth: '200px' }}>
          <EuiFieldSearch
            placeholder="Search by ID or name..."
            value={searchValue}
            onChange={handleSearchChange}
            onSearch={() => onFiltersChange({ ...filters, search: searchValue })}
            isClearable
            onClear={handleSearchClear}
            aria-label="Search tasks"
          />
        </EuiFlexItem>

        {/* Status Filter */}
        <EuiFlexItem grow={false} style={{ minWidth: '140px' }}>
          <Select
            prepend="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value: string) => onFiltersChange({ ...filters, status: value })}
            aria-label="Filter by status"
          />
        </EuiFlexItem>

        {/* Scraper Filter (conditional) */}
        {showScraperFilter && (
          <EuiFlexItem grow={false} style={{ minWidth: '160px' }}>
            <Select
              prepend="Scraper"
              options={scraperOptions}
              value={filters.scraperName}
              onChange={(value: string) => onFiltersChange({ ...filters, scraperName: value })}
              aria-label="Filter by scraper"
            />
          </EuiFlexItem>
        )}

        {/* Task Kind Filter (conditional) */}
        {showTaskKindFilter && (
          <EuiFlexItem grow={false} style={{ minWidth: '160px' }}>
            <Select
              prepend="Task Kind"
              options={TASK_KIND_OPTIONS}
              value={filters.taskKind}
              onChange={(value: string) => onFiltersChange({ ...filters, taskKind: value })}
              aria-label="Filter by task kind"
            />
          </EuiFlexItem>
        )}

        {/* Reset Filters Button */}
        {isFiltersActive && (
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType="cross"
              onClick={() => onFiltersChange({ ...DEFAULT_FILTERS })}
              size="s"
            >
              Reset Filters
            </EuiButtonEmpty>
          </EuiFlexItem>
        )}

        {/* Results Count */}
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{totalCount} {totalCount === 1 ? 'task' : 'tasks'} found</span>
            )}
          </EuiText>
        </EuiFlexItem>

        {/* Download Button */}
        {totalCount > 0 && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={directDownload}
                  iconType="download"
                >
                  {formatLabel}
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiIcon
                  style={{ marginLeft: '4px', cursor: 'pointer' }}
                  type="arrowDown"
                  onClick={showModal}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  );
};

function convertLocalDateToUTCDate(date) {
  if (!date.endsWith('Z')) {
    date += 'Z';
  }
  return new Date(date);
}

const toTitleCase = (str) => {
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Function to get appropriate badge color for each status
function getBadgeColor(status) {
  switch (status) {
    case TaskStatus.PENDING:
      return 'default'
    case TaskStatus.IN_PROGRESS:
      return 'primary'
    case TaskStatus.COMPLETED:
      return 'success'
    case TaskStatus.FAILED:
    case TaskStatus.ABORTED:
      return 'danger'
    default:
      return 'default'
  }
}

function datetostring(date: any) {
  if (!date) {
    return '';
  }
  return formatDate(convertLocalDateToUTCDate(date), 'dateTime');
}

function getTaskString(task) {
  const onlyTaskName = `Task ${task.id}`;
  if (isEmpty(task.task_name)) {
    return onlyTaskName;
  } else if (onlyTaskName === task.task_name) {
    return onlyTaskName;
  } else {
    return `Task ${task.id} (${task.task_name})`;
  }
}

function timeToHumanReadable(seconds:number|null) {
  if (seconds === null) {
    return '';
  }
  if (seconds === 0) {
    return '0s';
  }

  // remove decimals using bitwise
  seconds = ~~seconds;

  if (seconds < 60) return `${seconds}s`;

  let time = '';
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  if (days > 0) time += `${days}d `;
  if (hours > 0) time += `${hours}h `;
  if (minutes > 0) time += `${minutes}m `;
  if (seconds > 0) {
    time += `${seconds}s`;
  }

  return time.trim();
}

function calculateDuration(task_started_at, task_finished_at) {
  if (task_started_at) {
    // Convert datetime strings to Date objects
    const started_at = new Date(task_started_at);
    const endTime = task_finished_at ? new Date(task_finished_at) : new Date();
    // @ts-ignore
    const duration = (endTime - started_at) / 1000;

    if (duration === 0) {
      return 0;
    }

    return duration;
  } else {
    return null;
  }
}

const DurationComponent = ({ task }) => {
  const [duration, setDuration] = useState(() =>
    calculateDuration(task.started_at, task.finished_at),
  );

  useEffect(() => {
    const isExecuting = task.status === TaskStatus.IN_PROGRESS;
    if (isExecuting) {
      const interval = setInterval(() => {
        setDuration(calculateDuration(task.started_at, task.finished_at));
      }, 1000); // Update duration every 1 second

      return () => clearInterval(interval); // Clear interval on component unmount
    } else {
      setDuration(calculateDuration(task.started_at, task.finished_at));
    }
  }, [task.status, task.started_at, task.finished_at]); // Dependency array includes task to recalculate if task changes
  return <>{timeToHumanReadable(duration)}</>;
};

// Build query params for task detail navigation
function buildTaskQueryParams(activePage: number, filters: TaskFilters) {
  const params: Record<string, any> = {};
  if (activePage > 1) params.page = activePage;
  if (filters.search) params.search = filters.search;
  if (filters.status !== 'any') params.status = filters.status;
  if (filters.taskKind !== 'any') params.task_kind = filters.taskKind;
  if (filters.scraperName !== 'any') params.scraper_name = filters.scraperName;
  return params;
}

const TaskTable = ({
  activePage,
  onPageClick,
  isLoading,
  total_pages,
  tasks,
  updateTasks,
  filters,
}: {
  activePage: number;
  onPageClick: (page: number) => void;
  isLoading: boolean;
  total_pages: number;
  tasks: any[];
  updateTasks: (data: any, currentPage: number | null) => void;
  filters: TaskFilters;
}) => {
  const [taskToBeDeleted, setDeleteTask] = useState(null);

  const closeModal = () => {
    // @ts-ignore
    setDeleteTask(false);
  };

  // Convert filters to API params format
  const apiFilters = filtersToApiParams(filters);

  const confirmDelete = (task) => {
    Api.deleteTask(task.id, activePage, apiFilters)
      .then((response) => {
        Toast.success('Successfully Deleted Task');
        updateTasks(response!.data, null);
      })
      .finally(() => {
        closeModal();
      });
  };

  const abortTask: (item: any) => void = (task) => {
    // Create unique request ID
    const requestId = Date.now();
    
    // Show loading toast and get hide function
    const { hide } = cogoToast.loading(`Aborting Task ${task.id}...`, {
      hideAfter: 0,
      position: 'bottom-right',
    });
  
    
    // Listen once for result on unique channel
    // @ts-ignore - IPC event handler types
    ipcRenderer.once(`task-abort-result-${requestId}`, (result:any) => {
      hide!();
      if (result.success) {
        Toast.success(`Task ${task.id} aborted successfully`);
        updateTasks(result.result, null);
       
      } else {
        Toast.error(`Failed to abort task ${task.id}: ${result.error}`);
      }
    });
    
    // Send async abort request (returns immediately)
    Api.abortTask(task.id, activePage, apiFilters, requestId)
  };

  const retryTask: (item: any) => void = (task) => {
    Api.retryTask(task.id, activePage, apiFilters).then((response) => {
      Toast.success('Successfully Retried Task');
      updateTasks(response!.data, null);
    });
  };

  const deleteTaskButtonClick: (item: any) => void = (task) => {
    setDeleteTask(task);
  };
  // Build query params for "Go Back" navigation from task detail
  const taskQueryParams = buildTaskQueryParams(activePage, filters);

  // Columns definition
  const columns: EuiBasicTableColumn<any>[] = [
    {
      field: 'id',
      name: 'View Task',
      render: (id) => {
        const href = buildUrlWithParams(`/tasks/${id}`, taskQueryParams);
        return (
          <Link href={href} passHref>
            <EuiLink>{`View Task ${id.toString()}`}</EuiLink>
          </Link>
        );
      },

      // sortable: true,
    },
    {
      field: 'task_name',
      name: 'Task Name',
      // sortable: true,
    },
    {
      field: 'result_count',
      name: 'Result Count',
      // dataType: 'number',
      // sortable: true,
    },
    {
      field: 'status',
      name: 'Status',
      render: (status, task) => {
        const isFailed = status === TaskStatus.FAILED;
        return (
          <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiBadge color={getBadgeColor(status)}>
                {toTitleCase(status)}
              </EuiBadge>
            </EuiFlexItem>
            {isFailed && (
              <EuiFlexItem grow={false}>
                <RefreshIcon onClick={() => retryTask(task)} ariaLabel="Retry task" />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        );
      },

      // sortable: true,
    },
    {
      field: 'duration',
      name: 'Duration',
      render: (s, record) => {
        return <DurationComponent task={record} />;
      },

      // timeToHumanReadable
      // dataType: 'number',
      // sortable: true,
    },
    {
      field: 'eta',
      name: 'ETA',
      render: (eta, task) => {
        if (eta === null && !task.eta_text) {
          return '';
        }
        const etaTime = eta !== null ? timeToHumanReadable(eta) : '';
        const etaText = task.eta_text || '';

        return (
          <span>
            {etaTime}
            {etaTime && etaText && ' '}
            {etaText}
          </span>
        );
      },
    },
    {
      field: 'started_at',
      name: 'Start Time',
      dataType: 'date',
      render: (date) => {
        return datetostring(date);
      },
      // sortable: true,
    },
    {
      field: 'finished_at',
      name: 'Finish Time',
      dataType: 'date',
      render: (date) => datetostring(date),
      // sortable: true,
    },
    {
      name: 'Actions',
      actions: [
        {
          name: 'Abort',
          description: 'Abort the Task',
          icon: 'cross',
          type: 'icon',
          color: 'danger',
          onClick: abortTask,
        },
        {
          name: 'Delete',
          description: 'Delete the Task',
          icon: 'trash',
          type: 'icon',
          color: 'danger',
          onClick: deleteTaskButtonClick,
        },
      ],
    },
  ];
  return (
    <>
      {taskToBeDeleted && (
        <EuiModal onClose={closeModal}>
          <ClickOutside
            handleClickOutside={() => {
              closeModal();
            }}
          >
            <div>
              <EuiModalHeader>
                <EuiModalHeaderTitle>Confirm Delete</EuiModalHeaderTitle>
              </EuiModalHeader>
              <EuiModalBody>
                <EuiText>
                  Are you sure you want to delete <b>{getTaskString(taskToBeDeleted)}</b>?
                  This action is <b>irreversible</b>.
                </EuiText>
              </EuiModalBody>
              <EuiModalFooter>
                <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
                <EuiButton
                  color="danger"
                  onClick={() => confirmDelete(taskToBeDeleted)}
                >
                  Delete
                </EuiButton>
              </EuiModalFooter>
            </div>
          </ClickOutside>
        </EuiModal>
      )}
      {isLoading ? (
        <CenteredSpinner />
      ) : (
        <>
          <EuiBasicTable
            items={tasks}
            columns={columns}
            rowProps={(item) => ({
              className: 'pointer',
            })}
          />
          <Pagination
            {...{ total_pages, activePage: activePage - 1, onPageClick }}
          />
        </>
      )}
    </>
  );
};

const OutputComponent = (props) => {
  const { 
    scrapers, 
    tasks: taskResponse,
    initialFilters = DEFAULT_FILTERS,
    initialPage = 1,
  } = props;

  const [state, setState] = useState({ ...taskResponse, active_page: initialPage });
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  
  // Use ref to track current filters in polling effect
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const total_pages = state.total_pages;
  const results = state.results;
  const active_page = state.active_page;
  const totalCount = state.count || 0;

  // Polling effect to check for task updates
  useEffect(() => {
    const pendingTsks = filterIsPendingTasks(results);
    const progressTsks = filterIsProgressTasks(results);
    const hasTasks = pendingTsks.length > 0 || progressTsks.length > 0;
    if (!isLoading && hasTasks) {
      const isCleared = { isCleared: false };
      const intervalId = setInterval(async () => {
        if (!isCleared.isCleared) {
          const all_tasks = filterAndMapAllOrInProgressTasks(pendingTsks.concat(progressTsks));
          const response = await Api.isAnyTaskUpdated(
            pendingTsks.map((task) => task.id),
            progressTsks.map((task) => task.id),
            all_tasks,
          );
          if (response!.data.result && !isCleared.isCleared) {
            // Use current filters from ref
            const currentFilters = filtersRef.current;
            const result = await Api.getTasksForUiDisplay(
              active_page,
              filtersToApiParams(currentFilters)
            );
            const data = result!.data;
            if (!isCleared.isCleared) {
              setState((x) => ({
                ...data,
                active_page:
                  x.active_page > data.total_pages ? 1 : x.active_page,
              }));
            }
          }
        }
      }, 1000);
      return () => {
        isCleared.isCleared = true;
        return clearInterval(intervalId);
      };
    }
  }, [isLoading, results, active_page]);

  function updateState(data, current_page) {
    setState((curr) => {
      if (current_page === null) {
        return {
          ...curr,
          ...data,
          active_page:
            curr.active_page > data.total_pages ? 1 : curr.active_page,
        };
      }
      return {
        ...data,
        active_page: current_page > data.total_pages ? 1 : current_page,
      };
    });
  }

  // Fetch tasks with current filters
  const fetchTasks = async (page: number, currentFilters: TaskFilters) => {
    setLoading(true);
    try {
      const result = await Api.getTasksForUiDisplay(page, filtersToApiParams(currentFilters));
      updateState(result!.data, page);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (page: number) => {
    fetchTasks(page, filters);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    fetchTasks(1, newFilters);
  };

  // Track toast close functions for cleanup
  const toastFunctionsRef = useRef<any[]>([]);

  const addToastFunction = (fn: any) => {
    toastFunctionsRef.current.push(fn);
  };

  // Cleanup toasts on unmount
  useEffect(() => {
    return () => {
      toastFunctionsRef.current.forEach((fn) => {
        try { fn(); } catch {}
      });
    };
  }, []);

  // Handle download task list
  const handleDownload = async (data: TaskListDownloadPreferences) => {
    const apiFilters = filtersToApiParams(filters);
    const output_path = (await Api.downloadTaskList(apiFilters, data))?.data;

    if (typeof output_path === 'string') {
      const { hide } = cogoToast.success(
        'Successfully downloaded. Click to open in folder.',
        {
          hideAfter: 10,
          position: 'bottom-right',
          onClick: async () => {
            await Api.openInFolder(output_path);
            hide!();
          },
        }
      );
      addToastFunction(hide);
    }
  };

  // Determine content to render
  let cp;
  const isFiltersActive = hasActiveFilters(filters);
  
  if (!scrapers || scrapers.length === 0) {
    cp = <EmptyScraper />;
  } else if (results && results.length === 0 && isFiltersActive) {
    // Show empty filter state when filters are active but no results
    cp = <EmptyFilterResults />;
  } else if (results && results.length === 0) {
    cp = <EmptyOutputs />;
  } else {
    cp = (
      <TaskTable
        activePage={active_page}
        onPageClick={(x) => onPageChange(x + 1)}
        isLoading={isLoading}
        total_pages={total_pages}
        tasks={results}
        updateTasks={updateState}
        filters={filters}
      />
    );
  }

  // Check if we should show filters (only when scrapers exist)
  const showFilters = scrapers && scrapers.length > 0;

  return (
    <>
      <OutputTabsContainer>
        <ServerStatusComponent />
        <Tabs
          showApiIntegrationTab={props.show_api_integration_tab}
          onTabChange={
            ((id) => {
              if (id === TabsId.TASKS) {
                // Reset filters when switching to tasks tab
                setFilters({ ...DEFAULT_FILTERS });
                fetchTasks(1, DEFAULT_FILTERS);
              }
            }) as any
          }
          initialSelectedTab={TabsId.TASKS}
        />
      </OutputTabsContainer>
      <OutputContainer>
        <TabWrapper>
          {showFilters && (
            <TaskFilters
              scrapers={scrapers}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalCount={totalCount}
              isLoading={isLoading}
              onDownload={handleDownload}
            />
          )}
          {cp}
        </TabWrapper>
      </OutputContainer>
    </>
  );
};

export default OutputComponent;
