import React from "react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

interface Props {
  data: any[]
}

const VelocityChart: React.FC<Props> = ({ data }) => {

  return (

    <div>

      <h3>Earnings Velocity Trend</h3>

      <LineChart width={700} height={300} data={data}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="elapsed_hours" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="computed_velocity"
          stroke="#8884d8"
        />

        <Line
          type="monotone"
          dataKey="computed_target_velocity"
          stroke="#ff7300"
        />

      </LineChart>

    </div>

  )

}

export default VelocityChart