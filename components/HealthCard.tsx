
import React from 'react';

interface HealthCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
}

export const HealthCard: React.FC<HealthCardProps> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white mb-2`}>
      {icon}
    </div>
    <span className="text-slate-500 text-sm font-medium">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {unit && <span className="text-slate-400 text-sm">{unit}</span>}
    </div>
  </div>
);
