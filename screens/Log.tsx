
import React, { useState } from 'react';
import { analyzeMealImage } from '../services/geminiService';
import { MealLog } from '../types';
import { Button } from '../components/ui/Button';

const Log: React.FC = () => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);
      setAnalyzing(true);
      
      try {
        const analysis = await analyzeMealImage(base64);
        const newMeal: MealLog = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageUrl: reader.result as string,
          name: analysis.name || 'Unknown Dish',
          calories: analysis.calories || 0,
          protein: analysis.protein || 0,
          carbs: analysis.carbs || 0,
          fats: analysis.fats || 0,
          alternatives: analysis.alternatives || []
        };
        setMeals([newMeal, ...meals]);
      } catch (e) {
        console.error(e);
      } finally {
        setAnalyzing(false);
        setPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold">Food Log</h2>
        <p className="text-slate-500">Snap a photo to track your nutrition</p>
      </header>

      <div className="relative group">
        <label className="block w-full h-48 border-2 border-dashed border-slate-300 rounded-[2rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="text-sm font-semibold text-slate-600">Snap or Upload Meal</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={analyzing} />
        </label>
        {analyzing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in">
             <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
             <p className="text-sm font-bold text-slate-800">Koda is analyzing...</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {meals.map(meal => (
          <div key={meal.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
              <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.name} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 leading-tight">{meal.name}</h4>
                <span className="text-emerald-600 font-bold text-sm">{meal.calories} kcal</span>
              </div>
              <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>P: {meal.protein}g</span>
                <span>C: {meal.carbs}g</span>
                <span>F: {meal.fats}g</span>
              </div>
              {meal.alternatives.length > 0 && (
                <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-black text-emerald-800 block mb-1">HEALTHIER SWAPS</span>
                  <p className="text-[11px] text-emerald-700 leading-tight">{meal.alternatives.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Log;
