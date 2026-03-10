import React from "react"
import { DollarSign, TrendingUp } from "lucide-react"
import StatCard from "./StatCard"

interface EarningAndVelocityProps {
  current: number
  goal: number | null
  computed_velocity?: number
  target_velocity?: number
  shift_end_time?: string
  hours_worked?: number
  target_hours?: number
}

const EarningAndVelocity: React.FC<EarningAndVelocityProps> = ({
  current,
  goal,
  computed_velocity = 0,
  target_velocity = 0,
  hours_worked = 0,
  target_hours = 0
}) => {

  // velocity difference
  // const velocityDiff =
  //   target_velocity > 0
  //     ? (((computed_velocity - target_velocity) / target_velocity) * 100).toFixed(1)
  //     : "0"

  //const isDiffPositive = parseFloat(velocityDiff) > 0

  // const velocityDiffText = isDiffPositive
  //   ? `+${velocityDiff}% vs Target`
  //   : `${velocityDiff}% vs Target`

  // remaining hours
  const remaining_hours = Math.max(
    (target_hours ?? 0) - (hours_worked ?? 0),
    0
  )

  const remainingText =
    remaining_hours > 0
      ? `${remaining_hours.toFixed(1)}hrs left`
      : "Shift over"

  return (
    <div className="flex gap-4 w-full lg:w-auto">

      <StatCard
        icon={<DollarSign size={20} />}
        label="Total Today"
        value={`₹${current?.toFixed(2) ?? "0.00"}`}
        sub={
          goal
            ? `Goal: ₹${goal.toFixed(2)} in ${target_hours}hrs`
            : "No goal set"
        }
        color="text-emerald-600"
      />

      <StatCard
        icon={<TrendingUp size={20} />}
        label="Current Velocity"
        value={`₹${computed_velocity?.toFixed(2) ?? "0.00"}/hr`}
        sub={
          target_velocity > 0
            ? `Target: ₹${target_velocity.toFixed(2)}/hr • ${remainingText}`
            : "No target set"
        }
        color="text-blue-600"
      />

    </div>
  )
}

export default EarningAndVelocity