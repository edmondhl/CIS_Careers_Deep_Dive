'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

type SkillData = {
  Title: string
  Example: string
  "Commodity Title": string
  "Hot Technology": string
  "In Demand": string
  TECH_CATEGORY: string
}

export default function SkillPage() {
  const params = useParams()
  const router = useRouter()
  const occupation = decodeURIComponent(params.occupation as string)

  const [data, setData] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/tech_skills_master.json")
      .then(res => res.json())
      .then((json: SkillData[]) => {
        const filtered = json.filter(row => row.Title === occupation)
        setData(filtered)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching skills:", err)
        setLoading(false)
      })
  }, [occupation])

  if (loading) return <p className="p-8">Loading...</p>
  if (data.length === 0) return <p className="p-8">No skills found for {occupation}</p>

  // unique commodity titles per category (deduping)
  const uniqueCommodities = data.filter((d, i, self) =>
    i === self.findIndex(t => t["Commodity Title"] === d["Commodity Title"] && t.TECH_CATEGORY === d.TECH_CATEGORY
    )
  )

  return (
    <div className="min-h-screen bg-[#f9f7f4] px-12 py-10 text-gray-900 font-serif">

      <button
        onClick={() => router.back()}
        className="mb-6 border bg-gray-300 border-gray-400 text-black text-sm px-4 py-1.5 rounded hover:bg-gray-400 cursor-pointer"
      >
        ← Back
      </button>

      <div className="border-b-2 border-gray-900 pb-3 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">{occupation}</h1>
        <p className="text-gray-500 text-sm mt-1">Technology Skills Overview</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-bold border-b border-gray-200 pb-3 mb-6 tracking-tight">
          Skills Breakdown
        </h2>

        <Plot
          data={[
            {
              type: "treemap",
              ids: [
                occupation,
                "Hot & In Demand", "Hot Only", "In Demand Only",
                ...uniqueCommodities.map(d => d["Commodity Title"] + "_" + d.TECH_CATEGORY),
                // add commodity title to example ID to guarantee uniqueness
                ...data.map(d => d.Example + "_" + d["Commodity Title"] + "_" + d.TECH_CATEGORY)
              ],
              labels: [
                occupation,
                "Hot & In Demand", "Hot Only", "In Demand Only",
                ...uniqueCommodities.map(d => d["Commodity Title"]),
                ...data.map(d => d.Example)
              ],
              parents: [
                "",
                occupation, occupation, occupation,    // occupation is parent of categories # repeated is = to # of categories
                ...uniqueCommodities.map(d => d.TECH_CATEGORY),
                ...data.map(d => d["Commodity Title"] + "_" + d.TECH_CATEGORY)
              ],
              values: [
                0,        // root
                0, 0, 0,  // categories
                ...uniqueCommodities.map(() => 0),  // 0 makes it auto adjust due to branchvalues: "remainder"
                ...data.map(() => 1)                // 1 represents the size of each example tile.
              ],
              branchvalues: "remainder",
              hovertemplate: "<b>%{label}</b><br>%{parent}<extra></extra>",
              textfont: { family: "Inter, sans-serif", size: 20, color: "#000000" },
              textposition: "middle center",
              tiling: { packing: "squarify", pad: 0 },
              pathbar: { visible: true, thickness: 24 },
              marker: {
                colors: [
                  "#e2e0db",           // root
                  "#6588EB", "#f97316", "#6b7280",  // categories : hot & in demand, hot only, in demand only
                  // commodity tiles match category color
                  ...uniqueCommodities.map(d => {
                    if (d.TECH_CATEGORY === "Hot & In Demand") return "#7796ED"
                    if (d.TECH_CATEGORY === "Hot Only") return "#f97316"
                    return "#6b7280"
                  }),
                  // example tiles slightly lighter
                  ...data.map(d => {
                    if (d.TECH_CATEGORY === "Hot & In Demand") return "#7796ED"
                    if (d.TECH_CATEGORY === "Hot Only") return "#fb923c"
                    return "#9ca3af"
                  })
                ],
                line: { width: 2, color: "#f9f7f4" },
              },
            } as any
          ]}
          layout={{
            height: 580,
            paper_bgcolor: "#f9f7f4",
            plot_bgcolor: "#f9f7f4",
            margin: { t: 0, l: 0, r: 0, b: 0 },
            font: { family: "Inter, sans-serif", color: "#000000" },
            hoverlabel: {
              bgcolor: "#ffffff",
              bordercolor: "#e2e0db",
              font: { family: "Inter, sans-serif", size: 12, color: "#1a1a1a" }
            }
          } as any}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%" }}
          useResizeHandler
        />

        <div className="flex gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#1d4ed8]" />
            <span>Hot & In Demand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#f97316]" />
            <span>Hot Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#6b7280]" />
            <span>In Demand Only</span>
          </div>
        </div>
      </div>

    </div>
  )
}