import React, { Suspense } from 'react'
import VerifyClient from './VerifyClient'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyClient />
    </Suspense>
  )
}

export default page