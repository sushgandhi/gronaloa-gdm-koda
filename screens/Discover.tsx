
import React, { useState, useEffect } from 'react';
import { findNearbyHealthyOptions } from '../services/geminiService';
import { Button } from '../components/ui/Button';

const Discover: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 51.5074, lng: -0.1278 }) // Default to London
    );
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const data = await findNearbyHealthyOptions(location.lat, location.lng);
      setResults(data.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold">Local Explorer</h2>
        <p className="text-slate-500">Find healthy choices near you</p>
      </header>

      <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-bold">Browse Stores & Eats</h3>
          <p className="text-slate-400 text-sm">Koda will check Tesco, Waitrose, and local restaurants for healthier alternatives.</p>
          <Button fullWidth onClick={handleSearch} disabled={loading}>
            {loading ? 'Analyzing Local Data...' : 'Scan My Area'}
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
      </div>

      {results && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 prose prose-slate prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {results.split('\n').map((line, i) => (
               <p key={i} className={line.startsWith('#') ? 'font-bold text-slate-900 text-lg mt-4 mb-2' : 'mb-3'}>
                 {line.replace(/#/g, '')}
               </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
