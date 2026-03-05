import React from "react"
import type { DriverProfile } from "../types/driver"

interface Props {
  profile: DriverProfile
}

const ProfileCard: React.FC<Props> = ({ profile }) => {

  const initials =
    profile?.name
      ?.split(" ")
      ?.map((s) => s[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "?"

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center gap-6">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-bold text-2xl">
          {initials}
        </div>

        <div>
          <div className="text-2xl md:text-3xl font-semibold">
            {profile.name}
          </div>

          <div className="text-lg text-gray-400">
            {profile.city}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-3">

        <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
          <div className="text-sm text-gray-400">Rating</div>
          <div className="text-lg font-semibold text-yellow-400">
            ⭐ {profile.rating}
          </div>
        </div>

        <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
          <div className="text-sm text-gray-400">Experience</div>
          <div className="text-lg font-semibold">
            {profile.experience_months}m
          </div>
        </div>

        <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
          <div className="text-sm text-gray-400">Shift</div>
          <div className="text-lg font-semibold">
            {profile.shift_preference}
          </div>
        </div>

      </div>

    </div>
  )
}

export default ProfileCard