import React from 'react'
import { useNavigate as useRouter } from 'react-router-dom'
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
export {
    Link,
    useRouter
}
