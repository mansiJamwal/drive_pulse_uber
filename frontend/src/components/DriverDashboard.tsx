import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getDriver, getDriverTrips, getDriverProgress } from "../api/driverApi";

import ProfileCard from "./ProfileCard";
import EarningAndVelocity from "./EarningAndVelocity";
import EditGoalModal from "./EditGoalModal";
import ForecastCard from "./ForecastCard";

import type { DriverResponse, Trip, ProgressSummary } from "../types/driver";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  ComposedChart,
} from "recharts";

import {
  Activity,
  ShieldAlert,
  Clock,
  TrendingUp,
  Star,
  MapPin,
  Edit,
} from "lucide-react";

const pulseData = [
  { time: "14:01", motion: 20, audio: 30 },
  { time: "14:02", motion: 45, audio: 35 },
  { time: "14:03", motion: 85, audio: 90 },
  { time: "14:04", motion: 30, audio: 40 },
  { time: "14:05", motion: 25, audio: 30 },
  { time: "14:06", motion: 50, audio: 20 },
];

const DriverDashboard: React.FC = () => {
  const { driverId } = useParams();

  const [data, setData] = useState<DriverResponse | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);

  /* -----------------------------
     Load Driver Data
  ----------------------------- */

  const loadDriver = async () => {
    if (!driverId) return;

    const res = await getDriver(driverId);
    setData(res);
  };

  const loadProgress = async () => {
    if (!driverId) return;

    const res = await getDriverProgress(driverId);
    setProgress(res);
  };

  useEffect(() => {
    if (!driverId) return;

    loadDriver();
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    getDriverTrips(driverId)
      .then((res) => setTrips(res.trips))
      .catch(console.error);
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    loadProgress();
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
  const goal = data.goal;

  const current = latest?.current_earnings ?? 0;

  const goalValue =
    goal && goal.target_earnings != null ? goal.target_earnings : null;

  const velocityData = timeline.map((row: any) => ({
    hour: row.timestamp ?? "",
    actualVelocity: row.computed_velocity ?? 0,
    requiredVelocity: row.computed_target_velocity ?? 0,
  }));
  const forecast = latest?.forecast;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <ProfileCard profile={profile} />

        {/* Right side: group earning/velocity and forecast so they align together */}
        <div className="ml-auto flex items-center gap-4">
          <EarningAndVelocity
            current={current}
            goal={goalValue}
            computed_velocity={latest?.computed_velocity}
            target_velocity={latest?.target_velocity}
            shift_end_time={goal?.shift_end_time}
            hours_worked={latest?.hours_worked}
            target_hours={goal?.target_hours}
          />

          <div className="w-full lg:w-auto">
            <ForecastCard
              forecast={latest?.forecast}
              predicted_final={latest?.predicted_final}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trip History */}
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
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {trip.trip_id}
                    </span>

                    <span
                      className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                        trip.status === "completed"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="text-xs font-black text-slate-800 mb-1">
                    ₹{trip.fare?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver Pulse */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight mb-4">
              <Activity size={20} className="text-indigo-600" /> Driver Pulse
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pulseData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="motion"
                    stroke="#6366f1"
                    fill="#6366f1"
                  />

                  <Area
                    type="monotone"
                    dataKey="audio"
                    stroke="#fb7185"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Velocity + Progress */}
        <div className="lg:col-span-1 space-y-6">
          {/* Velocity */}

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <TrendingUp size={16} /> Velocity vs Target
            </h2>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={velocityData}>
                  <XAxis dataKey="hour" hide />
                  <YAxis hide />
                  <Tooltip />

                  <Area
                    type="stepAfter"
                    dataKey="actualVelocity"
                    stroke="#10b981"
                    fill="#d1fae5"
                  />

                  <Line
                    type="monotone"
                    dataKey="requiredVelocity"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Progress */}

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MapPin size={16} /> Daily Progress
              </h2>

              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
              >
                <Edit size={14} /> Edit
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-black text-slate-900">
                {progress?.progress_percent ?? 0}%
              </span>

              <span className="text-[10px] font-bold text-slate-400">
                ₹{progress?.current ?? 0} / ₹{progress?.goal ?? 0}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 border border-slate-200">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress?.progress_percent ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* EDIT GOAL MODAL */}

      {showEditModal && driverId && (
        <EditGoalModal
          driverId={driverId}
          currentGoal={goal ?? {}}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadDriver();
            loadProgress();
          }}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
