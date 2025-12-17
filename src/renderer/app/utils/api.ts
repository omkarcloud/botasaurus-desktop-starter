import { ipcRenderer } from "./electron"
import cogoToast from 'cogo-toast-react-17-fix'
import Toast from './cogo-toast'
import { appProps } from "./app-props"

async function fetch({ route, message, silent, silentOnError }: any, ...data) {
    silentOnError = silentOnError ?? false
    function showLoading(message: string) {
        const hideFn = cogoToast.loading(message, {
            hideAfter: 0,
            position: 'bottom-right',
        }).hide!
        return hideFn
    }
    let hidefn
    let result
    if (!silent) {
        hidefn = showLoading(message ? message : 'Submitting')
    }
    try {
        if (data.length == 1) {
            result = await ipcRenderer.invoke(route, data[0])
        }else {
            result = await ipcRenderer.invoke(route, ...data)
        }
    } catch (error) {
        if (hidefn) {
            hidefn()
        }

        if (!silent && !silentOnError) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('is currently open in another application')) {
                const extractedMessage = errorMessage.split("Error: ")[1] || errorMessage
                Toast.error(extractedMessage);
                return 
            } else {
                Toast.error('Something went wrong, please try again later.');
            }
        }

        throw error
    }


    if (hidefn) {
        hidefn()
    }
    return { data: result, status: 200 }
}
function getAppProps() {
    return appProps

}

function createAsyncTask(data: any) {
    const withResults = false
    const giveFirstResultOnly = true
    return fetch({ route: "createAsyncTask", message: 'Starting Task', silentOnError:true }, data, withResults, giveFirstResultOnly)
}

function getApi() {
    return fetch({ route: "getApi", silent: true })
}

interface TaskFiltersParam {
    search?: string;
    status?: string;
    task_kind?: string;
    scraper_name?: string;
}

function getTasksForUiDisplay(page = 1, filters: TaskFiltersParam = {}) {
    const params: Record<string, any> = { page };
    
    // Only include non-empty filter values
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    
    return fetch({ route: "getTasksForUiDisplay", silent: true }, params)
}

function isAnyTaskUpdated(pending_task_ids: any[], progress_task_ids: any[], all_tasks: any[]) {
    return fetch({ route: "isAnyTaskUpdated", silent: true }, {
        pending_task_ids,
        progress_task_ids,
        all_tasks,
    })
}

function isTaskUpdated(taskId: number, lastUpdated: string, status: string) {
    return fetch({ route: "isTaskUpdated", silent: true }, {
        task_id: taskId,
        last_updated: lastUpdated,
        status: status,
    })
}

function abortTask(task_id: number, page: number, filters: TaskFiltersParam = {}, requestId: number) {
    const params: Record<string, any> = { page, requestId };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    
    return fetch({ route: "patchTask", message: 'Aborting...', silent: true, silentOnError: true }, params, {
        action: 'abort',
        task_ids: [task_id]
    })
}



function deleteTask(task_id: number, page: number, filters: TaskFiltersParam = {}) {
    const params: Record<string, any> = { page };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    
    return fetch({ route: "patchTask", message: 'Deleting...' }, params, {
        action: 'delete',
        task_ids: [task_id]
    })
}

function retryTask(task_id: number, page: number, filters: TaskFiltersParam = {}) {
    const params: Record<string, any> = { page };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    
    return fetch({ route: "patchTask", message: 'Retrying...' }, params, {
        action: 'retry',
        task_ids: [task_id]
    })
}

function downloadTaskResults(taskId: number, data: any = {}) {
    return fetch({ route: "downloadTaskResults", message: 'Downloading...' }, taskId, data)
}

function downloadTaskList(filters: TaskFiltersParam = {}, data: any = {}) {
    const params: Record<string, any> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'any') params.status = filters.status;
    if (filters.task_kind && filters.task_kind !== 'any') params.task_kind = filters.task_kind;
    if (filters.scraper_name && filters.scraper_name !== 'any') params.scraper_name = filters.scraper_name;
    
    return fetch({ route: "downloadTaskList", message: 'Downloading...' }, params, data)
}

function openInFolder(path:string) {
    return fetch({ route: "openInFolder", silent: true  }, path)
}

function openExternal(path:string) {
    return fetch({ route: "openExternal", silent: true  }, path)
}

function getUiTaskResults(taskId: number, data: any = {}, force_apply_first_view = false) {
    const query_params = force_apply_first_view ? { force_apply_first_view: `${force_apply_first_view}` } : {}
    const newLocal = fetch({ route: "getUiTaskResults", silent: true }, taskId, query_params, data)
    return newLocal
}

async function getSearchOptions(searchMethod: string, query: string, data: any = {}) {
    try {
        const result = await fetch({ route: "getSearchOptions", silent: true }, searchMethod, query, data)
        return result?.data || { error: 'No data returned' }
    } catch (error) {
        console.error('Error fetching search options:', error)
        return { error: 'Failed to get search options' }
    }
}

const Api = {
    openExternal, 
    openInFolder,
    getAppProps,
    createAsyncTask,
    getApi,
    getTasksForUiDisplay,
    isAnyTaskUpdated,
    isTaskUpdated,
    abortTask,
    deleteTask,
    retryTask,
    downloadTaskResults,
    downloadTaskList,
    getUiTaskResults,
    getSearchOptions,
}

export default Api
