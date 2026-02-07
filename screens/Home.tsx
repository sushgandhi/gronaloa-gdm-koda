
import React, { useState, useEffect } from 'react';
import { HealthMetrics, MealLog, DailyBriefing, Persona } from '../types';
import { getSimulatedHealthData, getUserPersona } from '../services/healthData';
import { generateDailyBriefing } from '../services/geminiService';
import { HealthCard } from '../components/HealthCard';
import { Button } from '../components/ui/Button';

const Home: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [persona] = useState(getUserPersona());

  useEffect(() => {
    const data = getSimulatedHealthData();
    setMetrics(data);
    fetchBriefing(data);
  }, []);

  const fetchBriefing = async (data: HealthMetrics) => {
    setLoading(true);
    try {
      const b = await generateDailyBriefing(data, [], persona);
      setBriefing(b);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!metrics) return null;

  return (
    <div className="pb-20 space-y-6">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Koda</h1>
          <p className="text-slate-500">Welcome back, Health Seeker</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
           <img src={`https://picsum.photos/seed/${persona}/100`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Daily Briefing Section */}
      <section className="bg-emerald-600 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Morning Briefing</span>
          <span className="text-emerald-200 text-xs">• from {persona}</span>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-emerald-500/50 rounded w-3/4"></div>
            <div className="h-4 bg-emerald-500/50 rounded w-full"></div>
            <div className="h-4 bg-emerald-500/50 rounded w-1/2"></div>
          </div>
        ) : briefing ? (
          <div className="space-y-4">
            <p className="text-lg font-medium leading-tight">{briefing.summary}</p>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-200">TOMORROW'S PLAN</h4>
              <ul className="grid grid-cols-1 gap-2">
                {briefing.plan.map((item, idx) => (
                  <li key={idx} className="bg-white/10 p-3 rounded-xl text-sm flex items-start gap-2">
                    <span className="text-emerald-300">✦</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="text-white border-white/30" onClick={() => fetchBriefing(metrics)}>Generate Briefing</Button>
        )}
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <HealthCard 
          label="Activity" 
          value={metrics.steps} 
          unit="steps" 
          color="bg-orange-500" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
        />
        <HealthCard 
          label="Sleep" 
          value={metrics.sleepHours} 
          unit="hours" 
          color="bg-indigo-500" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} 
        />
        <HealthCard 
          label="Heart Rate" 
          value={metrics.heartRate} 
          unit="bpm" 
          color="bg-rose-500" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} 
        />
        <HealthCard 
          label="Blood Glucose" 
          value={metrics.glucose} 
          unit="mg/dL" 
          color="bg-cyan-500" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} 
        />
      </section>
    </div>
  );
};

export default Home;
