import React from "react"
import { CheckCircle2 } from "lucide-react"
import StatCard from "./StatCard"

interface ForecastProps {
  forecast?: "ahead" | "on_track" | "at_risk" | "no_data"
  predicted_final?: number | null
}

const ForecastCard: React.FC<ForecastProps> = ({
  forecast,
  predicted_final
}) => {

  const forecastLabel =
    forecast === "ahead"
      ? "Ahead"
      : forecast === "on_track"
      ? "On Track"
      : forecast === "at_risk"
      ? "At Risk"
      : "No Data"

  // Use a single, different colour (green) for the forecast tick icon to match design
  const forecastColor = "text-emerald-600"

  // Always use the check/tick icon for the forecast card to match the previous design
  const forecastIcon = <CheckCircle2 size={20} />

  return (
    <StatCard
      icon={forecastIcon}
      label="Forecast"
      value={forecastLabel}
      sub={
        predicted_final
          ? `Predicted ₹${predicted_final.toFixed(0)}`
          : "No prediction"
      }
      color={forecastColor}
    />
  )
}

export default ForecastCard