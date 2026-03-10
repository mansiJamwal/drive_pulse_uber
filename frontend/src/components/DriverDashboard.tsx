import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getDriver, getDriverTrips, getDriverProgress } from "../api/driverApi";
import { getDriverPulse } from "../api/pulseApi";

import ProfileCard from "./ProfileCard";
import EarningAndVelocity from "./EarningAndVelocity";
import EditGoalModal from "./EditGoalModal";
import ForecastCard from "./ForecastCard";
import { getStressByDriver } from "../api/stressApi";
import PulseEventsModal from "./PulseEventsModal";

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
  Clock,
  TrendingUp,
  Star,
  MapPin,
  Edit,
} from "lucide-react";

const DriverDashboard: React.FC = () => {
  const { driverId } = useParams();

  const [data, setData] = useState<DriverResponse | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);

  /* ---------- STRESS EVENTS STATE ---------- */

  const [events, setEvents] = useState<any[]>([]);
  const [selectedTripEvents, setSelectedTripEvents] = useState<any[]>([]);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);

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

  /* ---------- LOAD STRESS EVENTS ---------- */

  useEffect(() => {
    if (!driverId) return;

    getStressByDriver(driverId)
      .then((data) => {

        setEvents(data);

        // const chartData = data.map((e: any) => ({
        //   time: new Date(e.timestamp).toLocaleTimeString([], {
        //     hour: "2-digit",
        //     minute: "2-digit",
        //   }),
        //   motion: Math.round((e.motion_score ?? 0) * 100),
        //   audio: Math.round((e.audio_score ?? 0) * 100),
        // }));

        // setGraphData(chartData);

      })
      .catch(console.error);
  }, [driverId]);

  useEffect(() => {
  if (!driverId) return;

  getDriverPulse(driverId)
    .then((data) => {

      console.log("PULSE API DATA:", data);

      const chartData = data.map((e: any) => ({
        time: new Date(e.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        motion: Math.round((e.motion_score ?? 0) * 100),
        audio: Math.round(e.audio_score * 100)
      }));

      setGraphData(chartData);

    })
    .catch(console.error);

}, [driverId]);

  if (!data) {
    return (
      <div className="min-h-50 flex items-center justify-center text-gray-300">
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        <ProfileCard profile={profile} />

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
        {/* Trip History - Detailed & Beautiful Version */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Trip History
              </h2>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                {trips.length} TRIPS
              </span>
            </div>

            <div className="space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
              {trips.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No trips recorded today
                </div>
              ) : (

  trips.map((trip) => {

    // ⭐ logic from sahithi-feature
    const tripEvents = events.filter(
      (e) => e.trip_id === trip.trip_id
    );

    return (
      <div
        key={trip.trip_id}
        className="relative pl-6 pb-2 border-l-2 border-slate-100 last:border-l-0 group"
      >
        {/* Timeline Dot */}
        {/* <div
  className={`absolute-left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${
    trip.status === "completed"
      ? "bg-emerald-500"
      : "bg-blue-500"
  }`}
/> */}

<div
                      className={`absolute-left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${
                        trip.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                    />

        <div className="bg-slate-50 rounded-xl p-4 border border-transparent group-hover:border-slate-200 group-hover:bg-white transition-all">

          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                {trip.trip_id}
              </div>
              <div className="text-sm font-black text-slate-900">
                ₹{trip.fare?.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 justify-end">
                <Star
                  size={10}
                  className="fill-amber-400 stroke-amber-400"
                />
                {trip.trip_quality_rating || "4.8"}
              </div>

              <div className="text-[9px] text-slate-400 font-medium">
                {trip.start_time?.split(" ")[1] || "Ongoing"}
              </div>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                <TrendingUp size={12} className="text-indigo-500" />
              </div>

              <div className="leading-tight">
                <p className="text-[9px] text-slate-400 font-bold uppercase">
                  Distance
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {trip.distance || trip.distance || 0} km
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                <Clock size={12} className="text-emerald-500" />
              </div>

              <div className="leading-tight">
                <p className="text-[9px] text-slate-400 font-bold uppercase">
                  Time
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {trip.duration || trip.duration || 0} min
                </p>
              </div>
            </div>
          </div>

          {/* ⭐ Pulse Event Button (logic added) */}
          {tripEvents.length > 0 && (
            <button
              onClick={() => {
                setSelectedTripEvents(tripEvents);
                setShowEventsModal(true);
              }}
              className="text-xs text-red-500 mt-3 underline"
            >
              ⚠ {tripEvents.length} pulse event
              {tripEvents.length > 1 ? "s" : ""}
            </button>
          )}

          {/* Location Footer */}
          <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 font-medium italic truncate">
            <MapPin size={10} />
            {trip.pickup_location || "Pickup"} →{" "}
            {trip.dropoff_location || "Dropoff"}
          </div>

        </div>
      </div>
    );
  })
)}
            </div>
          </div>
        </div>

        {/* Driver Pulse */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight mb-4">
              <Activity size={20} /> Driver Pulse
            </h2>

            <div className="h-64 w-full">
              {graphData.length === 0 ? (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      No data available
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={graphData}>
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
              )}
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
                className="text-xs text-slate-500"
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

      {/* PULSE EVENTS MODAL */}

      {showEventsModal && (
        <PulseEventsModal
          events={selectedTripEvents}
          onClose={() => setShowEventsModal(false)}
        />
      )}

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