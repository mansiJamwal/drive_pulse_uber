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

  if (!data) return <div>Loading...</div>

  const latest = data.current_status

  const trips =
    data.timeline[data.timeline.length - 1].trips_completed || 0

  return (

    <div style={{ padding: 30 }}>

      <h1>Driver Dashboard</h1>

      <ProfileCard profile={data.driver_profile} />

      <EarningsProgress
        current={latest.current_earnings}
        predicted={latest.predicted_final}
      />

      <VelocityChart data={data.timeline} />

      {/* <TripActivity trips={trips} /> */}

      <h3>
        Forecast Status: <b>{latest.forecast}</b>
      </h3>

    </div>

  )

}

export default DriverDashboard