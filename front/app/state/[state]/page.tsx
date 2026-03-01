'use client'

import { useParams, useRouter } from 'next/navigation'

export default function StatePage() {
  const params = useParams()
  const state = params?.state ?? "Unknown"
  const router = useRouter()

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-900 dark:border-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">State: {state}</h1>
      <p className="text-black">
        This is where detailed employment data will go.
      </p>
    </div>
  )
}