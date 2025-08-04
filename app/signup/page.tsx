import React, { Suspense } from 'react'
import SignUpClient from './SignUpClient'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpClient />
    </Suspense>
  )
}

export default page