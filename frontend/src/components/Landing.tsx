import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FeatureCard: React.FC<{ title: string; desc: string; icon?: string }> = ({
  title,
  desc,
  icon,
}) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl">
        {icon || "🔒"}
      </div>
      <div>
        <div className="text-lg md:text-xl font-semibold text-gray-100">
          {title}
        </div>
        <div className="text-sm md:text-base text-gray-400 mt-1">{desc}</div>
      </div>
    </div>
  </div>
);

const Landing: React.FC = () => {
  const [driverId, setDriverId] = useState("");
  const navigate = useNavigate();

  const goToDashboard = (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = driverId.trim();
    if (!id) return;
    navigate(`/driver/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 text-sm md:text-base text-emerald-400 font-semibold mb-4">
            • EXPERIMENTAL CONCEPT
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold">
            Driver <span className="text-emerald-400">Pulse</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            An experimental concept designed to give drivers a clearer picture
            of two things that matter deeply during every shift: how their trips
            are unfolding in real time, and whether their work is moving them
            toward the goals they set for themselves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <FeatureCard
            title="Privacy First"
            desc="Does not listen to conversations or judge behavior. Works only with numerical signals already on the device."
            icon="🔒"
          />
          <FeatureCard
            title="Signal-Based"
            desc="Motion patterns, aggregated audio intensity levels, timestamps, trip boundaries, earnings records."
            icon="📶"
          />
          <FeatureCard
            title="Real-Time Awareness"
            desc="Individually, these signals are noisy and incomplete. Taken together, they can tell a story."
            icon="📈"
          />
          <FeatureCard
            title="Goal Tracking"
            desc="See whether your work is moving you toward the goals you set for yourself, shift by shift."
            icon="🎯"
          />
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-100">
            Access Your Dashboard
          </h3>
          <p className="text-base text-gray-400 mt-3">
            Enter your Driver ID to view your personalized pulse.
          </p>

          <form onSubmit={goToDashboard} className="mt-6 flex gap-4">
            <input
              aria-label="Driver ID"
              placeholder="e.g., DRV004"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="flex-1 bg-gray-900/40 border border-gray-700 rounded-md px-6 py-3 text-gray-100 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-md font-semibold text-lg"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;
