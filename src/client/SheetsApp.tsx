import React, { useState, useEffect } from "react"
import { 
    LinearProgress, 
    Typography, 
    Button, 
    Checkbox, 
    TextField,
    Container,
    FormControlLabel,
    Paper,
    List,
    ListItem,
    ListItemText } from "@material-ui/core"
import { useServiceCall } from "./hooks"
import LinearStepper from './LinearStepper';

const SheetsDataList = (props : SheetsData) => 
    <Paper elevation={0}>
        <List dense={true}>
            <ListItem>
                <ListItemText 
                    primary={props.a1} 
                    secondary="A1 seleksjon"/>
            </ListItem>
            <ListItem >
                <ListItemText 
                    primary={props.columnNames.join(', ')} 
                    secondary="Kolonnenavn"/>
            </ListItem>
        </List>
    </Paper>


type SheetsSetupProps = SheetsDocumentProps & { onDone: () => void }


const SetupForm = ({
    tableName: currentTableName,
    onDone
} : SheetsSetupProps) => {
    const [
        sheetProps, 
        sheetLoadingProps, 
        sheetError, 
        getSheetsData] = useServiceCall<SheetsData>('getSheetsData')
    const [
        postSheetResult,  
        postSheetLoading, 
        postSheetError, 
        postSheet] = useServiceCall<PostSheetsData>('postSheet')

    const [selectionOnly, setSelectionOnly] = useState(false)
    const [tableName, setTableName] = useState(currentTableName)
    
    const isValidTableName = (value: string) => value && !Boolean(/\s/g.test(value))
    const [validTableName, setValidTableName] = useState(isValidTableName(currentTableName))

    useEffect(() => {
        if (postSheetResult && postSheetResult.success) {
            onDone()
        }
    }, [postSheetLoading])

    const getStepContent = (step: number) => {
        switch(step) {
            case 0: 
                return (
                    <TextField 
                        label="Tabellnavn" 
                        value={tableName} 
                        onChange={({target: {value}}) => {
                            setTableName(value)
                            setValidTableName(isValidTableName(value))
                        }} />
                )
            case 1: 
                return (
                    <FormControlLabel
                        control={<Checkbox checked={selectionOnly} onClick={() => setSelectionOnly(!selectionOnly)} />}
                        label={'Post data kun fra den aktive seleksjonen?'} />
                )
            case 2: 
                return <SheetsDataList {...sheetProps as SheetsData}/>
        }
    }

    const onChangeStep = (step: number) => {
        if(step === 2) 
            getSheetsData(selectionOnly)
    }

    const onComplete = () => {
        if(sheetProps) {
            postSheet(tableName, sheetProps.name, sheetProps.a1)
        }
    }
    
    return (
        <Paper elevation={0}>
            <LinearStepper 
                steps={['Velg tabellnavn', 'Datautvalg', 'Er alt greit?']}
                getStepContent={getStepContent}
                onChangeStep={onChangeStep}
                onComplete={onComplete}
                invalid={!validTableName}
                loading={sheetLoadingProps || postSheetLoading}/> 
            {sheetError ? <Typography>{sheetError.message}</Typography> : null}
            {postSheetError ? <Typography>{postSheetError.message}</Typography> : null}
            {postSheetResult && !postSheetResult.success ? <Typography>{postSheetResult.message}</Typography> : null}
        </Paper>
    )
}


const Setup = ({
    lastPushDate,
    tableName,
    onDone
} : SheetsSetupProps) => {
    const [hasPush, setHasPush] = useState(Boolean(lastPushDate))

    return (
        <Container fixed>
            {!hasPush 
                ? <SetupForm 
                    lastPushDate={lastPushDate}
                    tableName={tableName}
                    onDone={() => {
                        setHasPush(true)
                        onDone()
                    }}/> 
                : (
                    <Paper elevation={0}>
                        <List dense={true}>
                            <ListItem>
                                <ListItemText 
                                    primary={tableName} 
                                    secondary="Tabellnavn"/>
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary={lastPushDate} 
                                    secondary="Sist sendt til dataplattform"/>
                            </ListItem>
                            <ListItem >
                                <Button 
                                    onClick={() => setHasPush(false)}
                                    variant="contained"
                                    color="primary">
                                    Send på nytt
                                </Button>
                            </ListItem>
                        </List>
                    </Paper>
                )}
        </Container>
    )
}


export default function SheetsApp() {
    const [
        documentProps, 
        documentLoadingProps, 
        documentError, 
        getSheetsDocumentProperties] = useServiceCall<SheetsDocumentProps>('getSheetsDocumentProperties')

    useEffect(() => getSheetsDocumentProperties(), [])

    return (
        <div>
            {documentLoadingProps 
                ? <LinearProgress />
                : (documentError 
                    ? <Typography>{documentError.message}</Typography>
                    : <Setup 
                        onDone={() => getSheetsDocumentProperties()}
                        {...documentProps as SheetsDocumentProps} />) } 
            
        </div>
    )
}