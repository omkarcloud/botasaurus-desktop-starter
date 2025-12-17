import Api from './api'

// Filter params interface
export interface TaskFilterParams {
    page?: number;
    search?: string;
    status?: string;
    task_kind?: string;
    scraper_name?: string;
}

// Convert filter params to API format
function filtersToApiParams(filters: TaskFilterParams) {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    return params;
}

export const outputServerSideProps = async (filterParams: TaskFilterParams = {}) => {
    const page = filterParams.page || 1;
    const apiFilters = filtersToApiParams(filterParams);
    const tasks = await Api.getTasksForUiDisplay(page, apiFilters);
    
    // Return both tasks data and the initial filter state
    return { 
        ...Api.getAppProps(), 
        tasks: tasks!.data,
        initialFilters: {
            search: filterParams.search || '',
            status: filterParams.status || 'any',
            taskKind: filterParams.task_kind || 'any',
            scraperName: filterParams.scraper_name || 'any',
        },
        initialPage: page,
    }
}

export const outputTaskServerSideProps = async ({
    params,
}) => {
    const id = (params as any).taskId

    const result = await Api.getUiTaskResults(id, {
        "per_page": 25,
        "page": 1,
    }, true)

    return  {...Api.getAppProps(),  response: result!.data, taskId: id }
}