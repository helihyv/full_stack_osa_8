import React from 'react'
import { useApolloClient } from 'react-apollo-hooks';

const Logout = (props) => {

    const client = useApolloClient()

    const logoutFunction = () => {
        props.setToken(null)
        localStorage.clear()
        client.resetStore()
    }

    if (!props.show) {
        return null
    }

    return (
        <div>
            <button
                onClick={logoutFunction}
            >logout</button>
        </div>
    )
}

export default Logout