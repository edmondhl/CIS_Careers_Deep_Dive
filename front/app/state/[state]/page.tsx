'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

const STATE_CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia"
}

type StateData = {
  AREA_TITLE: string
  OCC_TITLE_2024: string
  TOT_EMP_2021: number
  JOBS_1000_2021: number
  A_MEDIAN_2021: number
  TOT_EMP_2024: number
  JOBS_1000_2024: number
  A_MEDIAN_2024: number
  TOT_EMP_change_percent: number
  JOBS_1000_change_percent: number
  A_MEDIAN_change_percent: number
  TOT_EMP_change_abs: number
}

export default function StatePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<StateData[]>([])
  const [loading, setLoading] = useState(true)

  const stateCode = (params.state as string).toUpperCase()
  const stateName = STATE_CODE_TO_NAME[stateCode]

  useEffect(() => {
    if (!stateName) return

    fetch("/comparison_2021_2024.json")
      .then(res => res.json())
      .then((json: StateData[]) => {
        const stateRows = json.filter(row => row.AREA_TITLE === stateName)
        setData(stateRows)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching state data:", err)
        setLoading(false)
      })
  }, [stateName])

  if (loading) return <p className="p-8">Loading...</p>
  if (!stateName) return <p className="p-8">Invalid state code: {stateCode}</p>
  if (data.length === 0) return <p className="p-8">No data found for {stateName}</p>

  return (
    <div className="p-8 space-y-8">
      <button
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => router.back()}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">{stateName} ({stateCode})</h1>

      {data.map(occ => (
        <section key={occ.OCC_TITLE_2024} className="space-y-3 mt-10">
          <h2 className="text-2xl font-semibold border-b pb-2">{occ.OCC_TITLE_2024}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border rounded shadow">
              <h3 className="font-semibold mb-3">Employment</h3>
              <p>2021: {occ.TOT_EMP_2021.toLocaleString()}</p>
              <p>2024: {occ.TOT_EMP_2024.toLocaleString()}</p>
              <p>Change: {occ.TOT_EMP_change_percent}%</p>
            </div>

            <div className="p-5 border rounded shadow">
              <h3 className="font-semibold mb-3">Jobs per 1,000</h3>
              <p>2021: {occ.JOBS_1000_2021}</p>
              <p>2024: {occ.JOBS_1000_2024}</p>
              <p>Change: {occ.JOBS_1000_change_percent}%</p>
            </div>

            <div className="p-5 border rounded shadow">
              <h3 className="font-semibold mb-3">Median Salary</h3>
              <p>2021: ${occ.A_MEDIAN_2021.toLocaleString()}</p>
              <p>2024: ${occ.A_MEDIAN_2024.toLocaleString()}</p>
              <p>Change: {occ.A_MEDIAN_change_percent}%</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}