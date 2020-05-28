import React, { useState, useEffect } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@material-ui/core'
import { useServiceCall } from '../hooks'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  }),
)

export default function Setup({ selectedItems, tableName: currentTableName } : FormsDocumentProps) {
  const classes = useStyles()
  const [activeStep, setActiveStep] = useState(0)
  const [tableName, setTableName] = useState(currentTableName)
  const [formsData, loadingFormsData, errorFormsData, getFormsData] = useServiceCall<FormsData>('getFormsData');

  useEffect(
    () => getFormsData(), [])

  
  const steps = ['Velg tabell navn', 'Velg spørsmål']
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <form noValidate autoComplete="off">
            <TextField 
              label="Tabellnavn i dataplattform" 
              value={tableName} 
              onChange={({target: {value}}) => setTableName(value)} />
          </form>
        )
      case 1:
        return (
          <Paper square elevation={0}>
            {loadingFormsData 
            ? <CircularProgress/>
            : <FormControl component="fieldset">
                <FormGroup>
                  {formsData.items.map(x => {
                    return (
                    <FormControlLabel
                      control={<Checkbox checked={true} onChange={() => {}} name={x.id.toString()} />}
                      label={x.title} />
                    )
                  })}
                </FormGroup>
              </FormControl>}
          </Paper>
        )
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(index)}
              <div className={classes.actionsContainer}>
                <div>
                  {activeStep !== 0 ? 
                  <Button
                    className={classes.button}
                    onClick={handleBack}>
                    Tilbake
                  </Button> : null}
                  <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Fullfør' : 'Neste'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>Form blir synkronisert med dataplattform!</Typography>
        </Paper>
      )}
    </div>
  )
}