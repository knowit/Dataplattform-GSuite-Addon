import React, { useState, useEffect } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import {
    Step,
    Stepper,
    StepLabel,
    StepContent,
    Button,
    CircularProgress
} from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        actionsContainer: {
            marginBottom: theme.spacing(2),
            display: 'flex',
            alignItems: 'center',
        },
        resetContainer: {
            padding: theme.spacing(3),
        },
        buttonWrapper: {
            position: 'relative',
        },
        buttonProgress: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -4,
            marginLeft: -12,
        }
    }),
)


interface LinearStepperProps {
    steps: string[]
    invalid?: boolean,
    loading?: boolean,
    getStepContent: (step: number) => JSX.Element | null | undefined
    onChangeStep?: (step: number) => void
    onComplete?: () => void
}

export default function LinearStepper(
    {
        steps,
        invalid = false,
        loading = false,
        getStepContent,
        onChangeStep = () => { },
        onComplete = () => { }
    }: LinearStepperProps) {
    const classes = useStyles()
    const [nextActiveStep, setNextActiveStep] = useState(0)
    const [activeStep, setActiveStep] = useState(0)

    useEffect(
        () => {
            if (!loading && nextActiveStep != activeStep) {
                setActiveStep(nextActiveStep)
            }
        },
        [nextActiveStep, loading])

    const handleNext = () => {
        const nextStep = activeStep + 1
        onChangeStep(nextStep)
        if (nextStep === steps.length) {
            onComplete()
        }
        setNextActiveStep(nextStep)
    }

    const handleBack = () => {
        const nextStep = activeStep - 1
        onChangeStep(nextStep)
        setNextActiveStep(nextStep)
    }

    return (
        <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                        {getStepContent(index)}
                        <div className={classes.actionsContainer}>
                            <div className={classes.buttonWrapper}>
                                {activeStep !== 0 ?
                                    <Button
                                        className={classes.button}
                                        onClick={handleBack}
                                        size="small"
                                        variant="outlined">
                                        Tilbake
                                  </Button>
                                    : null}
                            </div>
                            <div className={classes.buttonWrapper}>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={invalid || loading}
                                    onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Fullfør' : 'Neste'}
                                </Button>
                                {loading && <CircularProgress size={18} className={classes.buttonProgress} />}
                            </div>
                        </div>
                    </StepContent>
                </Step>
            ))}
        </Stepper>
    )
}