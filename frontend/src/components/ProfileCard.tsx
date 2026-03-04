import React from "react"
import type { DriverProfile } from "../types/driver"

interface Props {
  profile: DriverProfile
}

const ProfileCard: React.FC<Props> = ({ profile }) => {

  return (

    <div style={{
      border: "1px solid #ddd",
      padding: 20,
      borderRadius: 10,
      marginBottom: 20
    }}>

      <h2>{profile.name}</h2>

      <p><b>City:</b> {profile.city}</p>
      <p><b>Rating:</b> ⭐ {profile.rating}</p>
      <p><b>Experience:</b> {profile.experience_months} months</p>
      <p><b>Preferred Shift:</b> {profile.shift_preference}</p>

    </div>

  )

}

export default ProfileCard