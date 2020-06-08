import React, { useEffect, useState } from "react"
import { 
    LinearProgress, 
    Typography, 
    Button, 
    TextField,
    Container,
    Paper,
    List,
    ListItem,
    ListItemText} from "@material-ui/core"
import { useServiceCall } from "./hooks"
import LinearStepper from './LinearStepper';
import CheckList from './CheckList';

interface FormsDataProps {
    tableName: string,
    selectedItems: FormsItem[]
}

const FormsDataList = ({
    tableName,
    selectedItems
} : FormsDataProps) => (
    <Paper elevation={0}>
        <List dense={true}>
            <ListItem>
                <ListItemText 
                    primary={tableName} 
                    secondary="Tabellnavn"/>
            </ListItem>
            <ListItem >
                <ListItemText 
                    primary={selectedItems.map(x => x.title).join(', ')} 
                    secondary="Spørsmål"/>
            </ListItem>
        </List>
    </Paper>
)


type FormsSetupProps = FormsDocumentProps & { onDone: () => void }

const SetupForm = ({
    tableName: currentTableName,
    selectedItems: currentSelectedItems,
    onDone
} : FormsSetupProps) => {
    const [
        formsProps, 
        formsLoadingProps, 
        formsError, 
        getFormsData] = useServiceCall<FormsData>('getFormsData')
    const [
        postFormsResult,  
        postFormsLoading, 
        postFormsError, 
        postForms] = useServiceCall<PostFormsData>('postForms')

    const [ tableName, setTableName ] = useState(currentTableName)
    const [ selectedItems, setSelectedItems ] = useState(currentSelectedItems)
    
    const isValidTableName = (value: string) => value && !Boolean(/\s/g.test(value))
    const [ validTableName, setValidTableName ] = useState(isValidTableName(currentTableName))

    useEffect(() => {
        if (postFormsResult && postFormsResult.success) {
            onDone()
        }
    }, [postFormsLoading])

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
                    <CheckList 
                        items={(formsProps ? formsProps.items : [])}
                        selected={selectedItems}
                        header={'Spørsmål'}
                        onSelectAll={() => setSelectedItems([...(formsProps ? formsProps.items : [])])}
                        onDeselectAll={() => setSelectedItems([])}
                        onSelect={(item => setSelectedItems([...[item], ...selectedItems]))}
                        onDeselect={(item => setSelectedItems(selectedItems.filter(x => x.id !== item.id)))}/>    
                )
            case 2: 
                return (
                    <FormsDataList 
                        tableName={tableName}
                        selectedItems={selectedItems}/>
                )
        }
    }

    const onChangeStep = (step: number, prevStep: number) => {
        if(step === 1 && prevStep === step-1) 
            getFormsData()
    }

    const onComplete = () => {
        postForms(tableName, selectedItems.map(x => x.id))
    }
    
    return (
        <Paper elevation={0}>
            <LinearStepper 
                steps={['Velg tabellnavn', 'Velg Spørsmål', 'Er alt greit?']}
                getStepContent={getStepContent}
                onChangeStep={onChangeStep}
                onComplete={onComplete}
                invalid={!validTableName || selectedItems.length === 0}
                loading={formsLoadingProps || postFormsLoading}/> 
            {formsError ? <Typography>{formsError.message}</Typography> : null}
            {postFormsError ? <Typography>{postFormsError.message}</Typography> : null}
            {postFormsResult && !postFormsResult.success ? <Typography>{postFormsResult.message}</Typography> : null}
        </Paper>
    )
}


const Setup = ({
    syncing,
    tableName,
    onDone,
    ...props
} : FormsSetupProps) => {
    const [isHasBeenSynced, setHasBeenSynced] = useState(syncing)

    return (
        <Container fixed>
            {!isHasBeenSynced 
                ? <SetupForm 
                    syncing={syncing}
                    tableName={tableName}
                    onDone={() => {
                        setHasBeenSynced(true)
                        onDone()
                    }}
                    {...props}/> 
                : (
                    <Paper elevation={0}>
                        <List dense={true}>
                            <ListItem>
                                <ListItemText 
                                    primary={'Denne spørreundersøkelsen sender data til dataplattform'} />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary={tableName} 
                                    secondary="Tabellnavn"/>
                            </ListItem>
                            <ListItem >
                                <Button 
                                    onClick={() => setHasBeenSynced(false)}
                                    variant="contained"
                                    color="primary">
                                    Sett opp på nytt
                                </Button>
                            </ListItem>
                        </List>
                    </Paper>
                )}
        </Container>
    )
}

export default function FormsApp() {
    const [
        documentProps, 
        documentLoadingProps, 
        documentError, 
        getFormsDocumentProperties] = useServiceCall<FormsDocumentProps>('getFormsDocumentProperties')

    useEffect(() => getFormsDocumentProperties(), [])

    return (
        <div>
            {documentLoadingProps 
                ? <LinearProgress />
                : (documentError 
                    ? <Typography>{documentError.message}</Typography>
                    : <Setup 
                        onDone={() => getFormsDocumentProperties()}
                        {...documentProps as FormsDocumentProps} />) } 
            
        </div>
    )
}
