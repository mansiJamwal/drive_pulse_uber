import axios from "axios"
import type { VelocityRecord } from "../types/velocity"

const API_URL = "https://drive-pulse-uber.onrender.com"
//const API_URL = "http://localhost:8000"
export const fetchVelocity = async (): Promise<VelocityRecord[]> => {

  const response = await axios.get<VelocityRecord[]>(
    `${API_URL}/velocity`
  )

  return response.data
}