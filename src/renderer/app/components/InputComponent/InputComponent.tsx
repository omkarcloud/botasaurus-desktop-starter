import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty'
import { EuiForm } from '@elastic/eui/optimize/es/components/form/form';
import { EuiFormRow } from '@elastic/eui/optimize/es/components/form/form_row/form_row';
import { EuiIcon } from '@elastic/eui/optimize/es/components/icon/icon';
import { EuiToolTip } from '@elastic/eui/optimize/es/components/tool_tip/tool_tip';
import { Control, createControls, WithChooseOptions } from 'botasaurus-controls';
import { useMemo, useRef, useState } from 'react';

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
import SwitchField from '../inputs/SwitchField';
import TextAreaField from '../inputs/TextAreaField';
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
              inputElement = (
                <SingleSelect
                  title={disabledMsg}
                  isDisabled={disabled}
                  style={{ maxWidth: '400px' }}
                  name={id}
                  options={options}
                  value={data[id]}
                  onChange={value => handleInputChange(id, value)}
                />
              )
              break
              case 'multiSelect':
                inputElement = (
                  <InputMultiSelect
                    title={disabledMsg}
                    isDisabled={disabled}
                    style={{ maxWidth: '400px' }}
                    name={id}
                    options={options}
                    value={data[id]}
                    onChange={value => handleInputChange(id, value)}
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
      <div className="mt-6 flex gap-x-8">
        <EuiButton disabled={isSubmitting} type="submit" fill onClick={onSubmit}>
          Run
        </EuiButton>
        <EuiButtonEmpty onClick={onReset}>Reset to Default</EuiButtonEmpty>
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
      // @ts-ignore
      const cleanedData = controls.getBackendValidationResult(data)['data']
      setIsSubmitting(true)
      try {
        const response = await Api.createAsyncTask({
          scraper_name: selectedScraper.scraper_name,
          data: cleanedData,
          enable_cache: enableCache}).finally(() => setIsSubmitting(false))
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
     
      setEnableCache(getEnableCacheDefaultValue(enable_cache, x.scraper_name, x.input_js_hash))
      setData(createInitialData(x))
  }}
/>)}
<EuiForm
isInvalid={submitAttempted && !isEmptyObject(validationResult)}
invalidCallout="none"
component="form"
onSubmit={handleSubmit}>
<NextOnlyFields
  filePickerRefs={filePickerRefs}
  onReset={() => {
    const dd = getDefaultData(controls)
    localStorage.setItem(
      `input_${selectedScraper.scraper_name}_${selectedScraper.input_js_hash}`,
      JSON.stringify(dd)
    )
    resetFilePickers()
    setData(x=>({...x, data:dd}))
  }}
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
/>
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
