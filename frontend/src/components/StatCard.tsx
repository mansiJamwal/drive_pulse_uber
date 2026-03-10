import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  sub,
  color,
}) => (
  // Use a consistent card width on larger screens so multiple stat cards line up
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-35 w-full lg:w-56">
    <div className={`mb-2 ${color} bg-slate-50 w-fit p-2 rounded-lg`}>
      {icon}
    </div>
    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
      {label}
    </div>
    <div className="text-xl font-black text-slate-900 tracking-tight">
      {value}
    </div>
    <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
      {sub}
    </div>
  </div>
);

export default StatCard;