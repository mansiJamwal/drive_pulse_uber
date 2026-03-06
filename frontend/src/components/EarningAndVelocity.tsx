import React from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";

const EarningAndVelocity: React.FC = ({
  current,
  goal = null,
  computed_velocity = 0,
  target_velocity = 0,
  shift_end_time = null,
  hours_worked = 0,
  target_hours = 0,
}) => {
  console.log("EarningAndVelocity rendered");
  console.log("Props - current:", current);
  console.log("goal (target_earnings):", goal);
  console.log("computed_velocity:", computed_velocity);
  console.log("target_velocity:", target_velocity);
  console.log("hours_worked:", hours_worked);
  console.log("target_hours:", target_hours);
  console.log("remaining_hours calc:", target_hours - hours_worked);

  // Calculate velocity difference percentage
  const velocityDiff =
    target_velocity > 0
      ? (
          ((computed_velocity - target_velocity) / target_velocity) *
          100
        ).toFixed(1)
      : 0;

  const isDiffPositive = parseFloat(velocityDiff) > 0;
  const velocityDiffText = isDiffPositive
    ? `+${velocityDiff}% vs Target`
    : `${velocityDiff}% vs Target`;

  // Calculate remaining hours
  const remaining_hours = Math.max(
    (target_hours ?? 0) - (hours_worked ?? 0),
    0,
  );
  const remainingText =
    remaining_hours > 0
      ? `${remaining_hours.toFixed(1)}hrs left`
      : "Shift over";

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
  );
};

export default EarningAndVelocity;
