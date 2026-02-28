'use client'

import Plot from 'react-plotly.js'
import { PlotMouseEvent } from 'plotly.js'
import {useRouter} from 'next/navigation'
/*
'use client'

import dynamic from 'next/dynamic'
import { PlotMouseEvent } from 'plotly.js'
import { useRouter } from 'next/navigation'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
})
*/
type Props = {
  data: { state: string; value: number }[]
}

export default function ChoroplethMap({ data }: Props) {
    const router = useRouter()
    return (
    <Plot
      data={[
        {
          type: "choropleth",
          locationmode: "USA-states",
          locations: data.map(d => d.state),
          z: data.map(d => d.value),
          colorscale: "Oranges",
        }
      ]}
      layout={{
        geo: { scope: "usa" },
        title: {
            text: "Employment by State"
        }
      }}
      onClick={(event: PlotMouseEvent) => {
        const point = event.points[0] as unknown as { location: string }
        router.push(`/state/${point.location}`)
      }}
      style={{ width: "100%", height: "600px" }}
    />
  )
}