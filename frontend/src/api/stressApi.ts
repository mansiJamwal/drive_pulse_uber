import axios from "axios"

const API = "https://drive-pulse-uber.onrender.com"
//const API = "http://localhost:8000"
export const getAllStressFlags = async () => {
const res = await axios.get(`${API}/stress/flags`)
return res.data
}

export const getStressByDriver = async (driverId: string) => {
const res = await axios.get(`${API}/stress/flags/driver/${driverId}`)
return res.data
}

export const getStressByTrip = async (tripId: string) => {
const res = await axios.get(`${API}/stress/flags/trip/${tripId}`)
return res.data
}

export const getStressBySeverity = async (severity: string) => {
const res = await axios.get(`${API}/stress/flags/severity/${severity}`)
return res.data
}

export const getStressSummary = async () => {
const res = await axios.get(`${API}/stress/summary`)
return res.data
}

export const runStressPipeline = async () => {
const res = await axios.post(`${API}/stress/run`)
return res.data
}
