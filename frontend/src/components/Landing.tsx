import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Activity, Target, ArrowRight } from "lucide-react";

const CompactFeature: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = ({ title, desc, icon }) => (
  <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-none mb-1">
        {title}
      </h3>
      <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
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
    <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full flex flex-col gap-6">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-indigo-600 text-[9px] font-black uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Experimental Concept
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-2">
            Driver <span className="text-indigo-600">Pulse.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl">
            Real-time trip awareness and goal tracking for the modern shift.
          </p>
        </div>

        {/* Main Interaction Card */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />

          <div className="relative z-10">
            <h2 className="text-xl font-black mb-1 uppercase tracking-tight">
              Access Your Dashboard
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-tighter">
              Enter ID to begin
            </p>

            <form
              onSubmit={goToDashboard}
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                aria-label="Driver ID"
                placeholder="e.g., DRV064"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                GO TO DASHBOARD <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <CompactFeature
            title="Privacy First"
            desc="Locally processed signals. No listening."
            icon={<Shield size={18} />}
          />
          <CompactFeature
            title="Signal-Based"
            desc="Motion & trip boundary analysis."
            icon={<Zap size={18} />}
          />
          <CompactFeature
            title="Real-Time"
            desc="Live shift feedback loops."
            icon={<Activity size={18} />}
          />
          <CompactFeature
            title="Goal Focused"
            desc="Automated earnings forecasting."
            icon={<Target size={18} />}
          />
        </div>

        {/* Minimal Footer */}
        <div className="pt-4 border-t border-slate-200/60 flex justify-between items-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Pulse Engine
          </p>
          <div className="flex gap-4 text-[9px] font-black text-slate-300 uppercase">
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
