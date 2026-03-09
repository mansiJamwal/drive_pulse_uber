import React, { useEffect, useState } from "react"
import { fetchVelocity } from "../api/velocityApi"
import type { VelocityRecord } from "../types/velocity"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

const VelocityDashboard: React.FC = () => {

  const [data, setData] = useState<VelocityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    const loadData = async () => {

      try {

        const result = await fetchVelocity()

        setData(result)

      } catch (err) {

        console.error("Failed to fetch velocity data", err)
        setError("Failed to load velocity data")

      } finally {

        setLoading(false)

      }

    }

    loadData()

  }, [])

  if (loading) {
    return <div>Loading velocity data...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  // Clean data for chart (replace null with 0)
  const cleanedData = data.map((d) => ({
    ...d,
    computed_velocity: d.computed_velocity ?? 0
  }))

  return (

    <div style={{ padding: "20px" }}>

      <h1>Driver Earnings Velocity</h1>

      <table border={1} cellPadding={8}>

        <thead>
          <tr>
            <th>Driver</th>
            <th>Earnings</th>
            <th>Hours</th>
            <th>Velocity</th>
            <th>Predicted Final</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {data.map((row, index) => (

            <tr key={index}>

              <td>{row.driver_id}</td>

              <td>{row.cumulative_earnings}</td>

              <td>{row.elapsed_hours}</td>

              <td>{row.computed_velocity?.toFixed(2) ?? "N/A"}</td>

              <td>{row.predicted_final?.toFixed(2) ?? "N/A"}</td>

              <td>{row.forecast}</td>

            </tr>

          ))}

        </tbody>

      </table>

      <h2>Earnings Velocity Trend</h2>

      <LineChart width={800} height={300} data={cleanedData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="elapsed_hours" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="computed_velocity"
          stroke="#8884d8"
          connectNulls
        />

      </LineChart>

    </div>
  )
}

export default VelocityDashboard
