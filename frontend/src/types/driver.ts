export interface DriverProfile {
  driver_id: string
  name: string
  rating?: number
  experience_years?: number
}

export interface Goal {
  shift_start_time: string
  shift_end_time: string
  target_earnings: number
  target_hours: number
}

export interface CurrentStatus {
  current_earnings: number
  hours_worked: number
  computed_velocity: number
  target_velocity: number
  predicted_final: number | null
  forecast: "ahead" | "on_track" | "at_risk" | "no_data"
}

export interface DriverResponse {
  driver_profile: DriverProfile
  goal: Goal | null
  current_status: CurrentStatus
  timeline: any[]
}

export interface Trip {
  trip_id: string
  start_time: string
  end_time: string
  duration: number
  distance: number
  fare: number
  status: string
  pickup_location: string
  dropoff_location: string
  surge_multiplier?: number
  stress_score?: number
  trip_quality_rating?: string
}

export interface TripHistoryResponse {
  trips: Trip[]
}

export interface ProgressSummary {
  progress_percent: number
  current: number
  goal: number
}