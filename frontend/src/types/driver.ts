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
  hours_worked: number
  computed_velocity: number
  original_velocity: number
  target_velocity: number
  predicted_final: number
  forecast: "ahead" | "on_track" | "at_risk"

}

export interface DriverResponse {

  driver_profile: DriverProfile
  current_status: DriverStatus
  timeline: any[]

}