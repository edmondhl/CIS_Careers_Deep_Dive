'use client'

import { useState } from 'react'
import ChoroplethMap from './choroplethMap'

type MapEntry = { state: string; TOT_EMP: number; A_MEDIAN: number; RPP_2024: number }

const THRESHOLDS = [
  { label: 'All salaries', value: null },
  { label: '$80k+', value: 80000 },
  { label: '$100k+', value: 100000 },
  { label: '$120k+', value: 120000 },
]

export default function SalaryFilterBar({ data }: { data: MapEntry[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [adjusted, setAdjusted] = useState(false)

  // Adjusted salary = (A_MEDIAN / RPP_2024) * 100
  const effectiveSalary = (d: MapEntry) =>
    adjusted ? (d.A_MEDIAN / d.RPP_2024) * 100 : d.A_MEDIAN

  const passingCount = active
    ? data.filter(d => effectiveSalary(d) >= active).length
    : data.length

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 flex-wrap">

        {/* Salary mode toggle */}
        <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
          <button
            onClick={() => setAdjusted(false)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              !adjusted
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            Nominal
          </button>
          <button
            onClick={() => setAdjusted(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              adjusted
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            Buying Power Adjusted
          </button>
        </div>

        {/* Threshold filter */}
        <span className="text-sm text-gray-500 uppercase tracking-widest mr-2 font-medium">
          {adjusted ? 'Adjusted Salary Filter' : 'Median Salary Filter'}
        </span>
        {THRESHOLDS.map(sal => (
          <button
            key={sal.label}
            onClick={() => setActive(sal.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              active === sal.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            {sal.label}
          </button>
        ))}

        {active && (
          <span className="ml-auto text-sm text-gray-500">
            {passingCount} state{passingCount !== 1 ? 's' : ''} meet this threshold
          </span>
        )}
      </div>

      {adjusted && (
        <p className="text-xs text-gray-400 px-6 -mt-2">
          Adjusted salary = (median salary ÷ cost of living index) × 100 · Source: BEA Regional Price Parities 2024
        </p>
      )}

      {/* Map */}
      <ChoroplethMap data={data} salaryFilter={active} adjusted={adjusted} />
    </div>
  )
}