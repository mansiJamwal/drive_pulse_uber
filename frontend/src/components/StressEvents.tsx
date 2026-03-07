import { useEffect, useState } from "react"
import { getStressByDriver } from "../api/stressApi"

type StressFlag = {
  flag_id: string
  trip_id: string
  timestamp: string
  severity: string
  flag_type: string
  context: string
  explanation: string
}

type Props = {
  driverId: string
}

const StressEvents = ({ driverId }: Props) => {
  const [flags, setFlags] = useState<StressFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await getStressByDriver(driverId)
        setFlags(data)
      } catch (error) {
        console.error("Failed to load stress flags", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlags()
  }, [driverId])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded p-8">
        <div className="flex justify-center items-center">
          <div className="text-gray-500">Loading stress events...</div>
        </div>
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="bg-white shadow rounded p-8">
        <div className="text-center text-gray-500">
          No stress events detected
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Driver Pulse Events
        </h2>
        <span className="text-sm text-gray-500">
          {flags.length} event{flags.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.flag_id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header with Trip ID and Severity */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  Trip:
                </span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {flag.trip_id}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                {flag.severity}
              </span>
            </div>

            {/* Type and Context - Side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  Type:
                </span>
                <span className="text-sm text-gray-900">
                  {flag.flag_type}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  Context:
                </span>
                <span className="text-sm text-gray-900">
                  {flag.context}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500 block mb-1">
                Explanation:
              </span>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {flag.explanation.replace(/\(.*?score=.*?\)/gi, "")}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex justify-end">
              <time className="text-xs text-gray-400">
                {new Date(flag.timestamp).toLocaleString()}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StressEvents