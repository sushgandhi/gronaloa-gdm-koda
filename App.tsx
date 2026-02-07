
import React, { useState } from 'react';
import Home from './screens/Home';
import Log from './screens/Log';
import Discover from './screens/Discover';
import Profile from './screens/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'log' | 'discover' | 'profile'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'log': return <Log />;
      case 'discover': return <Discover />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  const navItems = [
    { id: 'home', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Dash' },
    { id: 'log', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, label: 'Log' },
    { id: 'discover', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label: 'Nearby' },
    { id: 'profile', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: 'Me' },
  ] as const;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 relative">
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Persistent Bottom Nav */}
      <nav className="sticky bottom-0 left-0 right-0 glass border-t border-slate-200 px-6 py-4 flex justify-between items-center safe-bottom rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === item.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-2 rounded-2xl ${activeTab === item.id ? 'bg-emerald-50' : 'bg-transparent'}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
