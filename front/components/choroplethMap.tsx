'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

//dynamic import because plotly is a big library and we should only load when we need it. keeps inital page load fast.
//ssr is server side rendering. plotly doesnt work with ssr so we disable it for this component. 
// it will only render on the client side. if we didnt do this, 
// we would get errors when trying to render the page on the server because plotly 
// relies on browser APIs that arent available on the server.

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

type MapEntry = { state: string; TOT_EMP: number; A_MEDIAN: number; RPP_2024: number }

type Props = {
  data: MapEntry[]
  salaryFilter?: number | null
  adjusted?: boolean
}

export default function ChoroplethMap({ data, salaryFilter, adjusted = false }: Props) {
  const router = useRouter()

  const effectiveSalary = (d: MapEntry) =>
    adjusted ? (d.A_MEDIAN / d.RPP_2024) * 100 : d.A_MEDIAN

  const passing = data.filter(d => !salaryFilter || effectiveSalary(d) >= salaryFilter)
  const failing = data.filter(d => salaryFilter && effectiveSalary(d) < salaryFilter)

  const hoverText = (arr: MapEntry[]) =>
    arr.map(d => {
      const adj = Math.round((d.A_MEDIAN / d.RPP_2024) * 100)
      return [
        `<b>${d.state}</b>`,
        `Total Employment: ~${d.TOT_EMP.toLocaleString()}`,
        `Median Salary: $${d.A_MEDIAN.toLocaleString()}`,
        `Adjusted Salary: $${adj.toLocaleString()}`,
        `Cost of Living Index: ${d.RPP_2024.toFixed(1)}`,
      ].join('<br>')
    })

  const traces: Plotly.Data[] = [
    {
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: passing.map(d => d.state),
      z: passing.map(d => d.TOT_EMP),
      colorscale: 'Oranges',
      hoverinfo: 'text',
      text: hoverText(passing),
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
      hoverinfo: 'text',
      text: hoverText(failing),
      showscale: false,
    } as Plotly.Data)
  }

  return (
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