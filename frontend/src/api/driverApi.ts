import axios from "axios"
import type { DriverResponse } from "../types/driver"

const API = "http://localhost:8000"

export const getDriver = async (
  driverId: string
): Promise<DriverResponse> => {

  const res = await axios.get(`${API}/driver/${driverId}`)

  return res.data

}