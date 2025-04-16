import { ipcRenderer } from "./electron"
import cogoToast from 'cogo-toast-react-17-fix'
import Toast from './cogo-toast'
import { apiConfig } from "./api-config"

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
        if (!silent) {
            if (!silentOnError) {
                Toast.error('Something went wrong, please try again later.')
            }
        }

        throw error
    }


    if (hidefn) {
        hidefn()
    }
    return { data: result, status: 200 }
}

function getApiConfig() {
    return apiConfig

}

function createAsyncTask(data: any) {
    return fetch({ route: "createAsyncTask", message: 'Starting Task', silentOnError:true }, data)
}

function getApi() {
    return fetch({ route: "getApi", silent: true })
}

function getTasksForUiDisplay(page = 1) {
    return fetch({ route: "getTasksForUiDisplay", silent: true }, { page })
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

function abortTask(task_id: number, page: number) {
    return fetch({ route: "patchTask", message: 'Aborting...' }, { page }, {
        action: 'abort',
        task_ids: [task_id]
    })
}

function deleteTask(task_id: number, page: number) {
    return fetch({ route: "patchTask", message: 'Deleting...' }, { page }, {
        action: 'delete',
        task_ids: [task_id]
    })
}

function downloadTaskResults(taskId: number, data: any = {}) {
    return fetch({ route: "downloadTaskResults", message: 'Downloading...' }, taskId, data)
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

const Api = {
    openExternal, 
    openInFolder,
    getApiConfig,
    createAsyncTask,
    getApi,
    getTasksForUiDisplay,
    isAnyTaskUpdated,
    isTaskUpdated,
    abortTask,
    deleteTask,
    downloadTaskResults,
    getUiTaskResults,
}

export default Api
