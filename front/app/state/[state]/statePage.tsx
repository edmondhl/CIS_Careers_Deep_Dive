type Props = {
    params: {
        state: string
    }
}

export default function statePage({ params }: Props) {
  return (
    <div className = "p-10">
        <h1 className="text-3xl font-bold mb-4">
            State: {params.state}
        </h1>
    </div>
  )
}
