import React from "react";
import type { DriverProfile } from "../types/driver";
import { Star } from "lucide-react";

interface Props {
  profile: DriverProfile;
}

const ProfileCard: React.FC<Props> = ({ profile }) => {
  const formatShift = (shift: string) => {
    const shiftMap: { [key: string]: string } = {
      morning: "Morning Shift",
      evening: "Evening Shift",
      full_day: "Full-Time",
    };
    return shiftMap[shift] || shift;
  };

  const initials =
    profile?.name
      ?.split(" ")
      ?.map((s) => s[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "?";

  // console.log("ProfileCard rendering with profile:", ProfileCard);
  // console.log("Profile profile:", profile);
  // console.log("Profile initials:", initials);
  return (
    // <div className="flex flex-col gap-6">
    //   <div className="flex items-center gap-6">
    //     <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-bold text-2xl">
    //       {initials}
    //     </div>

    //     <div>
    //       <div className="text-2xl md:text-3xl font-semibold">
    //         {profile.name}
    //       </div>

    //       <div className="text-lg text-gray-400">{profile.city}</div>
    //     </div>
    //   </div>

    //   <div className="flex gap-4 mt-3">
    //     <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
    //       <div className="text-sm text-gray-400">Rating</div>
    //       <div className="text-lg font-semibold text-yellow-400">
    //         ⭐ {profile.rating}
    //       </div>
    //     </div>

    //     <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
    //       <div className="text-sm text-gray-400">Experience</div>
    //       <div className="text-lg font-semibold">
    //         {profile.experience_months}m
    //       </div>
    //     </div>

    //     <div className="flex-1 bg-gray-900/40 border border-gray-700 rounded-lg px-4 py-3 text-center">
    //       <div className="text-sm text-gray-400">Shift</div>
    //       <div className="text-lg font-semibold">
    //         {profile.shift_preference}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
        {initials}
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tight italic uppercase">
          {profile.name}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Star size={14} fill="currentColor" /> {profile.rating}
          </span>
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            {formatShift(profile.shift_preference)} •{" "}
            {profile.experience_months} months Exp.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
