
import React, { useState } from 'react';
import { Persona } from '../types';
import { saveUserPersona, getUserPersona } from '../services/healthData';
import { Button } from '../components/ui/Button';

const Profile: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState(getUserPersona());

  const handlePersonaChange = (p: Persona) => {
    setSelectedPersona(p);
    saveUserPersona(p);
  };

  const personas = [
    { id: Persona.COACH, desc: "Action-oriented, motivational, and firm.", color: "bg-emerald-500" },
    { id: Persona.SCIENTIST, desc: "Data-driven, clinical, and precise.", color: "bg-blue-500" },
    { id: Persona.FRIEND, desc: "Supportive, casual, and empathetic.", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="text-center space-y-2 pt-4">
        <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto border-4 border-white shadow-lg overflow-hidden">
           <img src={`https://picsum.photos/seed/${selectedPersona}/200`} alt="Persona" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold">{selectedPersona}</h2>
        <p className="text-slate-500 text-sm">Your Virtual Health Assistant</p>
      </header>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 px-2">Choose Assistant Persona</h3>
        <div className="space-y-3">
          {personas.map(p => (
            <button
              key={p.id}
              onClick={() => handlePersonaChange(p.id)}
              className={`w-full p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${
                selectedPersona === p.id 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${p.color} flex-shrink-0 flex items-center justify-center text-white font-bold`}>
                {p.id.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{p.id}</h4>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
              {selectedPersona === p.id && (
                <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">App Preferences</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Sync with Apple Health</span>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Sync with Google Fit</span>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
        </div>
      </section>

      <Button variant="outline" fullWidth className="text-rose-600 border-rose-100 hover:bg-rose-50">
        Reset All Health Data
      </Button>
    </div>
  );
};

export default Profile;
