import ChoroplethMap from "@/components/choroplethMap"

export default function Home() {
  const mockData = [
    { state: "NY", value: 20000 },
    { state: "CA", value: 50000 },
    { state: "TX", value: 30000 },
  ]

  return (
    <main>
      <ChoroplethMap data={mockData} />
    </main>
  )
}