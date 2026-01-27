import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Flame, Utensils, Zap } from 'lucide-react';
import { MacroDay, UserGoals } from '../types';
import { DEFAULT_GOALS, formatDate } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const NutritionLog = () => {
  const [goals, setGoals] = useLocalStorage<UserGoals>('hl-user-goals', DEFAULT_GOALS);
  const [logs, setLogs] = useLocalStorage<Record<string, MacroDay>>('hl-nutrition-logs', {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get Today's Log
  const todayKey = new Date().toISOString().split('T')[0];
  const todayLog = logs[todayKey] || {
    date: new Date().toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    isRefeed: false
  };

  const updateToday = (updates: Partial<MacroDay>) => {
    const newLog = { ...todayLog, ...updates };
    setLogs({ ...logs, [todayKey]: newLog });
  };

  const toggleRefeed = () => {
    const isRefeed = !todayLog.isRefeed;
    updateToday({ isRefeed });
  };

  // --- Visuals ---
  const proteinPercent = Math.min(100, Math.round((todayLog.protein / goals.dailyProtein) * 100));
  
  const chartData = [
    { name: 'Protein', value: todayLog.protein * 4, color: '#3b82f6' }, // Blue
    { name: 'Carbs', value: todayLog.carbs * 4, color: '#eab308' }, // Yellow
    { name: 'Fats', value: todayLog.fats * 9, color: '#ef4444' }, // Red
  ];
  const activeChartData = chartData.filter(d => d.value > 0);
  if (activeChartData.length === 0) activeChartData.push({ name: 'Empty', value: 1, color: '#27272a' });

  // Weekly Surplus/Deficit (Last 7 days)
  const calculateWeeklyBalance = () => {
    let balance = 0;
    const days = 7;
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
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
      
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-900/20 to-background p-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-1">Fuel</h1>
        <p className="text-zinc-400 text-sm">High Performance Nutrition</p>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Protein Pacer */}
        <div className="bg-surface rounded-2xl border border-zinc-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                    <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Protein Pacer</div>
                    <div className="text-3xl font-bold text-white">
                        {todayLog.protein} <span className="text-lg text-zinc-500 font-normal">/ {goals.dailyProtein}g</span>
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
                    <Flame className={`w-5 h-5 ${todayLog.isRefeed ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                    <span className="text-xs font-bold uppercase text-zinc-400">Refeed Day</span>
                </div>
                <button 
                    onClick={toggleRefeed}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${todayLog.isRefeed ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' : 'bg-zinc-900 text-zinc-500'}`}
                >
                    {todayLog.isRefeed ? 'ON' : 'OFF'}
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
                    <span className="font-mono text-zinc-500">{todayLog.protein}g</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Carbs
                    </span>
                    <span className="font-mono text-zinc-500">{todayLog.carbs}g</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Fats
                    </span>
                    <span className="font-mono text-zinc-500">{todayLog.fats}g</span>
                </div>
            </div>
        </div>

        {/* Full Add Trigger */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 font-medium hover:text-white hover:border-zinc-700 transition-all"
        >
            Log Custom Meal...
        </button>
      </div>

      {/* Simplified Meal Modal */}
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
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-500 font-bold">Cancel</button>
                      <button 
                        onClick={() => {
                            const p = Number((document.getElementById('m-prot') as HTMLInputElement).value) || 0;
                            const c = Number((document.getElementById('m-cals') as HTMLInputElement).value) || 0;
                            const carb = Number((document.getElementById('m-carbs') as HTMLInputElement).value) || 0;
                            const f = Number((document.getElementById('m-fats') as HTMLInputElement).value) || 0;
                            updateToday({
                                protein: todayLog.protein + p,
                                calories: todayLog.calories + c,
                                carbs: todayLog.carbs + carb,
                                fats: todayLog.fats + f
                            });
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