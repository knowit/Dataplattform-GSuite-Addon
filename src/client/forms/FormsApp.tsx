import React from "react"
import { LinearProgress, Typography } from "@material-ui/core"
import Setup from "./Setup"
import { useServiceData } from "../hooks"

export default function FormsApp() {
    const [props, loadingProps, error] = useServiceData<FormsDocumentProps>('getFormsDocumentProperties')

    return (
        <div>
            {loadingProps 
                ? <LinearProgress />
                : (error 
                    ? <Typography>{error.message}</Typography>
                    : <Setup {...props as FormsDocumentProps}/>) }
        </div>
    )
}
