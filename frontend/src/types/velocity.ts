export interface VelocityRecord {
  driver_id: string
  timestamp: string
  cumulative_earnings: number | null
  elapsed_hours: number | null
  computed_velocity: number | null
  computed_target_velocity: number | null
  remaining_hours: number | null
  predicted_final: number | null
  forecast: "ahead" | "on_track" | "at_risk"
}