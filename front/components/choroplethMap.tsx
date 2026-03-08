'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

type Props = {
  data: { state: string; TOT_EMP: number; A_MEDIAN: number }[]
}

export default function ChoroplethMap({ data }: Props) {
  const router = useRouter()

  const hoverText = data.map(d =>
    `<b>${d.state}</b><br>Total Employment: ${d.TOT_EMP.toLocaleString()}<br>Median Salary: $${d.A_MEDIAN.toLocaleString()}`
  )

  return (
    <Plot
      key={JSON.stringify(data)}
      data={[
        {
          type: "choropleth",
          locationmode: "USA-states",
          locations: data.map(d => d.state),
          z: data.map(d => d.TOT_EMP), 
          colorscale: "Oranges",
          hoverinfo: "text",      
          text: hoverText,
          colorbar: {
            title: { text: "Total Employment" },
          }
        },
      ]}
      layout={{
        autosize: true,
        geo: { scope: "usa", projection: { type: "albers usa" }, bgcolor: "rgba(0,0,0,0)" },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { t: 50, l: 0, r: 0, b: 0 },
        title: { text: "Tech Employment by State", font: { color: "black", size: 24 }, x: 0.5 },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "80vh" }}
      useResizeHandler
      onClick={(event) => {
        const points = event.points as (Plotly.PlotDatum & { location?: string })[]
        if (!points || points.length === 0) return
        const location = points[0].location
        if (!location) return
        router.push(`/state/${location}`)
      }}
    />
  )
}