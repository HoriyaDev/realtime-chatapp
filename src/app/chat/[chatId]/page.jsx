'use client'

import React, { useEffect } from 'react'
import { useUserIdStore } from '@/app/store/store'

const Page = () => {
  const selectedUser = useUserIdStore(state => state.selectedUser)
  const name = selectedUser?.name

  // Run the effect whenever selectedUser changes
  useEffect(() => {
    
      console.log("Selected User:");
    
  }, []);  // Add selectedUser as dependency to re-run effect on change

  return (
    <div>{name ? name : 'No user selected'}</div>
  )
}

export default Page
