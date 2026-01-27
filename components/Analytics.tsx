import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { WorkoutSession } from '../types';
import { calculate1RM, calculateVolumeLoad, formatDate } from '../constants';
import { Activity, Dumbbell, TrendingUp } from 'lucide-react';

interface AnalyticsProps {
  history: WorkoutSession[];
}

const Analytics: React.FC<AnalyticsProps> = ({ history }) => {
  if (history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-zinc-500 p-8 text-center">
            <Activity className="w-16 h-16 mb-4 text-zinc-700" />
            <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
            <p>Complete your first workout to enter the lab.</p>
        </div>
    );
  }

  // --- Metrics Calculation ---

  const lastSession = history[history.length - 1]; // Assuming sorted by date ascending in App.tsx or we sort here
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 1. Total Volume Load for recent sessions
  const volumeData = sortedHistory.map(session => {
    const totalVol = session.exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc, set) => sAcc + (set.completed ? calculateVolumeLoad(set.weight, set.reps) : 0), 0);
    }, 0);
    return {
        date: formatDate(session.date),
        volume: totalVol
    };
  });

  // 2. Volume by Muscle Group (All Time - or Last 30 Days?)
  // Let's do a simple aggregation of all time to show "distinction"
  const muscleVolMap: Record<string, number> = {};
  history.forEach(session => {
      session.exercises.forEach(ex => {
          const muscle = ex.targetMuscle || 'Other';
          const vol = ex.sets.reduce((acc, set) => acc + (set.completed ? calculateVolumeLoad(set.weight, set.reps) : 0), 0);
          muscleVolMap[muscle] = (muscleVolMap[muscle] || 0) + vol;
      });
  });

  const muscleData = Object.entries(muscleVolMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // 3. Best 1RM Estimates for "Big Moves"
  const bigMoves = lastSession.exercises.map(ex => {
      // Find best set
      let max1RM = 0;
      ex.sets.forEach(set => {
          if (set.completed) {
              const est = calculate1RM(set.weight, set.reps);
              if (est > max1RM) max1RM = est;
          }
      });
      return {
          name: ex.name,
          oneRepMax: max1RM
      };
  }).filter(item => item.oneRepMax > 0).sort((a,b) => b.oneRepMax - a.oneRepMax).slice(0, 5);

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">The Lab</h1>
        <p className="text-secondary text-sm">Performance Metrics & Science</p>
      </header>

      {/* Hero Stat: Last Session Volume */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="text-xs text-zinc-400 uppercase font-bold">Volume Load</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
                {(volumeData[volumeData.length - 1]?.volume / 1000).toFixed(1)}k
                <span className="text-xs text-zinc-500 ml-1 font-sans">lbs</span>
            </div>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-xs text-zinc-400 uppercase font-bold">Trend</span>
            </div>
            <div className="text-2xl font-mono font-bold text-green-400">
                +2.4%
            </div>
        </div>
      </div>

      {/* Chart: Volume History (Area Chart) */}
      <div className="bg-surface p-4 rounded-2xl border border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-300 mb-4">Volume Progression</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                    <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#71717a" 
                        tick={{fontSize: 10}} 
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                    />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#06b6d4' }}
                        cursor={{stroke: '#27272a'}}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorVol)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Chart: Muscle Group Distribution */}
      <div className="bg-surface p-4 rounded-2xl border border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-300 mb-4">Muscle Group Focus (Total Volume)</h3>
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={muscleData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{fill: '#a1a1aa', fontSize: 11}} 
                        width={60}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{fill: '#27272a'}}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {muscleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* List: Estimated 1RM */}
      <div className="bg-surface rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="text-sm font-bold text-zinc-300">Estimated 1RM (Current Session)</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Epley Formula: w * (1 + r/30)</p>
        </div>
        <div className="divide-y divide-zinc-800">
            {bigMoves.map((move, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-300">{move.name}</span>
                    <span className="font-mono font-bold text-secondary">{move.oneRepMax} <span className="text-xs text-zinc-600">lbs</span></span>
                </div>
            ))}
            {bigMoves.length === 0 && (
                <div className="p-4 text-center text-xs text-zinc-500">Log some sets to see stats.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;