import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { getDriver } from "../api/driverApi"
import type { DriverResponse } from "../types/driver"

import ProfileCard from "./ProfileCard"
import EarningsProgress from "./EarningsProgress"
import VelocityChart from "./VelocityChart"
//import TripActivity from "./TripActivity"

const DriverDashboard: React.FC = () => {

  const { driverId } = useParams()

  const [data, setData] = useState<DriverResponse | null>(null)

  useEffect(() => {

    if (driverId) {
      getDriver(driverId).then(setData)
    }

  }, [driverId])

  if (!data) return <div className="min-h-[200px] flex items-center justify-center text-gray-300">Loading...</div>

  const latest = data.current_status
  const timeline = data.timeline || []
  const trips = timeline.length ? timeline[timeline.length - 1].trips_completed || 0 : 0

  const forecastText = latest?.forecast || "Unknown"
  const forecastEmoji = /on[- ]?track/i.test(forecastText)
    ? "✅"
    : /ahead|up/i.test(forecastText)
    ? "🚀"
    : /behind|down|low/i.test(forecastText)
    ? "⚠️"
    : "🔮"

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="transform-gpu scale-90 origin-top">
      <div className="max-w-7xl mx-auto px-8 py-12 text-gray-100">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold">Driver Dashboard</h1>
        <div className="flex items-center gap-5">
          <div className="text-lg md:text-xl text-gray-300">Trips today</div>
          <div className="inline-flex items-center justify-center min-w-14 h-12 px-4 bg-emerald-600 text-white rounded-full font-bold text-lg">{trips}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Profile */}
        <div className="lg:col-span-5">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <ProfileCard profile={data.driver_profile} />
          </div>
          {/* Forecast (moved below profile, narrow to avoid overlapping earnings) */}
          <div className="mt-6 lg:mt-8">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 max-w-full">
              <div className="flex items-center justify-between">
                <div className="text-lg text-gray-300">Forecast Status</div>
                <div className="inline-flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-lg flex items-center gap-2">{forecastEmoji}</span>
                  <span className="text-white font-semibold">{forecastText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Earnings */}
        <div className="lg:col-span-7">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <EarningsProgress current={latest.current_earnings} predicted={latest.predicted_final} />
          </div>
        </div>

        {/* Chart full width */}
        <div className="lg:col-span-12">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-100">Earnings Velocity Trend</h3>
            <VelocityChart data={timeline} />
          </div>
        </div>

        {/* Forecast moved above the graph in the left column to prevent overlap with earnings progress */}

      </div>

      </div>
    </div>
    </div>
  )

}

export default DriverDashboard