import React from 'react'
import { useNavigate as useRouter, useSearchParams } from 'react-router-dom'

function Link({ href, children }: any) {
    const router = useRouter()
    // Handle click event
    const handleClick = (event: React.MouseEvent) => {
        // Prevent default behavior of the event
        event.preventDefault()

        // Navigate to the provided href
        router(href)
    }

    return (
        // Render the child directly without wrapping it in an anchor tag
        React.cloneElement(children, { href, onClick: handleClick })
    )

}

// Build URL with query params
function buildUrlWithParams(basePath: string, params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'any') {
            searchParams.set(key, String(value))
        }
    })
    
    const queryString = searchParams.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
}

export {
    Link,
    useRouter,
    useSearchParams,
    buildUrlWithParams
}
