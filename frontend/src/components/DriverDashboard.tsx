import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { getDriver, getDriverTrips, getDriverProgress } from "../api/driverApi";

import ProfileCard from "./ProfileCard";
import EarningAndVelocity from "./EarningAndVelocity";
import EarningsProgress from "./EarningsProgress";
// import VelocityChart from "./VelocityChart";
// import EditGoalModal from "./EditGoalModal";

import type { DriverResponse, Trip, ProgressSummary } from "../types/driver";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  Activity,
  DollarSign,
  ShieldAlert,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";

const pulseData = [
  { time: "14:01", motion: 20, audio: 30 },
  { time: "14:02", motion: 45, audio: 35 },
  { time: "14:03", motion: 85, audio: 90 }, // The "Stress Moment"
  { time: "14:04", motion: 30, audio: 40 },
  { time: "14:05", motion: 25, audio: 30 },
  { time: "14:06", motion: 50, audio: 20 },
];

const velocityData = [
  { hour: "10am", actualVelocity: 18, requiredVelocity: 22 },
  { hour: "11am", actualVelocity: 22, requiredVelocity: 22 },
  { hour: "12pm", actualVelocity: 30, requiredVelocity: 22 },
  { hour: "1pm", actualVelocity: 25, requiredVelocity: 22 },
  { hour: "2pm", actualVelocity: 28, requiredVelocity: 22 },
];

const mockTrips = [
  {
    trip_id: "TRP_102",
    duration: 22,
    distance: 8.4,
    fare: 18.5,
    status: "Flagged",
  },
  {
    trip_id: "TRP_101",
    duration: 15,
    distance: 4.2,
    fare: 12.0,
    status: "Smooth",
  },
  {
    trip_id: "TRP_100",
    duration: 34,
    distance: 12.1,
    fare: 24.8,
    status: "Smooth",
  },
];

const DriverDashboard: React.FC = () => {
  const { driverId } = useParams();
  const [data, setData] = useState<DriverResponse | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  // const [showGoalEditor, setShowGoalEditor] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    getDriver(driverId)
      .then((responseData) => {
        console.log("DriverDashboard received data:", responseData);
        setData(responseData);
      })
      .catch(console.error);
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    getDriverTrips(driverId)
      .then((tripsData) => {
        console.log("DriverDashboard received trips:", tripsData);
        setTrips(tripsData.trips);
      })
      .catch(console.error);
  }, [driverId]);

  if (!data) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-300">
        Loading...
      </div>
    );
  }

  const profile = data.driver_profile;
  const latest = data.current_status;
  const timeline = data.timeline ?? [];

  // console.log("in driver dashboasrd latest", latest);
  // console.log("in driver dashboasrd data", data);
  const current = latest?.current_earnings ?? 0;
  const predicted = latest?.predicted_final ?? null;
  const goalValue =
    data.goal && data.goal.target_earnings != null
      ? data.goal.target_earnings
      : null;
  const goal = data.goal;

  // console.log("earning data in dashboard : ", current, predicted, goalValue);
  // console.log(
  //   " velocities in main dashboard component",
  //   latest?.computed_velocity,
  //   latest?.target_velocity,
  // );
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        {profile ? (
          <ProfileCard profile={profile} />
        ) : (
          <div className="text-gray-400">Driver profile unavailable</div>
        )}
        {/* console.log("In main dashboard component current,goalValue,computer_velocity,targer_v:", current,goalValue,computed_velocity, target_velocity); */}
        <EarningAndVelocity
          current={current}
          goal={goalValue}
          computed_velocity={latest?.computed_velocity}
          target_velocity={latest?.target_velocity}
          shift_end_time={goal?.shift_end_time}
          hours_worked={latest?.hours_worked}
          target_hours={goal?.target_hours}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 2. LEFT: Trip History Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Clock size={16} /> Trip History
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trips.map((trip) => (
                <div
                  key={trip.trip_id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  {/* Header: Trip ID and Status */}
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {trip.trip_id}
                    </span>
                    <div className="flex gap-2">
                      <span
                        className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${trip.status === "completed" ? "bg-emerald-100 text-emerald-600" : trip.status === "cancelled" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {trip.status}
                      </span>
                      {trip.surge_multiplier && trip.surge_multiplier > 1 && (
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-600">
                          {trip.surge_multiplier}x Surge
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time and Basic Info */}
                  <div className="mb-2.5 space-y-1.5">
                    <div className="text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600">
                        {trip.start_time}
                      </span>
                      {" → "}
                      <span className="font-semibold text-slate-600">
                        {trip.end_time}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <span className="font-medium">{trip.duration}</span> min •{" "}
                      <span className="font-medium">
                        {trip.distance ? trip.distance.toFixed(1) : "N/A"}
                      </span>{" "}
                      km
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="mb-2.5 space-y-1">
                    <div className="flex gap-2 text-[9px] text-slate-600">
                      <span className="text-emerald-600 font-bold">↳</span>
                      <span className="truncate">{trip.pickup_location}</span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-slate-600">
                      <span className="text-rose-600 font-bold">↲</span>
                      <span className="truncate">{trip.dropoff_location}</span>
                    </div>
                  </div>

                  {/* Earnings and Quality */}
                  <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-xs font-black text-slate-800 mb-1">
                        ${trip.fare ? trip.fare.toFixed(2) : "N/A"}
                      </div>
                      {trip.trip_quality_rating && (
                        <div className="flex gap-1 items-center">
                          <Star
                            size={12}
                            className={
                              trip.trip_quality_rating === "excellent"
                                ? "text-amber-400 fill-amber-400"
                                : trip.trip_quality_rating === "good"
                                  ? "text-slate-400 fill-slate-400"
                                  : "text-rose-400"
                            }
                          />
                          <span className="text-[8px] text-slate-500 font-medium">
                            {trip.trip_quality_rating}
                          </span>
                        </div>
                      )}
                    </div>
                    {trip.stress_score !== undefined && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium mb-1">
                          Stress
                        </div>
                        <div
                          className={`text-xs font-black ${trip.stress_score > 70 ? "text-rose-600" : trip.stress_score > 40 ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {trip.stress_score}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CENTER: Pulse Graph & Human Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                  <Activity size={20} className="text-indigo-600" /> Driver
                  Pulse
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Motion & Audio Signal Fusion
                </p>
              </div>
              <div className="flex gap-4 text-[9px] font-black uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>{" "}
                  Motion
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-400 rounded-full"></span>{" "}
                  Audio
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pulseData}>
                  <defs>
                    <linearGradient
                      id="colorMotion"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="motion"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorMotion)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="audio"
                    stroke="#fb7185"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insight Block */}
            <div className="mt-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                <ShieldAlert size={14} /> Engineering Decision
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                At <span className="text-white font-bold">14:03</span>, the
                system identified a high-stress moment. Sudden deceleration
                overlapped with a 60% rise in audio intensity.
                <span className="text-indigo-300 block mt-2 font-bold italic underline">
                  Recommendation: Stress-aware route adjustment.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 4. RIGHT: Velocity & Required Target */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" /> Velocity
                vs Target
              </h2>
              <div className="flex flex-col items-end text-[8px] font-black uppercase text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-slate-400"></span> Target
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span>{" "}
                  Actual
                </span>
              </div>
            </div>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={velocityData}>
                  <XAxis dataKey="hour" hide />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    contentStyle={{ fontSize: "10px", borderRadius: "8px" }}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="actualVelocity"
                    stroke="#10b981"
                    fill="#d1fae5"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="requiredVelocity"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-700 font-black uppercase tracking-tight italic">
                Pace: +$6.00 / hour ahead of goal
              </p>
            </div>
          </div>

          {/* Goal Circular Tracker */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-rose-500" /> Daily Progress
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                60%
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                $112 / $185
              </span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 border border-slate-200">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-1000"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

// ---    HELPER COMPONENTS ---
// const StatCard = ({ icon, label, value, sub, color }) => (
//   <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-[140px] flex-1">
//     <div className={`mb-2 ${color} bg-slate-50 w-fit p-2 rounded-lg`}>
//       {icon}
//     </div>
//     <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
//       {label}
//     </div>
//     <div className="text-xl font-black text-slate-900 tracking-tight">
//       {value}
//     </div>
//     <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
//       {sub}
//     </div>
//   </div>
// );

//required things
//GET /trips/{driver_id}: To pull the list of trips from trips.csv.

// GET /driver/{driver_id}: To pull the rating and experience from drivers.csv.

// GET /flags/{trip_id}: To pull the specific stress moments from flagged_moments.csv.

//should i add dollar or ruppes
