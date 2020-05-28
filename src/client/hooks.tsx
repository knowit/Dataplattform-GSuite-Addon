import { useCallback, useEffect, useState } from 'react'

type AsyncFunction<T> = (...args : any[]) => Promise<T>
type AsyncData<T, K> = [
    (...args: any[]) => void, 
    boolean, 
    T | null,
    K | null]

type ServiceData<T> = [
    T | null, 
    boolean, 
    Error | null]

type ServiceCall<T> = [
    T | null, 
    boolean, 
    Error | null,
    (...args: any[]) => void]
    

export function useAsync<T, K = Error>(asyncFunction : AsyncFunction<T>) : AsyncData<T, K> {
    const [ pending, setPending ] = useState(false);
    const [ value, setValue ] = useState<T | null>(null);
    const [ error, setError ] = useState<K | null>(null);

    const execute = useCallback(async (...args: any[]) => {
        setPending(true);
        setValue(null);
        setError(null);

        try {
            const result = await asyncFunction(...args)
            setValue(result)
        } catch(error) {
            setError(error)
        }

        setPending(false)
    }, [asyncFunction])

    return [execute, pending, value, error]
}

export function useServiceCall<T>(method: string) : ServiceCall<T> {
    const [execute, pending, value, error] = useAsync<T>((...args: any[]) => {
        return new Promise<T>((resolve, reject) => {
            // @ts-ignore
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                [method](...args)
        })
    });

    return [
        value, 
        pending,
        error,
        execute
    ]
}

export function useServiceData<T>(method: string, ...args: any[]) : ServiceData<T> {
    const [data, loading, error, handler] = useServiceCall<T>(method)
    
    useEffect(() => handler(...args), [...args])

    return [
        data, 
        loading,
        error
    ]
}
