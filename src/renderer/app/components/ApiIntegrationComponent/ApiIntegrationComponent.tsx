import { createControls } from 'botasaurus-controls'
import { useMemo } from 'react'
import { useState } from 'react'

import { hasFilters, hasSorts, hasViews } from '../../utils/models'
import { EmptyScraper } from '../Empty/Empty'
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent'
import ScraperSelector from '../ScraperSelector/ScraperSelector'
import ServerToggle from '../ServerToggle'


const default_intentation = 4
function js_object_to_js_object_string(object, indent = default_intentation, brackets_indentation = 0) {
  const x = ' '.repeat(indent)
  const brackets_indentation_Str = ' '.repeat(brackets_indentation)

  const entrieslist = Object.entries(object)
  if (entrieslist.length === 0) {
    return brackets_indentation_Str + '{}'

  }

  const entries = entrieslist.map(([key, value]) => {
    // Handle different value types
    if (typeof value === 'string') {
      return `${x}${key}: '${value}',` // Strings need quotes
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        const z = value.map((v) => `'${v}'`).join(', ') // Strings in arrays need quotes
        const y = `[${z}]`
        return `${x}${key}: ${y},` // Arrays use JSON.stringify
      } else {
        return `${x}${key}: ${JSON.stringify(value)},` // Arrays use JSON.stringify
      }
    } else if (value === null) {
      return `${x}${key}: null,` // Null becomes null
    } else if (typeof value === 'boolean') {
      return `${x}${key}: ${value},` // Booleans stay as true/false
    } else {
      return `${x}${key}: ${value},` // Numbers and other values directly
    }
  })

  // Construct the final JavaScript object string with indentation
  const formattedString = `${brackets_indentation_Str}{\n` + entries.join('\n') + `\n${brackets_indentation_Str}}`
  return formattedString
}

function create_canbeone_options_string(options) {
  const slicelength = 10
  if (options.length === 0) {
    return "// No options available"
  } else if (options.length > slicelength) {
    return `// Can be one among ${options.length} options: ${(options.slice(0, slicelength).map((option) => option.value)).join(', ')}, ...`
  } else {
    return `// Can be one of the following options: ${join_strings(options.map((option) => option.value))}`
  }
}

function create_canbeany_options_string(options) {
  const slicelength = 10

  if (options.length === 0) {
    return "// No options available"
  } else if (options.length > slicelength) {
    return `// Can be any among ${options.length} options: ${(options.slice(0, slicelength).map((option) => option.value)).join(', ')}, ...`
  } else {
    return `// Can be any combination of the following options: ${join_strings(options.map((option) => option.value))}`
  }
}

function filters_to_js_object_string(filters, indent = default_intentation, brackets_indentation = 0) {
  const x = ' '.repeat(indent) + "// "
  const brackets_indentation_str = ' '.repeat(brackets_indentation)
  if (filters.length === 0) {
    return `{} // No filters available`
  }
  const entries = filters.map(({ id, type, options }) => {
    switch (type) {
      case 'MinNumberInput':
      case 'MaxNumberInput':
        return `${x}${id}: 0, // Enter a number`
      case 'IsTrueCheckbox':
      case 'IsFalseCheckbox':
      case 'IsNullCheckbox':
      case 'IsNotNullCheckbox':
      case 'IsTruthyCheckbox':
      case 'IsFalsyCheckbox':
        return `${x}${id}: true, // Must be true only`
      case 'BoolSelectDropdown':
      case 'SingleSelectDropdown':
        return `${x}${id}: 'your-option', ${create_canbeone_options_string(options)}`
      case 'MultiSelectDropdown':
        return `${x}${id}: ['your-option-1', 'your-option-2'], ${create_canbeany_options_string(options)}`
      case 'SearchTextInput':
        return `${x}${id}: '', // Enter your search text string`
      default:
        throw Error('Not Implemented')
    }
  })

  // Construct the final JavaScript object string with indentation
  const formattedString = `{\n` + entries.join('\n') + `\n${brackets_indentation_str}}`
  return formattedString
}

function create_api_task_text(scraper_name, hasSingleScraper, default_data) {
  let x = hasSingleScraper ? '' : `scraperName: '${scraper_name}', `

  return `To create an asynchronous task, use the \`createAsyncTask\` method:

\`\`\`javascript
const data = ${js_object_to_js_object_string(default_data)}
const task = await api.createAsyncTask({ ${x}data })
\`\`\`

To create a synchronous task, use the \`createSyncTask\` method:

\`\`\`javascript
const data = ${js_object_to_js_object_string(default_data)}
const task = await api.createSyncTask({ ${x}data })
\`\`\`

You can create multiple asynchronous or synchronous tasks at once using the \`createAsyncTasks\` and \`createSyncTasks\` methods, respectively:

\`\`\`javascript
const dataItems = [
${js_object_to_js_object_string(default_data, 8, 4)},
${js_object_to_js_object_string(default_data, 8, 4)},
]
const asyncTasks = await api.createAsyncTasks({ ${x}dataItems })
const syncTasks = await api.createSyncTasks({ ${x}dataItems })
\`\`\``
}
function create_scraper_task_data_text(scraper_name, hasSingleScraper) {
  let x = hasSingleScraper ? '' : `, scraperName: '${scraper_name}'`
  return `{ data${x} }`
}
function create_scraper_task_data_text2(scraper_name, hasSingleScraper) {
  let x = hasSingleScraper ? '' : `, scraperName: '${scraper_name}'`
  return `{ dataItems${x} }`
}
function create_filter_string(filters) {
  return `\n    filters: ${filters_to_js_object_string(filters, 8, 4)}`  
}

function join_strings(strings: string[], separator: string = 'or'): string {
  if (strings.length === 0) {
    return ""
  } else if (strings.length === 1) {
    return strings[0]
  } else {
    const lastElement = strings.pop()
    const joinedStrings = strings.join(", ")
    return `${joinedStrings} ${separator} ${lastElement}`
  }
}

function create_sort_string(sorts, default_sort) {
  return `\n    sort: null,  // sort can be one of: ${join_strings(sorts.map((view) => {
    if (view.id === default_sort) {
      return `${view.id} (default)`
    }
    return view.id
  }))}`  
}

function create_views_string(views) {
  if (views.length === 1) {
    return `\n    view: null,  // view can be ${views[0].id}`  
  } else {
    return `\n    view: null,  // view can be one of: ${join_strings(views.map((view) => view.id))}`  
  }
}

function generateList(pagination, views: any, filters: any, sorts: any) {
  const result: string[] = []

  if (pagination) {
    result.push("pagination")
  }
  if (hasViews(views)) {
    result.push("views")
  }

  if (hasFilters(filters)) {
    result.push("filters")
  }

  if (hasSorts(sorts)) {
    result.push("sorts")
  }

  return result
}

function create_fetching_task_results_text(sorts, filters, views, default_sort) {
  const ls = join_strings(generateList(true, views, filters, sorts), "or")

  return `You can also apply ${ls}:

\`\`\`javascript
const results = await api.getTaskResults({
    taskId: 1,
    page: 1,
    perPage: 20,${hasViews(views) ? create_views_string(views) : ""}${hasSorts(sorts) ? create_sort_string(sorts, default_sort) : ""}${hasFilters(filters) ? create_filter_string(filters) : ""}
})
\`\`\``
}

function create_fetching_task_text(sorts, filters, views, default_sort) {
  const ls = join_strings(generateList(true, views, filters, sorts), "or")

  return `By default, all tasks are returned. You can also apply ${ls}:

\`\`\`javascript
const results = await api.getTaskResults({
    taskId: 1,
    page: 1,
    perPage: 20,${hasViews(views) ? create_views_string(views) : ""}${hasSorts(sorts) ? create_sort_string(sorts, default_sort) : ""}${hasFilters(filters) ? create_filter_string(filters) : ""}
})
\`\`\``
}

function create_download_task_text(sorts, filters, views, default_sort) {
  const ls = join_strings(generateList(false, views, filters, sorts), "or")
  if (ls) {
    return `To download the results of a specific task in a particular format, use the \`downloadTaskResults\` method:

\`\`\`javascript
import fs from 'fs'

const { buffer, filename } = await api.downloadTaskResults({
  taskId: 1,
  format: 'csv',
})

fs.writeFileSync(filename, buffer)
\`\`\`
  
You can also apply ${ls}:

\`\`\`javascript
import fs from 'fs'

const { buffer, filename } = await api.downloadTaskResults({
  taskId: 1,
  format: 'csv',
})

fs.writeFileSync(filename, buffer)
\`\`\``
  } else {
    return `To download the results of a specific task in a particular format, use the \`downloadTaskResults\` method:

\`\`\`javascript
import fs from 'fs'

const { buffer, filename } = await api.downloadTaskResults({
  taskId: 1,
  format: 'csv',
})

fs.writeFileSync(filename, buffer)
\`\`\``
  }
}


function createApiREADME(baseUrl, scraper_name, hasSingleScraper, default_data, sorts, filters, views, default_sort) {
  return `# API Integration

The Botasaurus API client provides a convenient way to access the ${hasSingleScraper?'Scrapers':'Scraper'} via an API.

It provides a simple and convenient way to create, fetch, download, abort, and delete tasks, as well as manage their results.

## Installation

To use the Botasaurus API client, first install the package using the following command:

\`\`\`bash
npm install botasaurus-api
\`\`\`

## Usage

First, import the \`Api\` class from the library:

\`\`\`javascript
import { Api } from 'botasaurus-api'
\`\`\`
Then, create an instance of the \`Api\` class:

\`\`\`javascript
async function main() {
  const api = ${baseUrl? `new Api({ baseUrl: '${baseUrl}' })`:"new Api()"}
}

main()
\`\`\`

Additionally, the API client will create response JSON files in the \`output/responses/\` directory to help with debugging and development. If you want to disable this feature in production, you can set \`createResponseFiles=false\`.

\`\`\`javascript
const api = ${baseUrl? `new Api({
  apiUrl: '${baseUrl}',
  createResponseFiles: false,
})`:"new Api({ createResponseFiles: false })"}
\`\`\`

### Creating Tasks

There are two types of tasks:

- Asynchronous Task
- Synchronous Task

Asynchronous tasks run asynchronously, without waiting for the task to be completed. The server will return a response immediately, containing information about the task, but not the actual results. The client can then retrieve the results later.

Synchronous tasks, on the other hand, wait for the completion of the task. The server response will contain the results of the task.

You should use asynchronous tasks when you want to run a task in the background and retrieve the results later. Synchronous tasks are better suited for scenarios where you have a small number of tasks and want to wait and get the results immediately.

${create_api_task_text(scraper_name, hasSingleScraper, default_data)}

### Fetching Tasks

To fetch tasks from the server, use the \`getTasks\` method:

\`\`\`javascript
const tasks = await api.getTasks()
\`\`\`

${create_fetching_task_text(sorts, filters, views, default_sort)}

To fetch a specific task by its ID, use the \`getTask\` method:

\`\`\`javascript
const task = await api.getTask(1)
\`\`\`

### Fetching Task Results

To fetch the results of a specific task, use the \`getTaskResults\` method:

\`\`\`javascript
const results = await api.getTaskResults({ taskId: 1 })
\`\`\`

${create_fetching_task_results_text(sorts, filters, views, default_sort)}

### Downloading Task Results

${create_download_task_text(sorts, filters, views, default_sort)}

### Aborting and Deleting Tasks

To abort a specific task, use the \`abortTask\` method:

\`\`\`javascript
await api.abortTask(1)
\`\`\`

To delete a specific task, use the \`deleteTask\` method:

\`\`\`javascript
await api.deleteTask(1)
\`\`\`

You can also bulk abort or delete multiple tasks at once using the \`abortTasks\` and \`deleteTasks\` methods, respectively:

\`\`\`javascript
await api.abortTasks({ taskIds: [1, 2, 3] })
await api.deleteTasks({ taskIds: [4, 5, 6] })
\`\`\`

## Examples

Here are some example usages of the API client:

\`\`\`javascript
import fs from 'fs'
import { Api } from 'botasaurus-api'

async function main() {
  // Create an instance of the API client
  const api = new Api()

  // Create a synchronous task
  const data = ${js_object_to_js_object_string(default_data, default_intentation, 2)}
  const task = await api.createSyncTask(${create_scraper_task_data_text(scraper_name, hasSingleScraper)})

  // Fetch the task
  const fetchedTask = await api.getTask(task.id)

  // Fetch the task results
  const results = await api.getTaskResults({ taskId: task.id })

  // Download the task results as a CSV
  const { buffer, filename } = await api.downloadTaskResults({ 
    taskId: task.id, 
    format: 'csv' 
  })
  fs.writeFileSync(filename, buffer)

  // Abort the task
  await api.abortTask(task.id)

  // Delete the task
  await api.deleteTask(task.id)

  // --- Bulk Operations ---

  // Create multiple synchronous tasks
  const dataItems = [
${js_object_to_js_object_string(default_data, 8, 4)},
${js_object_to_js_object_string(default_data, 8, 4)},
  ]
  const tasks = await api.createSyncTasks(${create_scraper_task_data_text2(scraper_name, hasSingleScraper)})

  // Fetch all tasks
  const allTasks = await api.getTasks()

  // Bulk abort tasks
  await api.abortTasks({ taskIds: tasks.map(t => t.id) })

  // Bulk delete tasks
  await api.deleteTasks({ taskIds: tasks.map(t => t.id) })
}

main()
\`\`\`

## That's It!

Now, go and build something awesome.`
}

function getBaseUrl(): string {
  // Check if window is defined
  if (typeof window === 'undefined') {
    return ''
  }

  // Extract the hostname from the current URL
  const hostname = window.location.hostname

  // Check for localhost addresses and return '' if matched
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0'
  ) {
    return ''
  }

  // Return the current page URL enclosed in double quotes if none of the above conditions are met
  return `'${window.location.origin}'`
}

const ContentContainer = ({ selectedScraper, hasSingleScraper }) => {
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

  const readmeContent = createApiREADME(baseUrl, selectedScraper.scraper_name, hasSingleScraper, defdata, sorts, filters, views, default_sort)
  console.log({readmeContent})
  return <MarkdownComponent content={readmeContent} />
}

const ScraperContainer = ({ scrapers }) => {
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

const ApiIntegrationComponent = ({ scrapers }) => {
  if (!scrapers || scrapers.length === 0) {
    return <EmptyScraper />
  }

  return <ScraperContainer scrapers={scrapers} />
}

export default ApiIntegrationComponent