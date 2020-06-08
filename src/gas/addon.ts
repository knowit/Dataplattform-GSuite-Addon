type OnInstallEvent = GoogleAppsScript.Events.AddonOnInstall
type OnOpenEvent = GoogleAppsScript.Events.FormsOnOpen 
    | GoogleAppsScript.Events.SheetsOnOpen

type AppsScriptApp = GoogleAppsScript.Forms.FormApp 
    | GoogleAppsScript.Spreadsheet.SpreadsheetApp

type AppsScriptUi = GoogleAppsScript.Base.Ui

/**
 *  Events
 */
const onOpen = (_ : OnOpenEvent) => {
    const ui = getUi(FormApp) || getUi(SpreadsheetApp)
    if (!ui) return
    ui.createMenu('Dataplattform')
        .addItem('Åpne', 'openUi')
        .addToUi()
}

const onInstall = (e : OnInstallEvent) => onOpen(e as OnOpenEvent)

const onFormSubmit = (e : GoogleAppsScript.Events.FormsOnFormSubmit) => {
    const url = PropertiesService.getScriptProperties().getProperty('formsUrl') 
    const apiKey = PropertiesService.getScriptProperties().getProperty('apiKey')
    const { tableName, selectedItems, ..._} = getFormsDocumentProperties()

    if (!url || !apiKey)
        throw 'invalid setup'

    const response = toReponsePayload(e.response, selectedItems.map(x => e.source.getItemById(x.id)))

    const resp = UrlFetchApp.fetch(url, {
        'method' : 'post',
        'contentType': 'application/json',
        'headers': {
            'x-api-key': apiKey
        },
        'payload' : JSON.stringify({
            tableName,
            responses: [response],
            user: Session.getEffectiveUser().getEmail()
        })
    })

    if (resp.getResponseCode() != 200){
        throw  `server error: ${resp.getResponseCode()}`
    }
}

/**
 *  UI
 */
const openUi = () => {
    const ui = getUi(FormApp) || getUi(SpreadsheetApp)
    if (!ui) return
    ui.showSidebar(HtmlService.createHtmlOutputFromFile('index').setTitle("Dataplattform"))
}

/**
 * Util
 */
const listFormsItems = () : FormsItem[] => 
    FormApp.getActiveForm().getItems().map(x => {return {'title': x.getTitle(), 'id': x.getId()}})

const getUi = (app : AppsScriptApp ) : AppsScriptUi | null => {
    try { return app ? app.getUi() : null }
    catch (e) { Logger.log(e) }
    return null
}


function getDocumentProperties<T>(defaultProps: T, tag: string) : T {
    const props = PropertiesService.getDocumentProperties().getProperty(tag)
    return props ? JSON.parse(props) as T : defaultProps
}

function setDocumentProperties<T>(update: T, tag: string) {
    PropertiesService.getDocumentProperties().setProperty(tag, JSON.stringify(update))
}

const asTableName = (name: string) => name.toLowerCase().replace(/\s/g, '_')

const toReponsePayload = (
    response: GoogleAppsScript.Forms.FormResponse,
    questions: GoogleAppsScript.Forms.Item[]
) => {
    return {
        respondent: response.getRespondentEmail(),
        timestamp: response.getTimestamp().toISOString(),
        answers: questions.map(item => response.getResponseForItem(item)).filter(x => Boolean(x)).map(itemResponse => {
            return {
                questionsTitle: itemResponse.getItem().getTitle(),
                questionId: itemResponse.getItem().getId(),
                response: itemResponse.getResponse()
            }
        })
    }
}


/**
 *  API
 */
const getContext = () : Context => {
    return {
        context: getUi(FormApp) ? 'forms' : getUi(SpreadsheetApp) ? 'sheets' : null,
        event: null
    }
}

const getFormsData = () : FormsData => {
    return {
        title: FormApp.getActiveForm().getTitle(),
        items: listFormsItems()
    }
}

const getFormsDocumentProperties = () : FormsDocumentProps => getDocumentProperties<FormsDocumentProps>({
        syncing: false,
        selectedItems: listFormsItems(), // Default all selected
        tableName: asTableName(FormApp.getActiveForm().getTitle()), // Default name of form
    }, 'formsProps')
const updateFormsDocumentProperties = (update: FormsDocumentProps) => setDocumentProperties(update, 'formsProps')

const postForms = (tableName: string, questionIds: number[]) : PostFormsData => {
    const form = FormApp.getActiveForm()
    const questions = questionIds.map(x => form.getItemById(x))

    const url = PropertiesService.getScriptProperties().getProperty('formsUrl') 
    const apiKey = PropertiesService.getScriptProperties().getProperty('apiKey')

    if (!url || !apiKey)
        return { success: false, message: 'invalid setup' }

    
    const responses = form.getResponses().map(response => toReponsePayload(response, questions))
       
    const resp = UrlFetchApp.fetch(url, {
        'method' : 'post',
        'contentType': 'application/json',
        'headers': {
            'x-api-key': apiKey
        },
        'payload' : JSON.stringify({
            tableName,
            responses: responses,
            user: Session.getEffectiveUser().getEmail()
        })
    });

    if (resp.getResponseCode() != 200){
        return { success: false, message: `server error: ${resp.getResponseCode()}` }
    }

    if (ScriptApp.getUserTriggers(form).length !== 1)
        ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create()

    updateFormsDocumentProperties({
        syncing: true,
        tableName,
        selectedItems: questions.map(x => {return {'title': x.getTitle(), 'id': x.getId()}})
    })
    
    return { success: true }
}


const getSheetsData = (selection : boolean) : SheetsData => {
    const sheet = SpreadsheetApp.getActiveSheet()

    const range = selection 
        ? sheet.getActiveRange()
        : sheet.getDataRange()
    range?.activate()

    const columnNames = range 
        ? sheet.getSheetValues(
            range.getRow(), range.getColumn(), 1, range.getNumColumns())[0]
        : []
    
    return { 
        columnNames,
        name: sheet.getName(),
        columns: range?.getNumColumns() || 0,
        rows: (range?.getNumRows() || 1) - 1,
        a1: range?.getA1Notation() || ''
    } 
}

const getSheetsDocumentProperties = () : SheetsDocumentProps => getDocumentProperties<SheetsDocumentProps>({
    lastPushDate: null,
    tableName: asTableName(`${SpreadsheetApp.getActiveSpreadsheet().getName()}_${SpreadsheetApp.getActiveSheet().getName()}`)
}, 'sheetsProps')

const updateSheetsDocumentProperties = (update: SheetsDocumentProps) => setDocumentProperties(update, 'sheetsProps')

const postSheet = (tableName: string, name: string, a1: string) : PostSheetsData => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
    const range = sheet?.getRange(a1)

    if (!range)
        return { success: false, message: 'no data selected' }

    const url = PropertiesService.getScriptProperties().getProperty('sheetsUrl') 
    const apiKey = PropertiesService.getScriptProperties().getProperty('apiKey')

    if (!url || !apiKey)
        return { success: false, message: 'invalid setup' }

    const resp = UrlFetchApp.fetch(url, {
        'method' : 'post',
        'contentType': 'application/json',
        'headers': {
            'x-api-key': apiKey
        },
        'payload' : JSON.stringify({
            tableName,
            values: range?.getValues(),
            user: Session.getEffectiveUser().getEmail()
        })
    });

    if (resp.getResponseCode() != 200){
        return { success: false, message: `server error: ${resp.getResponseCode()}` }
    }

    updateSheetsDocumentProperties({
        lastPushDate: new Date().toString(),
        tableName
    })
    return { success: true }
}
