import React from 'react'
import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty'
import { EuiForm } from '@elastic/eui/optimize/es/components/form/form';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';
import { EuiTextArea } from '@elastic/eui/optimize/es/components/form/text_area/text_area';
import { EuiToolTip } from '@elastic/eui/optimize/es/components/tool_tip/tool_tip';
import { Control, createControls, WithChooseOptions } from 'botasaurus-controls';
import { useEffect, useMemo, useRef, useState } from 'react';

import scraperToInputJs from '../../utils/scraper-to-input-js';
import Api from '../../utils/api';
import Toast from '../../utils/cogo-toast';
import { isEmptyObject } from '../../utils/missc';
import { pushToRoute } from '../../utils/next';
import ClientOnly from '../ClientOnly';
import { EmptyFailedInputJs, EmptyInputs, EmptyScraper } from '../Empty/Empty';
import CheckboxField from '../inputs/CheckBoxField';
import ChooseField from '../inputs/ChooseField';
import CollapsibleSection from '../inputs/CollapsibleSection';
import InputMultiSelect from '../inputs/InputMultiSelect';
import ListOfTextFields from '../inputs/ListOfTextFields';
import NumberField from '../inputs/NumberField';
import SingleSelect from '../inputs/SingleSelect';
import SearchField from '../inputs/SearchField';
import SearchSingleSelectApi from '../inputs/SearchSingleSelectApi';
import SearchMultiSelectApi from '../inputs/SearchMultiSelectApi';
import SwitchField from '../inputs/SwitchField';
import TextAreaField from '../inputs/TextAreaField';
import JsonTextAreaField from '../inputs/JsonTextAreaField';
import TextField from '../inputs/TextField';
import { useRouter } from '../Link';
import ScraperSelector from '../ScraperSelector/ScraperSelector';
import { Container } from '../Wrappers';
import { useGoogleChromeRequiredModal } from '../useGoogleChromeRequiredModal'

import DragDropFileUploader from '../inputs/DragDropFileUploader'

function saveDataToLocalStorage(selectedScraper: any, newData: any) {
  try {
    localStorage.setItem(
      `input_${selectedScraper.scraper_name}_${selectedScraper.input_js_hash}`,
      JSON.stringify(newData)
    );
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}



function createHelpfulJsonError(e: any, trimmedValue: string) {
  const errorMessage = e.message || 'Invalid JSON'

  // Extract position info if available
  const positionMatch = errorMessage.match(/position\s+(\d+)/i)
  const position = positionMatch ? parseInt(positionMatch[1], 10) : null

  let helpfulMessage = 'Invalid JSON: '

  // Check for common mistakes
  if (trimmedValue.includes("'") && !trimmedValue.includes('"')) {
    helpfulMessage += "Use double quotes (\") instead of single quotes (') for strings."
  } else if (/,\s*[}\]]/.test(trimmedValue)) {
    helpfulMessage += "Trailing comma found. Remove the comma before the closing bracket."
  } else if (errorMessage.includes('Unexpected token')) {
    if (position !== null) {
      const contextStart = Math.max(0, position - 10)
      const contextEnd = Math.min(trimmedValue.length, position + 10)
      const context = trimmedValue.substring(contextStart, contextEnd)
      helpfulMessage += `Unexpected character near position ${position}: "...${context}..."`
    } else {
      helpfulMessage += errorMessage
    }
  } else if (errorMessage.includes('Unexpected end')) {
    helpfulMessage += "JSON is incomplete. Check for missing closing brackets or quotes."
  } else {
    helpfulMessage += errorMessage
  }
  return helpfulMessage
}

// Format validation errors as a readable list
function formatValidationErrors(validationResult: Record<string, string>): string[] {
  return Object.entries(validationResult).map(([field, message]) => `${field}: ${message}`);
}

// JSON Editor Component for editing all data as JSON
const JsonDataEditor = ({
  data,
  onDataChange,
  onSwitchToForm,
  onSubmit,
  onReset,
  isSubmitting,
  submitAttempted,
  setSubmitAttempted, 
  validationResult,
}: {
  data: any;
  onDataChange: (newData: any) => void;
  onSwitchToForm: () => void;
  onSubmit: (e?: any) => void;
  onReset: () => void;
  setSubmitAttempted: (submitAttempted: boolean) => void;
  isSubmitting: boolean;
  submitAttempted: boolean;
  validationResult: Record<string, string>;
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const lastDataRef = useRef(data);

  // Sync jsonText when data changes externally (e.g., reset)
  useEffect(() => {
    const newDataStr = JSON.stringify(data, null, 2);
    // Only update if JSON representation is different (avoids unnecessary updates)
    if (newDataStr !== JSON.stringify(lastDataRef.current, null, 2)) {
      setJsonText(newDataStr);
      setParseError(null);
    }
    lastDataRef.current = data;
  }, [data]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    
    const trimmedValue = newText.trim()
    try {
      const parsed = JSON.parse(trimmedValue);
      setParseError(null);
      lastDataRef.current = parsed;
      onDataChange(parsed);
    } catch (err: any) {
      const helpfulMessage = createHelpfulJsonError(err, trimmedValue)
      setParseError(helpfulMessage);
    }
  };

  const handleReset = () => {
    onReset();
  };

  // Only show errors after submit attempt
  const showErrors = submitAttempted;
  const hasValidationErrors = !isEmptyObject(validationResult);
  
  // Determine which error to show: parseError takes priority, then validation errors
  const hasError = showErrors && (parseError || hasValidationErrors);
  const errorMessages = showErrors
    ? parseError
      ? [parseError]
      : hasValidationErrors
        ? formatValidationErrors(validationResult)
        : undefined
    : undefined;

  // Calculate rows based on content (min 8, max 30)
  const lineCount = jsonText.split('\n').length;
  const calculatedRows = Math.min(Math.max(lineCount + 2, 8), 30);

  return (
    <div>
      <EuiFormRow
        label="Edit Data as JSON"
        isInvalid={!!hasError}
        error={errorMessages}
        fullWidth
      >
        <EuiTextArea
          fullWidth
          rows={calculatedRows}
          value={jsonText}
          onChange={handleJsonChange}
          isInvalid={!!hasError}
          style={{ fontFamily: 'monospace' }}
        />
      </EuiFormRow>
      <div className="mt-6 flex gap-x-8 items-center">
        <EuiButton disabled={isSubmitting} type="submit" fill onClick={(e)=>{
          if (!submitAttempted){
            if (parseError){
              setSubmitAttempted(true);
              e.preventDefault();
              return 
            }
          }
          
          onSubmit(e)
        }}>
          Run
        </EuiButton>
        <div className="flex gap-x-2">
          <EuiButtonEmpty onClick={handleReset}>Reset to Default</EuiButtonEmpty>
          <EuiButtonEmpty onClick={onSwitchToForm}>
            Switch to Form
          </EuiButtonEmpty>
        </div>
      </div>
    </div>
  );
};


function mapControlsToElements(
  controls: Control<any, WithChooseOptions>[],
  callback: (control: Control<any, WithChooseOptions>) => any, accords, onToggle
): any[] {
  const mappedControls: any[] = []
  controls.forEach(control => {
    if (control.type === 'section') {
      const nestedElements: any[] = []
      //@ts-ignore 
      control.controls.forEach(nestedControl => {
        nestedElements.push(callback(nestedControl))
      })

      if (!nestedElements.every(x => x === null)) {
        mappedControls.push(
          <CollapsibleSection onToggle={(isOpen) => {
            const newState = isOpen ? 'open' : 'closed'
            onToggle(control.id, newState)
          }} forceState={accords[control.id]} key={control.id} title={control.label}>
            {nestedElements}
          </CollapsibleSection>
        )
      }
    } else {
      mappedControls.push(callback(control)) // Map each top-level control
    }
  })

  return mappedControls
}

function isFunc(isRequired: any) {
  return typeof isRequired === "function"
}

function convertToBool(isRequired?: boolean | ((data: any) => boolean), data?: any): boolean {
  if (typeof isRequired === "boolean") {
    return isRequired
  } else if (isFunc(isRequired)) {
    // @ts-ignore
    return !!isRequired(data)
  } else {
    return false
  }
}
const InputFields = ({
  filePickerRefs, 
  isSubmitting,
  validationResult,
  controls,
  data,
  onDataChange,
  onSubmit,
  onReset,
  submitAttempted,
  accords,
  onToggle,
  enableCache,
  onEnableCacheChange,
  showCache,
  onSwitchToJson,
}: {
  filePickerRefs: any;
  isSubmitting: boolean;
  validationResult: any;
  controls: any;
  data: any;
  onDataChange: (id: string, value: any) => void;
  onSubmit: (e?: any) => void;
  onReset: () => void;
  submitAttempted: boolean;
  accords: any;
  onToggle: (id: string, state: string) => void;
  enableCache: boolean;
  onEnableCacheChange: (value: boolean) => void;
  showCache: boolean;
  onSwitchToJson: () => void;
}) => {
  const handleInputChange = (id, value) => {
    onDataChange(id, value)
  }

  return (
    <div>
      {mapControlsToElements(controls.controls, (control:any) => {
        const { id, type, label, helpText, options, isShown, isDisabled, disabledMessage, isRequired } = control
        if (isShown && !isShown(data)) {
          return null
        }

        const disabled = convertToBool(isDisabled, data)
        const isRequiredResult = convertToBool(isRequired, data)
        const disabledMsg = disabled ? disabledMessage : undefined

        let inputElement

        switch (type) {
          case 'text':
            inputElement = (
              <TextField
                title={disabledMsg}
                disabled={disabled}
                placeholder={(control as any).placeholder}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
            case 'search':
              inputElement = (
                <SearchField
                  title={disabledMsg}
                  disabled={disabled}
                  placeholder={(control as any).placeholder}
                  name={id}
                  value={data[id]}
                  onChange={value => handleInputChange(id, value)}
                />
              )
              break                      
            case 'link':
            inputElement = (
              <TextField
                title={disabledMsg}
                disabled={disabled}
                placeholder={(control as any).placeholder}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'textarea':
            inputElement = (
              <TextAreaField
                title={disabledMsg}
                disabled={disabled}
                placeholder={(control as any).placeholder}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'jsonTextArea':
            inputElement = (
              <JsonTextAreaField
                title={disabledMsg}
                disabled={disabled}
                placeholder={(control as any).placeholder}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'number':
            inputElement = (
              <NumberField
                title={disabledMsg}
                disabled={disabled}
                style={{ maxWidth: '400px' }}
                name={id}
                placeholder={(control as any).placeholder}
                min={(control as any).min}
                max={(control as any).max}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'switch':
            inputElement = (
              <SwitchField
                title={disabledMsg}
                disabled={disabled}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'checkbox':
            inputElement = (
              <CheckboxField
                title={disabledMsg}
                disabled={disabled}
                name={id}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
          case 'choose':
            inputElement = (
              <ChooseField
                isRequired={isRequiredResult}
                title={disabledMsg}
                disabled={disabled}
                name={id}
                value={data[id]}
                options={options as any}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
            case 'select':
              const hasSearchMethod = !!(control as any).searchMethod;
              inputElement = hasSearchMethod ? (
                <SearchSingleSelectApi
                  controls={controls}
                  title={disabledMsg}
                  isDisabled={disabled}
                  style={{ maxWidth: '400px' }}
                  name={id}
                  value={data[id]}
                  onChange={value => handleInputChange(id, value)}
                  searchMethod={(control as any).searchMethod}
                  canCreateOptions={(control as any).canCreateOptions}
                  data={data}
                />
              ) : (
                <SingleSelect
                  title={disabledMsg}
                  isDisabled={disabled}
                  style={{ maxWidth: '400px' }}
                  name={id}
                  options={options}
                  value={data[id]}
                  onChange={value => handleInputChange(id, value)}
                  canCreateOptions={(control as any).canCreateOptions}
                />
              )
              break
              case 'multiSelect':
                const hasMultiSearchMethod = !!(control as any).searchMethod;
                inputElement = hasMultiSearchMethod ? (
                  <SearchMultiSelectApi
                    controls={controls}
                    title={disabledMsg}
                    isDisabled={disabled}
                    style={{ maxWidth: '400px' }}
                    name={id}
                    value={data[id]}
                    onChange={value => handleInputChange(id, value)}
                    searchMethod={(control as any).searchMethod}
                    canCreateOptions={(control as any).canCreateOptions}
                    canBulkAdd={(control as any).canBulkAdd}
                    data={data}
                  />
                ) : (
                  <InputMultiSelect
                    title={disabledMsg}
                    isDisabled={disabled}
                    style={{ maxWidth: '400px' }}
                    name={id}
                    options={options}
                    value={data[id]}
                    onChange={value => handleInputChange(id, value)}
                    canCreateOptions={(control as any).canCreateOptions}
                    canBulkAdd={(control as any).canBulkAdd}
                  />
                )
                break              
          case 'listOfTexts':
            inputElement = (
              <ListOfTextFields
                id={id}
                islinks={false}
                title={disabledMsg}
                disabled={disabled}
                placeholder={(control as any).placeholder}
                value={data[id]}
                onChange={value => handleInputChange(id, value)}
              />
            )
            break
            case 'listOfLinks':
              inputElement = (
                <ListOfTextFields
                  id={id}
                  islinks={true}
                  title={disabledMsg}
                  disabled={disabled}
                  placeholder={(control as any).placeholder}
                  value={data[id]}
                  onChange={value => handleInputChange(id, value)}
                />
              )
              break
              case 'filePicker':
                inputElement = (
                  <DragDropFileUploader
                    disabled={disabled}
                    filePickerRef={(el) =>{
                      filePickerRefs[id] = el
                    }} // Pass the ref
                    title={disabledMsg}
                    multiple={control.multiple  as any}
                    acceptedFileTypes={control.accept as any}
                    name={id}
                    onChange={value => handleInputChange(id, value)}
                  />
                )
                break              
          default:
            throw new Error(`Unknown control type: ${type}`)
        }
        return (
          <EuiFormRow
            key={id}
            label={
              helpText ? (
                <EuiToolTip content={helpText}>
                  <span>
                    {label} <EuiIcon type="questionInCircle" color="subdued" />
                  </span>
                </EuiToolTip>
              ) : (
                label
              )
            }
            isInvalid={submitAttempted && validationResult.hasOwnProperty(id)}
            error={validationResult[id]}
            fullWidth>
            {inputElement}
          </EuiFormRow>
        )
      }, accords, onToggle)}
      {showCache && <CollapsibleSection
        onToggle={(isOpen) => {
          const newState = isOpen ? 'open' : 'closed'
          onToggle('enableCache', newState)
        }}
        forceState={accords['enableCache']}
        key="enableCacheAccord"
        title="Caching"
      >
        <EuiFormRow label="Use Cache">
          <CheckboxField
            name="enableCache"
            value={enableCache}
            onChange={onEnableCacheChange}
          />
        </EuiFormRow>
      </CollapsibleSection>}
      <div className="mt-6 flex gap-x-8 items-center">
        <EuiButton disabled={isSubmitting} type="submit" fill onClick={onSubmit}>
          Run
        </EuiButton>
        <div className="flex gap-x-2">
          <EuiButtonEmpty onClick={onReset}>Reset to Default</EuiButtonEmpty>
          <EuiButtonEmpty onClick={onSwitchToJson}>
            Switch to JSON
          </EuiButtonEmpty>
        </div>
      </div>
    </div>
  )
}

// There is a Bug in Next.js such that if 
// we change state to make an element disabled
// Then reload, (local storage gives different state and default state is different) 
// Then next.js does not disable the element and keep it enabled
// fix is to render inputs in client side only

const NextOnlyFields = ClientOnly(InputFields)


function getDefaultData(controls: any) {
  return { ...controls.getDefaultData() }
}


function shouldBeOpenResult(control: any, validationResult: any) {
  for (let i = 0; i < control.controls.length; i++) {
    const nestedControl = control.controls[i]
    if (validationResult.hasOwnProperty(nestedControl.id)) {
      return 'open'
    }
  }
  return 'closed'
}
function getInitialData(scraper_name, input_js_hash, controls) {
  const defaultData = getDefaultData(controls)
  if (typeof window === 'undefined') {
    return defaultData
  }

  const savedData = localStorage.getItem(
    createDataKey(scraper_name, input_js_hash)
  )
  return savedData ? JSON.parse(savedData) : defaultData
}


function createDataKey(scraper_name: any, input_js_hash: any): string {
  return `input_${scraper_name}_${input_js_hash}`
}

function getLastScraper(scrapers) {
  if (typeof window === 'undefined') {
    return scrapers[0];
  }

  const input_scraper = localStorage.getItem('input_scraper');
  
  if (input_scraper) {
    const selectedScraper = scrapers.find(
      (scraper) => scraper.scraper_name === input_scraper
    );  
    if (selectedScraper) {
      return selectedScraper;
    }
  }
  return scrapers[0];
}

function createInitialData(selectedScraper: any) {
  const controls = createControls(scraperToInputJs[selectedScraper.scraper_name])
  const initial_data = getInitialData(
    selectedScraper.scraper_name,
    selectedScraper.input_js_hash,
    controls
  )
  return {
    "data": initial_data,
    "selectedScraper": selectedScraper
  }
}

const ScraperFormContainer = ({ scrapers, enable_cache }) => {
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isJsonEditorMode, setIsJsonEditorMode] = useState(false)

  const [{data, selectedScraper }, setData] = useState(() =>{
    const selectedScraper =  getLastScraper(scrapers)
    return createInitialData(selectedScraper)
  })
  
  const controls = useMemo(
    () => createControls(scraperToInputJs[selectedScraper.scraper_name]),
    [selectedScraper.scraper_name]
  )

  const getCacheValue = () => {
    const newLocal = getEnableCacheDefaultValue(enable_cache, selectedScraper.scraper_name, selectedScraper.input_js_hash)
    return newLocal
  }
  const [enableCache, setEnableCache] = useState(getCacheValue)

  const filePickerControlIds = useMemo(() => {
    return controls.getFilePickerControlIds();
  }, [selectedScraper.scraper_name]);




  const filePickerRefs = useMemo(
    () => filePickerControlIds.reduce((acc, id) => {
      acc[id] = null;
      return acc;
    }, {}),
    [selectedScraper.scraper_name]
  )
  
  const resetFilePickers = () => {

    // Call removeFiles on each ref to reset file inputs
    Object.values(filePickerRefs).forEach((el:any) => {
      el?.removeFiles();
    });
  };
  
  const handleDataChange = (id, value) => {
    setData(prevData => {
      const newData = { ...prevData.data, [id]: value }
      const filePickerData = filePickerControlIds.reduce((acc, id) => {
        acc[id] = []; // Reset file picker data
        return acc;
      }, {});
      saveDataToLocalStorage(selectedScraper, {...newData, ...filePickerData})
      return {...prevData, data:newData} 
    })
  }

  // Handler for JSON editor - sets entire data object
  const handleJsonDataChange = (newData: any) => {
    const filePickerData = filePickerControlIds.reduce((acc, id) => {
      acc[id] = []; // Reset file picker data
      return acc;
    }, {});
    saveDataToLocalStorage(selectedScraper, {...newData, ...filePickerData})
    setData(prevData => ({...prevData, data: newData}))
  }

  const handleResetData = () => {
    const dd = getDefaultData(controls)
    localStorage.setItem(
      `input_${selectedScraper.scraper_name}_${selectedScraper.input_js_hash}`,
      JSON.stringify(dd)  
    )
    resetFilePickers()
    setData(x=>({...x, data:dd}))
  }
  const router = useRouter()
  // @ts-ignore
  let validationResult
  try {
    // @ts-ignore
    validationResult = controls.validate(data)
  } catch (error) {
    // @ts-ignore
    const fullError = error.stack || error.toString()
      return <Container>
      <EmptyFailedInputJs error={fullError} />
      </Container>

    // <div>{}</div>   
  }

  const [accords, setaccords] = useState(() => {
    const rs = {}
    // @ts-ignore
    controls.controls.forEach(control => {
      if (control.type === 'section') {        //@ts-ignore 
        rs[control.id] = shouldBeOpenResult(control, validationResult)
      }
    })
    rs['enableCache'] = 'closed'

    return rs
  })
  const onToggle = (id, state) => {
    setaccords((x) => ({ ...x, [id]: state }))
  }

  const handleSubmit = async e => {
    e?.preventDefault()
    setSubmitAttempted(true)
    if (isEmptyObject(validationResult)) {
      setIsSubmitting(true)
      try {
        const response = await Api.createAsyncTask({
          scraper_name: selectedScraper.scraper_name,
          data,
          enable_cache: enableCache}).finally(() => setIsSubmitting(false))
        if (response) {
          const result = response.data
          const isarr = Array.isArray(result)
          if (isarr && result.length === 0) {
            Toast.error('No Tasks were created.')
          }else {
            const outputId = isarr ? result[0].id : result.id
            if (outputId) {
            pushToRoute(router, `/tasks/${outputId}`)
            } else {
              console.error("failed", result)
            }
          }
        }        
        } catch (error:any) {
          if (error.message && error.message.includes('GOOGLE_CHROME_REQUIRED')) {
            showGoogleChromeRequiredModal()
          } else {
            throw error;
          }        }
        } else {
        const rs = { ...accords }

        // @ts-ignore
        controls.controls.forEach(control => {
        if (control.type === 'section') {        //@ts-ignore 
          if (rs[control.id] === 'closed') {
            rs[control.id] = shouldBeOpenResult(control, validationResult)
          }
        }
        })

        setaccords(rs)
        }
        }
        const { modal:googleChromeRequiredModal, showModal:showGoogleChromeRequiredModal } = useGoogleChromeRequiredModal()
      
// @ts-ignore
if (!controls.controls.length) {
return <EmptyInputs />
}
  // Only Allow switching cache on and off, if user explicitly  turns it on
  const showCache = enable_cache === true
return (
<>
{googleChromeRequiredModal}
{scrapers.length <= 1 || typeof window === 'undefined' ? null : (
<ScraperSelector
  scrapers={scrapers}
  selectedScraper={selectedScraper}
  onSelectScraper={(x)=>{
    localStorage.setItem(
      `input_scraper`,
      x.scraper_name
    )
     resetFilePickers()
     setSubmitAttempted(false)
     
      setEnableCache(getEnableCacheDefaultValue(enable_cache, x.scraper_name, x.input_js_hash))
      setData(createInitialData(x))
  }}
/>)}
<EuiForm
isInvalid={submitAttempted && !isEmptyObject(validationResult)}
invalidCallout="none"
component="form"
onSubmit={handleSubmit}>
{isJsonEditorMode ? (
  <JsonDataEditor
    data={data}
    onDataChange={handleJsonDataChange}
    onSwitchToForm={() => {
      resetFilePickers()
      setSubmitAttempted(false)
      setIsJsonEditorMode(false)
    }}
    onSubmit={handleSubmit}
    onReset={handleResetData}
    setSubmitAttempted={setSubmitAttempted}
    isSubmitting={isSubmitting}
    submitAttempted={submitAttempted}
    validationResult={validationResult}
  />
) : (
  <NextOnlyFields
    filePickerRefs={filePickerRefs}
    onReset={handleResetData}
    accords={accords}
    onToggle={onToggle}
    validationResult={validationResult}
    controls={controls}
    data={data}
    onDataChange={handleDataChange}
    onSubmit={handleSubmit}
    isSubmitting={isSubmitting}
    submitAttempted={submitAttempted}
    enableCache={enableCache}
    showCache={showCache}
    onEnableCacheChange={(x) =>{
      setEnableCacheDefaultValue(x, selectedScraper.scraper_name, selectedScraper.input_js_hash);
      setEnableCache(x);
      }}
    onSwitchToJson={() => {
      setSubmitAttempted(false)
      setIsJsonEditorMode(true)
    }}
  />
)}
</EuiForm>
</>

)
}

const InputComponent = ({ scrapers , enable_cache}) => {
if (!scrapers || scrapers.length === 0) {
return <EmptyScraper />
}

return <ScraperFormContainer enable_cache={enable_cache} scrapers={scrapers} />
}

export default InputComponent


function createCacheKey(scraper_name: any, input_js_hash: any): string {
  return `cache_${scraper_name}_${input_js_hash}`;
}
function getEnableCacheDefaultValue(enable_cache: any, scraper_name: any, input_js_hash: any): any {
  const val = localStorage.getItem(createCacheKey(scraper_name, input_js_hash));
  if (val != null) {
    return JSON.parse(val);
  }
  return enable_cache;
}

function setEnableCacheDefaultValue(value: any, scraper_name: any, input_js_hash: any): void {
  localStorage.setItem(createCacheKey(scraper_name, input_js_hash), JSON.stringify(value));
}
