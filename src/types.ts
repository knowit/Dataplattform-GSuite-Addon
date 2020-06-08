interface Context {
    context: 'sheets' | 'forms' | null
    event: string | null
}

interface DocumentProps {
    tableName: string
}

interface PostData {
    success: boolean
    message?: string
}

interface FormsItem {
    title: string
    id: number
}

interface FormsData {
    title: string
    items: FormsItem[]
}

interface FormsDocumentProps extends DocumentProps {
    syncing: boolean
    selectedItems: FormsItem[]
}

interface PostFormsData extends PostData {}

interface SheetsData {
    columnNames: string[],
    name: string
    columns: number
    rows: number
    a1: string
}

interface SheetsDocumentProps extends DocumentProps {
    lastPushDate: string | null
}

interface PostSheetsData extends PostData {}
