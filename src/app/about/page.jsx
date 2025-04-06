'use client'

import React from 'react'
import useUserStore from '../store/store'

const About = () => {
    const { user } = useUserStore() 

    return (
        <>
            {user ? (
                <p>{user.userName}</p>
            ) : (
                <p>No user data available</p> 
            )}
        </>
    )
}

export default About
