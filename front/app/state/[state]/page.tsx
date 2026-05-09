'use client'

import { useEffect, useState, useRef } from "react"
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
  TOT_EMP_2020: number
  JOBS_1000_2020: number
  A_MEDIAN_2020: number
  TOT_EMP_2024: number
  JOBS_1000_2024: number
  A_MEDIAN_2024: number
  TOT_EMP_change_percent: number
  JOBS_1000_change_percent: number
  A_MEDIAN_change_percent: number
  TOT_EMP_change_abs: number
}

type TooltipState = {
  visible: boolean
  x: number
  y: number
  value: string
  year: string
  color: string
}

type BarChartProps = {
  val2020: number
  val2024: number
  label: string
  formatVal: (v: number) => string
  formatTick: (v: number) => string
}

function MiniBarChart({ val2020, val2024, label, formatVal, formatTick }: BarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, value: "", year: "", color: "" })
  const svgRef = useRef<SVGSVGElement>(null)

  // Chart dimensions and padding built into the component so no need to adjust div
  const W = 140
  const H = 160
  const padL = 38
  const padB = 24
  const padT = 10
  const padR = 10
  const chartH = H - padT - padB
  const chartW = W - padL - padR

  //max value for scaling bars, add 15% headroom
  const max = Math.max(val2020, val2024) * 1.15
  const barW = chartW / 4

  // Bar heights based on values
  const h2020 = (val2020 / max) * chartH
  const h2024 = (val2024 / max) * chartH

  // X positions for the two bars
  const x2020 = padL + chartW * 0.15
  const x2024 = padL + chartW * 0.55

  // Y positions are calculated in the rect elements since they depend on bar height
  const ticks = [0, max * 0.5, max].map(v => ({
    val: v,
    y: padT + chartH - (v / max) * chartH
  }))

  function handleMouseEnter(e: React.MouseEvent, year: string, value: number, color: string) {
    //useRef on SVG so we call call getBoundClinetREct() in it.It tells you where any element on page is . 
    // svgRef.current gives us direcft access to the actual DOM element
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      value: formatVal(value),
      year,
      color
    })
  }

  function handleMouseMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip(prev => ({ ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }))
  }

  function handleMouseLeave() {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  return (
    <div className="flex-1 relative max-w-45 md:max-w-none mx-auto">
      <p className="text-xs text-gray-400 text-center uppercase tracking-wider mb-1">{label}</p>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block "
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines + Y ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke="#e2e0db" strokeWidth={1} />
            <text x={padL - 4} y={t.y + 3} textAnchor="end" fontSize={8} >
              {formatTick(t.val)}
            </text>
          </g>
        ))}

        {/* 2020 bar */}
        <rect
          x={x2020}
          y={padT + chartH - h2020}
          width={barW}
          height={h2020}
          fill="#f97316"
          rx={2}
          className="cursor-pointer"
          onMouseEnter={e => handleMouseEnter(e, "2020", val2020, "#f97316")}
        />

        {/* 2024 bar */}
        <rect
          x={x2024}
          y={padT + chartH - h2024}
          width={barW}
          height={h2024}
          fill="#1d4ed8"
          rx={2}
          className="cursor-pointer"
          onMouseEnter={e => handleMouseEnter(e, "2024", val2024, "#1d4ed8")}
        />

        {/* X axis labels */}
        <text x={x2020 + barW / 2} y={H - 6} textAnchor="middle" fontSize={9}>2020</text>
        <text x={x2024 + barW / 2} y={H - 6} textAnchor="middle" fontSize={9}>2024</text>

        {/* Baseline */}
        <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#e2e0db" strokeWidth={1} />
      </svg>

      {tooltip.visible && (
        <div
          className="absolute bg-white border border-gray-200 rounded-md px-2 py-1 text-xs shadow-md pointer-events-none whitespace-nowrap z-10"
          style={{ left: tooltip.x + 10, top: tooltip.y - 36 }}
        >
          <span style={{ color: tooltip.color }} className="font-bold">{tooltip.year}</span>
          {" · "}
          {tooltip.value}
        </div>
      )}
    </div>
  )
}

function formatChange(val: number) {
  const isPositive = val >= 0
  return (
    <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? "+" : ""}{val}%
    </span>
  )
}

export default function StatePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<StateData[]>([])
  const [rpp, setRpp] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const stateCode = (params.state as string).toUpperCase()
  const stateName = STATE_CODE_TO_NAME[stateCode]

  useEffect(() => {
    if (!stateName) return

    Promise.all([
      fetch("/comparison_2020_2024.json").then(res => res.json()),
      fetch("/tech_state_summary.json").then(res => res.json())
    ]).then(([compJson, summaryJson]) => {
      const stateRows = compJson.filter((row: StateData) => row.AREA_TITLE === stateName)
      setData(stateRows)

      const summaryRow = summaryJson.find((row: { AREA_TITLE: string, RPP_2024: number }) => row.AREA_TITLE === stateName)
      setRpp(summaryRow?.RPP_2024 ?? null)

      setLoading(false)
    }).catch(err => {
      console.error("Error fetching state data:", err)
      setLoading(false)
    })
  }, [stateName])

  if (loading) return <p className="p-8">Loading...</p>
  if (!stateName) return <p className="p-8">Invalid state code: {stateCode}</p>
  if (data.length === 0) return <p className="p-8">No data found for {stateName}</p>

  return (
    <div className="min-h-screen bg-[#f9f7f4] px-12 py-10 text-gray-900 font-serif">

      <button
        onClick={() => router.back()}
        className="mb-6 border bg-gray-300 border-gray-400 text-black text-sm px-4 py-1.5 rounded hover:bg-gray-400 cursor-pointer"
      >
        ← Back
      </button>

      <div className="border-b-2 border-gray-900 pb-3 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          {stateName} <span className="text-gray-400 text-2xl">({stateCode})</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tech Occupation Overview · 2020 vs 2024</p>

        {rpp !== null && (
          <div className="mt-3 inline-flex items-center gap-3 bg-white border border-gray-200 rounded-md px-4 py-2 text-sm shadow-sm">
            <span className="text-gray-500">Cost of Living Index</span>
            <span className="font-bold text-gray-900">{rpp.toFixed(1)}</span>
            <span className={`font-semibold ${rpp < 100 ? "text-green-600" : "text-red-500"}`}>
              {rpp < 100 ? `${(100 - rpp).toFixed(1)}% below avg` : `${(rpp - 100).toFixed(1)}% above avg`}
            </span>
          </div>
        )}
      </div>

      {data.map(occ => {
        const summaryItems = [
          {
            label: "Employment",
            from: occ.TOT_EMP_2020.toLocaleString(),
            to: occ.TOT_EMP_2024.toLocaleString(),
            change: occ.TOT_EMP_change_percent,
          },
          {
            label: "Jobs / 1k",
            from: occ.JOBS_1000_2020.toFixed(3),
            to: occ.JOBS_1000_2024.toFixed(3),
            change: occ.JOBS_1000_change_percent,
          },
          {
            label: "Median Salary",
            from: "$" + occ.A_MEDIAN_2020.toLocaleString(),
            to: "$" + occ.A_MEDIAN_2024.toLocaleString(),
            change: occ.A_MEDIAN_change_percent,
          },
        ]

        return (
          <section
            key={occ.OCC_TITLE_2024}
            className="bg-white border border-gray-200 rounded-lg p-8 mb-10 shadow-sm"
          >
            <h2 className="text-xl font-bold border-b border-gray-200 pb-3 mb-6 tracking-tight">
              {occ.OCC_TITLE_2024}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Left: 3 SVG bar charts */}
              <div className="flex flex-col md:flex-row gap-2">
                <MiniBarChart
                  val2020={occ.TOT_EMP_2020}
                  val2024={occ.TOT_EMP_2024}
                  label="Employment"
                  formatVal={(v) => v.toLocaleString()}
                  formatTick={(v) => v === 0 ? "0" : (v / 1000).toFixed(0) + "k"}
                />
                <MiniBarChart
                  val2020={occ.JOBS_1000_2020}
                  val2024={occ.JOBS_1000_2024}
                  label="Jobs / 1k"
                  formatVal={(v) => v.toFixed(3)}
                  formatTick={(v) => v.toFixed(1)}
                />
                <MiniBarChart
                  val2020={occ.A_MEDIAN_2020}
                  val2024={occ.A_MEDIAN_2024}
                  label="Median Salary"
                  formatVal={(v) => "$" + v.toLocaleString()}
                  formatTick={(v) => v === 0 ? "0" : "$" + (v / 1000).toFixed(0) + "k"}
                />
              </div>

              {/* Right: summary cards */}
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Key Changes</p>
                {summaryItems.map(item => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center px-4 py-2.5 bg-[#f9f7f4] border border-gray-200 rounded-md"
                  >
                    <div>
                      <p className="font-semibold text-large m-0">{item.label}</p>
                      <p className="text-md text-gray-700 m-0">{item.from} → {item.to}</p>
                    </div>
                    <div className="text-base">{formatChange(item.change)}</div>
                  </div>
                ))}
              </div>

            </div>

            <button
              //because occ titles have spaces, encode the url so path doesnt break and decode them in skills page
              onClick={() => router.push(`/skills/${encodeURIComponent(occ.OCC_TITLE_2024)}`)}
              className="mt-5 text-sm text-blue-500 underline italic cursor-pointer bg-transparent border-none p-0"
            >
              Click for skill details →
            </button>
          </section>
        )
      })}
    </div>
  )
}