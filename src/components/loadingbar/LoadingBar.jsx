import React from 'react'

function LoadingBar() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-pulse text-lg text-gray-600">Uploading...</div>
    </div>
  )
}

export default LoadingBar