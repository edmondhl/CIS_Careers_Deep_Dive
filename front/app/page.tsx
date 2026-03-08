import ChoroplethMap from "@/components/choroplethMap"
import path from "path"
import { promises as fs } from "fs"

type StateEntry = {
  AREA_TITLE: string
  TOT_EMP: number
  A_MEDIAN: number
  state_abbrev: string
}

export default async function Home() {
  const filepath = path.join(process.cwd(), "public", "tech_state_summary.json")
  const file = await fs.readFile(filepath, "utf-8")
  const json : StateEntry[] = JSON.parse(file)

  const mapData = json
    .filter(row => row.state_abbrev) 
    .map(row => ({
      state: row.state_abbrev,
      TOT_EMP: row.TOT_EMP,
      A_MEDIAN: row.A_MEDIAN,
    }))

  return (
    <main>
      <ChoroplethMap data={mapData} />
    </main>
  )
}