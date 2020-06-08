import React from "react"
import ReactDOM from 'react-dom';
import { LinearProgress, Typography } from "@material-ui/core"
import { useServiceData } from "./hooks"
import FormsApp from "./FormsApp"
import SheetsApp from "./SheetsApp"


const App = ({ context } : Context) => {
    switch (context) {
        case 'forms':
            return <FormsApp />
        case 'sheets':
            return <SheetsApp />
        default:
            return null
    }
}


const Main = () => {
    const [props, loadingProps, error] = useServiceData<Context>('getContext')

    return (
        <div>
            {loadingProps 
                ? <LinearProgress />
                : (error 
                    ? <Typography>{error.message}</Typography>
                    : <App {...(props as Context)} />) }
        </div>
    )
}

ReactDOM.render(<Main />, document.getElementById("root"));
