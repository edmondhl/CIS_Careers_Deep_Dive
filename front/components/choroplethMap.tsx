'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

type MapEntry = { state: string; TOT_EMP: number; A_MEDIAN: number; RPP_2024: number }

type Props = {
  data: MapEntry[]
  salaryFilter?: number | null
  adjusted?: boolean
}

type PreviewState = {
  state: string
  TOT_EMP: number
  A_MEDIAN: number
  RPP_2024: number
} | null

type CardPos = { top: number; left: number }

export default function ChoroplethMap({ data, salaryFilter, adjusted = false }: Props) {
  const router = useRouter()
  const [preview, setPreview] = useState<PreviewState>(null)
  const [cardPos, setCardPos] = useState<CardPos>({ top: 0, left: 0 })
  
  const cardHovered = useRef(false)
  const unhoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(() => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
})
 

  const effectiveSalary = (d: MapEntry) =>
    adjusted ? (d.A_MEDIAN / d.RPP_2024) * 100 : d.A_MEDIAN

  const passing = data.filter(d => !salaryFilter || effectiveSalary(d) >= salaryFilter)
  const failing = data.filter(d => salaryFilter && effectiveSalary(d) < salaryFilter)

  const traces: Plotly.Data[] = [
    {
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: passing.map(d => d.state),
      z: passing.map(d => d.TOT_EMP),
      colorscale: 'Oranges',
      hoverinfo: 'none',
      colorbar: { title: { text: 'Total Employment' } },
      zmin: 0,
      zmax: Math.max(...data.map(d => d.TOT_EMP)),
    },
  ]

  if (failing.length > 0) {
    traces.push({
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: failing.map(d => d.state),
      z: failing.map(() => 0),
      colorscale: [[0, '#d1d5db'], [1, '#d1d5db']],
      hoverinfo: 'none',
      showscale: false,
    } as Plotly.Data)
  }

  function getEntry(location: string) {
    return data.find(d => d.state === location) ?? null
  }

  function handleUnhover() {
    if (isMobile) return
    unhoverTimer.current = setTimeout(() => {
      if (!cardHovered.current) setPreview(null)
    }, 150)
  }

  function handleCardMouseEnter() {
    cardHovered.current = true
    if (unhoverTimer.current) clearTimeout(unhoverTimer.current)
  }

  function handleCardMouseLeave() {
    cardHovered.current = false
    setPreview(null)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Plot
        key={JSON.stringify({ data, salaryFilter, adjusted })}
        data={traces}
        layout={{
          autosize: true,
          geo: { scope: 'usa', projection: { type: 'albers usa' }, bgcolor: 'rgba(0,0,0,0)' },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { t: 50, l: 0, r: 0, b: 0 },
          title: { text: 'Tech Employment by State', font: { color: 'black', size: 24 }, x: 0.5 },
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '75vh' }}
        useResizeHandler

        onHover={(event) => {
          if (isMobile) return
          const points = event.points as (Plotly.PlotDatum & { location?: string })[]
          const location = points?.[0]?.location
          if (!location) return
          if (unhoverTimer.current) clearTimeout(unhoverTimer.current)

          const e = event.event as MouseEvent
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const cardWidth = 288
            const offset = 16
            const cursorX = e.clientX - rect.left
            const cursorY = e.clientY - rect.top
            const flipped = cursorX + offset + cardWidth > rect.width

            setCardPos({
              top: cursorY - 80,
              left: flipped ? cursorX - cardWidth - offset : cursorX + offset,
            })
          }

          setPreview(getEntry(location))
        }}

        onUnhover={() => handleUnhover()}

        onClick={(event) => {
          const points = event.points as (Plotly.PlotDatum & { location?: string })[]
          const location = points?.[0]?.location
          if (!location) return

          if (isMobile) {
            if (preview?.state === location) {
              router.push(`/state/${location}`)
            } else {
              setPreview(getEntry(location))
            }
          } else {
            router.push(`/state/${location}`)
          }
        }}
      />

      {preview && (
        <>
          {isMobile && (
            <div
              className="absolute inset-0 z-10"
              onClick={() => setPreview(null)}
            />
          )}

          <div
            className="z-20 bg-white border border-gray-200 rounded-xl shadow-lg px-6 py-4 w-72"
            style={isMobile
              ? { position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }
              : { position: 'absolute', top: cardPos.top, left: cardPos.left }
            }
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900 text-lg">{preview.state}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  {isMobile ? 'Tap state again to explore' : 'Click to explore'}
                </p>
              </div>
              {isMobile && (
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Employment</span>
                <span className="font-semibold">~{preview.TOT_EMP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Median Salary</span>
                <span className="font-semibold">${preview.A_MEDIAN.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adjusted Salary</span>
                <span className="font-semibold">
                  ${Math.round((preview.A_MEDIAN / preview.RPP_2024) * 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost of Living Index</span>
                <span className={`font-semibold ${preview.RPP_2024 < 100 ? 'text-green-600' : 'text-red-500'}`}>
                  {preview.RPP_2024.toFixed(1)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/state/${preview.state}`)}
              className="mt-4 w-full bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Explore {preview.state} →
            </button>
          </div>
        </>
      )}
    </div>
  )
}