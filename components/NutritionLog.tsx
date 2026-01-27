import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Flame, Utensils, Zap, ChevronLeft, ChevronRight, Bookmark, Trash2, Calendar, Coffee } from 'lucide-react';
import { MacroDay, UserGoals, MealPreset } from '../types';
import { DEFAULT_GOALS, formatDate, generateId } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const NutritionLog = () => {
  const [goals, setGoals] = useLocalStorage<UserGoals>('hl-user-goals', DEFAULT_GOALS);
  const [logs, setLogs] = useLocalStorage<Record<string, MacroDay>>('hl-nutrition-logs', {});
  const [presets, setPresets] = useLocalStorage<MealPreset[]>('hl-meal-presets', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Date Navigation State
  const [viewDate, setViewDate] = useState(new Date());

  // Helpers
  const getDateKey = (date: Date) => date.toISOString().split('T')[0];
  const currentKey = getDateKey(viewDate);
  const isToday = currentKey === getDateKey(new Date());

  const changeDate = (days: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + days);
    setViewDate(newDate);
  };

  // Get Log for Selected Date
  const currentLog = logs[currentKey] || {
    date: new Date(viewDate).toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    isRefeed: false
  };

  const updateLog = (updates: Partial<MacroDay>) => {
    const newLog = { ...currentLog, ...updates };
    setLogs({ ...logs, [currentKey]: newLog });
  };

  const toggleRefeed = () => {
    const isRefeed = !currentLog.isRefeed;
    updateLog({ isRefeed });
  };

  const deletePreset = (id: string) => {
      if(window.confirm('Remove this saved meal?')) {
          setPresets(presets.filter(p => p.id !== id));
      }
  };

  const addPresetToLog = (preset: MealPreset) => {
      updateLog({
          calories: currentLog.calories + preset.calories,
          protein: currentLog.protein + preset.protein,
          carbs: currentLog.carbs + preset.carbs,
          fats: currentLog.fats + preset.fats
      });
  };

  // --- Visuals ---
  const proteinPercent = Math.min(100, Math.round((currentLog.protein / goals.dailyProtein) * 100));
  
  const chartData = [
    { name: 'Protein', value: currentLog.protein * 4, color: '#3b82f6' }, // Blue
    { name: 'Carbs', value: currentLog.carbs * 4, color: '#eab308' }, // Yellow
    { name: 'Fats', value: currentLog.fats * 9, color: '#ef4444' }, // Red
  ];
  const activeChartData = chartData.filter(d => d.value > 0);
  if (activeChartData.length === 0) activeChartData.push({ name: 'Empty', value: 1, color: '#27272a' });

  // Weekly Surplus/Deficit (Last 7 days from TODAY, not viewDate)
  const calculateWeeklyBalance = () => {
    let balance = 0;
    const days = 7;
    for (let i = 0; i < days; i++) {
        const d = new Date(); // Always relative to real today
        d.setDate(d.getDate() - i);
        const key = getDateKey(d);
        const log = logs[key];
        if (log) {
            balance += (log.calories - goals.dailyCalories);
        }
    }
    return balance;
  };
  const weeklyBalance = calculateWeeklyBalance();

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      
      {/* Header with Date Navigation */}
      <div className="bg-gradient-to-b from-blue-900/20 to-background p-4 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Fuel <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">History</span>
            </h1>
            <div className="flex items-center gap-3 bg-zinc-900/80 rounded-full px-3 py-1 border border-zinc-800">
                <button onClick={() => changeDate(-1)} className="text-zinc-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span className="text-sm font-bold text-zinc-200">
                        {isToday ? 'Today' : formatDate(viewDate.toISOString())}
                    </span>
                </div>
                <button onClick={() => changeDate(1)} className="text-zinc-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Protein Pacer */}
        <div className="bg-surface rounded-2xl border border-zinc-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                    <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Protein Pacer</div>
                    <div className="text-3xl font-bold text-white">
                        {currentLog.protein} <span className="text-lg text-zinc-500 font-normal">/ {goals.dailyProtein}g</span>
                    </div>
                </div>
                <div className="text-blue-400 font-mono font-bold">{proteinPercent}%</div>
            </div>
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${proteinPercent}%` }}
                ></div>
            </div>
            {/* Background Texture */}
            <Utensils className="absolute -right-4 -bottom-4 w-32 h-32 text-zinc-800/50 -rotate-12 pointer-events-none" />
        </div>

        {/* Calorie Bank & Refeed */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className={`w-5 h-5 ${currentLog.isRefeed ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                    <span className="text-xs font-bold uppercase text-zinc-400">Refeed Day</span>
                </div>
                <button 
                    onClick={toggleRefeed}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${currentLog.isRefeed ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' : 'bg-zinc-900 text-zinc-500'}`}
                >
                    {currentLog.isRefeed ? 'ON' : 'OFF'}
                </button>
            </div>
            <div className="bg-surface p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs font-bold uppercase text-zinc-400">7-Day Bank</span>
                </div>
                <div className={`text-xl font-mono font-bold ${weeklyBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {weeklyBalance > 0 ? '+' : ''}{weeklyBalance} <span className="text-xs text-zinc-600">kcal</span>
                </div>
            </div>
        </div>

        {/* Macro Split Chart & Details */}
        <div className="flex gap-4 items-center bg-surface p-4 rounded-2xl border border-zinc-800">
            <div className="w-24 h-24 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={40}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {activeChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-zinc-500">Split</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Protein
                    </span>
                    <span className="font-mono text-zinc-500">{currentLog.protein}g</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Carbs
                    </span>
                    <span className="font-mono text-zinc-500">{currentLog.carbs}g</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Fats
                    </span>
                    <span className="font-mono text-zinc-500">{currentLog.fats}g</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800/50">
                     <span className="flex items-center gap-2 text-zinc-300 font-bold">
                        Calories
                    </span>
                    <span className="font-mono text-white font-bold">{currentLog.calories} / {goals.dailyCalories}</span>
                </div>
            </div>
        </div>

        {/* Meal Presets Horizontal Scroll */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Bookmark className="w-3 h-3" /> Quick Add / Saved Meals
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                 {presets.map(preset => (
                     <div key={preset.id} className="flex-shrink-0 relative group">
                        <button 
                            onClick={() => addPresetToLog(preset)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-primary/50 p-3 rounded-xl min-w-[120px] text-left transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Coffee className="w-4 h-4 text-zinc-500" />
                                <span className="font-bold text-zinc-200 text-sm truncate w-20">{preset.name}</span>
                            </div>
                            <div className="text-xs text-zinc-500 font-mono">
                                {preset.protein}p • {preset.calories}cal
                            </div>
                        </button>
                        <button 
                            onClick={() => deletePreset(preset.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                 ))}
                 
                 {/* Add New Trigger (Just opens modal for now, user can save there) */}
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 bg-zinc-900/50 border border-dashed border-zinc-700 hover:border-zinc-500 p-3 rounded-xl min-w-[100px] flex flex-col items-center justify-center text-zinc-500 gap-1"
                 >
                     <Plus className="w-5 h-5" />
                     <span className="text-xs font-medium">New</span>
                 </button>
            </div>
        </div>

        {/* Full Add Trigger */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 font-medium hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
        >
            <Plus className="w-5 h-5" /> Log Custom Meal
        </button>

      </div>

      {/* Meal Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-zinc-800 w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom-10">
                  <h3 className="text-xl font-bold text-white">Log Meal</h3>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs text-zinc-500 uppercase font-bold">Protein (g)</label>
                          <input type="number" placeholder="0" className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1" id="m-prot" />
                      </div>
                      <div>
                          <label className="text-xs text-zinc-500 uppercase font-bold">Calories</label>
                          <input type="number" placeholder="0" className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1" id="m-cals" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-zinc-500 uppercase font-bold">Carbs (g)</label>
                            <input type="number" placeholder="0" className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1" id="m-carbs" />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase font-bold">Fats (g)</label>
                            <input type="number" placeholder="0" className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1" id="m-fats" />
                        </div>
                      </div>
                      
                      {/* Save as Preset Option */}
                      <div className="pt-2 border-t border-zinc-800">
                          <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Save as Preset (Optional)</label>
                          <input type="text" placeholder="Meal Name (e.g. Chicken Rice)" className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800" id="m-name" />
                      </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-500 font-bold">Cancel</button>
                      <button 
                        onClick={() => {
                            const p = Number((document.getElementById('m-prot') as HTMLInputElement).value) || 0;
                            const c = Number((document.getElementById('m-cals') as HTMLInputElement).value) || 0;
                            const carb = Number((document.getElementById('m-carbs') as HTMLInputElement).value) || 0;
                            const f = Number((document.getElementById('m-fats') as HTMLInputElement).value) || 0;
                            const name = (document.getElementById('m-name') as HTMLInputElement).value;

                            // Update Log
                            updateLog({
                                protein: currentLog.protein + p,
                                calories: currentLog.calories + c,
                                carbs: currentLog.carbs + carb,
                                fats: currentLog.fats + f
                            });

                            // Save Preset if Name exists
                            if (name) {
                                setPresets([...presets, {
                                    id: generateId(),
                                    name,
                                    protein: p,
                                    calories: c,
                                    carbs: carb,
                                    fats: f
                                }]);
                            }

                            setIsModalOpen(false);
                        }}
                        className="flex-1 py-3 bg-primary text-black rounded-xl font-bold"
                      >
                          Add Log
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default NutritionLog;