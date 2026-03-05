export interface DriverProfile {
  driver_id: string
  name: string
  city: string
  shift_preference: string
  avg_hours_per_day: number
  avg_earnings_per_hour: number
  experience_months: number
  rating: number
}

export interface DriverStatus {
  current_earnings: number
  hours_worked?: number
  elapsed_hours?: number
  computed_velocity: number
  computed_target_velocity: number
  remaining_hours?: number
  predicted_final: number | null
  forecast: "ahead" | "on_track" | "at_risk" | "no_data"
}

export interface VelocityRecord {
  driver_id: string
  timestamp: string
  cumulative_earnings: number
  elapsed_hours: number
  computed_velocity: number
  computed_target_velocity: number
  remaining_hours: number
  predicted_final: number | null
  forecast: "ahead" | "on_track" | "at_risk" | "no_data"
}

export interface DriverResponse {
  driver_profile: DriverProfile | null
  goal?: { [key: string]: any } | null
  current_status: DriverStatus | null
  timeline: VelocityRecord[]
}