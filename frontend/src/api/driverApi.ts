import axios from "axios"
import type {
  DriverResponse,
  TripHistoryResponse,
  ProgressSummary
} from "../types/driver"

const API = "http://localhost:8000"

export const getDriver = async (driverId: string): Promise<DriverResponse> => {
  const res = await axios.get(`${API}/driver/${driverId}`)
  return res.data
}

export const getDriverTrips = async (driverId: string): Promise<TripHistoryResponse> => {
  const res = await axios.get(`${API}/driver/${driverId}/trips`)
  return res.data
}

export const getDriverProgress = async (driverId: string): Promise<ProgressSummary> => {
  const res = await axios.get(`${API}/driver/${driverId}/progress`)
  return res.data
}