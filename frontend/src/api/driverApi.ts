import axios from "axios"
import type { DriverResponse, TripHistoryResponse, ProgressSummary } from "../types/driver"

const API = "http://localhost:8000"

export const getDriver = async (
  driverId: string
): Promise<DriverResponse> => {

  const res = await axios.get(`${API}/driver/${driverId}`)
  console.log("API response for getDriver: in backend", res.data)

  return res.data

}

export const getDriverTrips = async (
  driverId: string
): Promise<TripHistoryResponse> => {

  const res = await axios.get(`${API}/driver/${driverId}/trips`)
  console.log("API response for getDriverTrips:", res.data)

  return res.data

}

export const getDriverProgress = async (
  driverId: string
): Promise<ProgressSummary> => {

  const res = await axios.get(`${API}/driver/${driverId}/progress`)
  console.log("API response for getDriverProgress:", res.data)

  return res.data

}