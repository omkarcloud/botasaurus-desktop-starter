import Api from './api'

export const outputServerSideProps = async () => {
    const tasks = await Api.getTasksForUiDisplay()
    return { ...Api.getAppProps(), tasks: tasks.data }
}

export const outputTaskServerSideProps = async ({
    params,
}) => {
    const id = (params as any).taskId

    const { data } = await Api.getUiTaskResults(id, {
        "per_page": 25,
        "page": 1,
    }, true)

    return  {...Api.getAppProps(),  response: data, taskId: id }
}