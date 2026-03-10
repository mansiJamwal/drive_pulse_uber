import React from "react"
import type { VelocityRecord } from "../types/velocity"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

interface Props {
  data: VelocityRecord[]
}

const VelocityChart: React.FC<Props> = ({ data }) => {

  return (

    <div className="w-full h-130">

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#0f1724"
          />

          <XAxis
            dataKey="elapsed_hours"
            stroke="#6b7280"
          />

          <YAxis stroke="#6b7280" />

          <Tooltip
            wrapperStyle={{
              background: "#071026",
              border: "1px solid #142232",
              borderRadius: 8
            }}
          />

          <Line
            type="monotone"
            dataKey="computed_velocity"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="computed_target_velocity"
            stroke="#f97316"
            strokeWidth={3}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )

}

export default VelocityChart