import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { getDriver } from "../api/driverApi"
import type { DriverResponse } from "../types/driver"

import ProfileCard from "./ProfileCard"
import EarningsProgress from "./EarningsProgress"
import VelocityChart from "./VelocityChart"

const DriverDashboard: React.FC = () => {

  const { driverId } = useParams()

  const [data, setData] = useState<DriverResponse | null>(null)

  useEffect(() => {

    if (!driverId) return

    getDriver(driverId)
      .then(setData)
      .catch(console.error)

  }, [driverId])

  if (!data) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-300">
        Loading...
      </div>
    )
  }

  const profile = data.driver_profile
  const latest = data.current_status
  const timeline = data.timeline ?? []

  const current = latest?.current_earnings ?? 0
  const predicted = latest?.predicted_final ?? null
  const goalValue =
  data.goal && data.goal.target_earnings != null
    ? data.goal.target_earnings
    : null
 

  const forecastText = latest?.forecast ?? "no_data"

  const forecastEmoji =
    forecastText === "on_track"
      ? "✅"
      : forecastText === "ahead"
      ? "🚀"
      : forecastText === "at_risk"
      ? "⚠️"
      : "ℹ️"

  return (

    <div className="min-h-screen bg-gray-900">

      <div className="transform-gpu scale-90 origin-top">

        <div className="max-w-7xl mx-auto px-8 py-12 text-gray-100">

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold">
              Driver Dashboard
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Profile */}

            <div className="lg:col-span-5">

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">

                {profile ? (
                  <ProfileCard profile={profile} />
                ) : (
                  <div className="text-gray-400">Driver profile unavailable</div>
                )}

              </div>

              {/* Forecast */}

              <div className="mt-6">

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">

                  <div className="flex items-center justify-between">

                    <div className="text-lg text-gray-300">
                      Forecast Status
                    </div>

                    <div className="inline-flex items-center gap-3">

                      <span className="text-emerald-400 font-bold text-lg">
                        {forecastEmoji}
                      </span>

                      <span className="text-white font-semibold capitalize">
                        {forecastText === "no_data"
                          ? "No earnings data yet"
                          : forecastText}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Earnings */}

            <div className="lg:col-span-7">

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">

                <EarningsProgress
                  current={current}
                  predicted={predicted}
                  goal={goalValue}
                />

              </div>

            </div>

            {/* Chart */}

            <div className="lg:col-span-12">

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">

                <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-100">
                  Earnings Velocity Trend
                </h3>

                {timeline.length > 0 ? (
                  <VelocityChart data={timeline} />
                ) : (
                  <div className="text-gray-400 text-center py-20">
                    No earnings data recorded yet
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

export default DriverDashboard