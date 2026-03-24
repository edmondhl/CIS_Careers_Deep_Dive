import ChoroplethMap from "@/components/choroplethMap"
import path from "path"
import { promises as fs } from "fs"

type StateEntry = {
  AREA_TITLE: string
  TOT_EMP: number
  JOBS_1000: number
  A_MEDIAN: number
  state_abbrev: string
}

export default async function Home() {
  const filepath = path.join(process.cwd(), "public", "tech_state_summary.json")
  const file = await fs.readFile(filepath, "utf-8")
  const json: StateEntry[] = JSON.parse(file)

  const usStates = json.filter(row => row.state_abbrev)

  const mapData = usStates.map(row => ({
    state: row.state_abbrev,
    TOT_EMP: row.TOT_EMP,
    A_MEDIAN: row.A_MEDIAN,
  }))

  // national rankings computed server side from same json 
  // (b-a is descending order, if neg then a comes first then b, if pos then b comes first then a, if 0 then they are equal)
  const top5Emp = [...usStates].sort((a, b) => b.TOT_EMP - a.TOT_EMP).slice(0, 5)
  const top5Salary = [...usStates].sort((a, b) => b.A_MEDIAN - a.A_MEDIAN).slice(0, 5)
  const top5Jobs1k = [...usStates].sort((a, b) => b.JOBS_1000 - a.JOBS_1000).slice(0, 5)

  return (
    <main className="bg-[#f9f7f4] min-h-screen">
      <ChoroplethMap data={mapData} />

      <div className="max-w-5xl mx-auto px-6 py-16 font-serif">

        <div className="border-l-4 border-gray-900 pl-6 mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            What is CIS Careers Deep Dive?
          </h2>
          <p className="text-gray-700 text-md uppercase tracking-widest">
            A data-informed career resource for CIS undergraduates
          </p>
        </div>

        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          With ongoing uncertainty around hiring trends and skill expectations, computer science
          students often lack a centralized resource that connects career outlook data with
          practical preparation guidance. This project bridges that gap.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed mb-10">
          Using government-provided workforce data from the Bureau of Labor Statistics and O*NET,
          this tool aggregates and visualizes employment trends, salary growth, and role-specific
          technology requirements across all 50 states — giving students a clearer, data-informed
          view of the current technology job landscape.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Coverage</p>
            <p className="text-2xl font-bold text-gray-900">50 States</p>
            <p className="text-sm text-gray-500 mt-1">+ District of Columbia</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Data Range</p>
            <p className="text-2xl font-bold text-gray-900">2021 — 2024</p>
            <p className="text-sm text-gray-500 mt-1">OEWS annual survey data</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Sources</p>
            <p className="text-2xl font-bold text-gray-900">BLS & O*NET</p>
            <p className="text-sm text-gray-500 mt-1">U.S. government datasets</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-16">
          <p className="text-md text-gray-600 uppercase tracking-widest mb-3">How to use</p>
          <ol className="space-y-2 text-gray-700 text-md">
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 w-5">1.</span>
              <span>Click any state on the map above to explore occupation-level employment and salary data.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 w-5">2.</span>
              <span>Compare 2021 vs 2024 trends across total employment, jobs per 1,000, and median salary.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 w-5">3.</span>
              <span>Drill into each occupation&apos;s in-demand and hot technology skills to guide your preparation.</span>
            </li>
          </ol>
        </div>

        {/* National highlights */}

        <div className="border-l-4 border-gray-900 pl-6 mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            National Highlights
          </h2>
          <p className="text-gray-700 text-md uppercase tracking-widest">
            Top states across key tech employment metrics · 2024
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Top by total employment */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-md text-gray-600 uppercase tracking-widest mb-4">
              Most Tech Jobs
            </p>
            <ol className="space-y-3">
              {top5Emp.map((row, i) => (
                <li key={row.state_abbrev} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-gray-900 `}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{row.AREA_TITLE}</span>
                  </div>
                  <span className="text-sm text-gray-600">{row.TOT_EMP.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Top by median salary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-md text-gray-600 uppercase tracking-widest mb-4">
              Highest Median Salary
            </p>
            <ol className="space-y-3">
              {top5Salary.map((row, i) => (
                <li key={row.state_abbrev} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-gray-900 `}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{row.AREA_TITLE}</span>
                  </div>
                  <span className="text-sm text-gray-600">${row.A_MEDIAN.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Top by jobs per 1000 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-md text-gray-600 uppercase tracking-widest mb-4">
              Most Concentrated
            </p>
            <ol className="space-y-3">
              {top5Jobs1k.map((row, i) => (
                <li key={row.state_abbrev} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-gray-900 `}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{row.AREA_TITLE}</span>
                  </div>
                  <span className="text-sm text-gray-600">{row.JOBS_1000.toFixed(2)} / 1k</span>
                </li>
              ))}
            </ol>
          </div>

        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Data reflects aggregated SOC 15-XXXX tech occupations · Source: BLS OEWS 2024
        </p>

      </div>
    </main>
  )
}