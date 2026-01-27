import React, { useMemo } from 'react';
import { Activity, Battery, BatteryCharging, BatteryFull, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { WorkoutSession, MuscleGroup, MuscleRecoveryState, WeeklyVolume, ExerciseProgress } from '../types';
import { calculateMuscleRecovery, calculateWeeklyVolume, analyzeExerciseProgress, MASTER_EXERCISE_LIST } from '../constants';

interface ScienceTabProps {
  history: WorkoutSession[];
}

const ScienceTab: React.FC<ScienceTabProps> = ({ history }) => {
  // --- Data Processing ---
  const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  const recoveryData: MuscleRecoveryState[] = useMemo(() => {
    return muscleGroups.map(muscle => calculateMuscleRecovery(history, muscle));
  }, [history]);

  const volumeData: WeeklyVolume[] = useMemo(() => {
    return muscleGroups.map(muscle => calculateWeeklyVolume(history, muscle));
  }, [history]);

  const progressData: ExerciseProgress[] = useMemo(() => {
    // Identify distinct exercises from history (last 30 days)
    const recentExercises = new Set<string>();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    history.forEach(s => {
        if (new Date(s.date).getTime() > thirtyDaysAgo) {
            s.exercises.forEach(e => recentExercises.add(e.exerciseId));
        }
    });
    
    const results: ExerciseProgress[] = [];
    recentExercises.forEach(exId => {
        const analysis = analyzeExerciseProgress(history, exId);
        if (analysis) results.push(analysis);
    });
    
    // Sort by priority: Decreasing > Plateaued > Increasing
    return results.sort((a, b) => {
        const priority = { 'decreasing': 0, 'plateaued': 1, 'increasing': 2 };
        return priority[a.trend] - priority[b.trend];
    });
  }, [history]);

  const deloadStatus = useMemo(() => {
      // Logic: Count consecutive weeks with > 2 sessions
      // Simplified: Just weeks since last deload (where volume < 50% avg)
      // For now, placeholder logic based on total sessions count to emulate "Weeks"
      const weeksTrained = Math.floor(history.length / 4); // Rough approx
      const needsDeload = weeksTrained > 0 && weeksTrained % 5 === 0;
      return { weeksSince: weeksTrained, needsDeload };
  }, [history]);

  const sessionQuality = useMemo(() => {
      // Last 7 days stats
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentSessions = history.filter(s => new Date(s.date).getTime() > sevenDaysAgo);
      
      const count = recentSessions.length;
      const totalRPE = recentSessions.reduce((acc, s) => acc + (s.rating || 0), 0);
      const avgRating = count > 0 ? (totalRPE / count).toFixed(1) : '-';
      
      return { count, avgRating };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-in fade-in">
        <Activity className="w-20 h-20 text-zinc-800 mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
        <p className="text-zinc-500 max-w-xs mx-auto">Complete your first workout to unlock recovery intelligence and hypertrophy insights.</p>
      </div>
    );
  }

  // --- Render Components ---

  const getRecoveryColor = (status: string) => {
      switch(status) {
          case 'recovered': return 'text-green-500 bg-green-500/10 border-green-500/20';
          case 'recovering': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
          case 'fresh': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
          default: return 'text-zinc-500';
      }
  };

  const getRecoveryIcon = (status: string) => {
      switch(status) {
          case 'recovered': return <BatteryFull className="w-4 h-4" />;
          case 'recovering': return <BatteryCharging className="w-4 h-4" />;
          case 'fresh': return <Battery className="w-4 h-4" />;
          default: return <Activity className="w-4 h-4" />;
      }
  };

  const getTrendIcon = (trend: string) => {
      switch(trend) {
          case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
          case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
          case 'plateaued': return <Minus className="w-4 h-4 text-yellow-500" />;
          default: return null;
      }
  };

  return (
    <div className="pb-32 p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-white leading-tight">Training Science</h1>
        <p className="text-zinc-400 text-sm">Fatigue Management & Recovery Intelligence</p>
      </header>

      {/* Card 1: Muscle Recovery Status */}
      <section className="bg-surface rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
            <Battery className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-zinc-200">Muscle Recovery</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
            {recoveryData.map(r => (
                <div key={r.muscleGroup} className={`p-3 rounded-xl border ${getRecoveryColor(r.fatigueStatus)} transition-all hover:bg-opacity-20`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-white">{r.muscleGroup}</span>
                        {getRecoveryIcon(r.fatigueStatus)}
                    </div>
                    <div className="space-y-1">
                         <div className="text-xs font-medium uppercase tracking-wider opacity-80">{r.fatigueStatus}</div>
                         <div className="text-[10px] opacity-60">
                             {r.hoursSinceTraining === Infinity ? 'Fresh' : `${r.hoursSinceTraining}h ago`} • {r.setsLastSession} sets
                         </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Card 2: Weekly Volume */}
      <section className="bg-surface rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-zinc-200">Weekly Volume (Sets)</h3>
        </div>
        <div className="space-y-4">
            {volumeData.map(v => {
                const maxRange = v.recommendedRange[1] * 1.5; // Scale bar
                const percent = Math.min(100, (v.setsThisWeek / maxRange) * 100);
                const isOptimal = v.status === 'optimal';
                const isOver = v.status === 'overtrained';
                
                return (
                    <div key={v.muscleGroup}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-300 font-medium">{v.muscleGroup}</span>
                            <span className={`${isOptimal ? 'text-green-400' : isOver ? 'text-red-400' : 'text-blue-400'}`}>
                                {v.setsThisWeek} / {v.recommendedRange[0]}-{v.recommendedRange[1]}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                            <div 
                                className={`h-full rounded-full ${isOptimal ? 'bg-green-500' : isOver ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                            {/* Marker for Optimal Start */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-700" style={{ left: `${(v.recommendedRange[0]/maxRange)*100}%` }}></div>
                             {/* Marker for Optimal End */}
                             <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-700" style={{ left: `${(v.recommendedRange[1]/maxRange)*100}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
      </section>

      {/* Card 3: Progressive Overload Tracker */}
      <section className="bg-surface rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-zinc-200">Progress Tracker</h3>
        </div>
        <div className="space-y-3">
            {progressData.length === 0 && <div className="text-zinc-500 text-sm italic">Log more sessions to see trends.</div>}
            {progressData.slice(0, 5).map(p => (
                <div key={p.exerciseId} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-zinc-200">{p.exerciseName}</span>
                        <div className="flex items-center gap-2 text-xs bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            {getTrendIcon(p.trend)}
                            <span className="capitalize text-zinc-400">{p.trend}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1 items-end h-8">
                            {p.last3SessionsVolume.map((vol, i) => (
                                <div key={i} className="w-2 bg-zinc-700 rounded-t" style={{ height: `${(vol / Math.max(...p.last3SessionsVolume)) * 100}%` }}></div>
                            ))}
                        </div>
                        <p className="text-xs text-zinc-500 max-w-[70%] text-right">{p.recommendation}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Card 5: Deload Indicator */}
      <section className="bg-surface rounded-2xl border border-zinc-800 p-4 relative overflow-hidden">
        {deloadStatus.needsDeload && <div className="absolute top-0 right-0 p-1 bg-yellow-500 text-black text-[10px] font-bold px-2 rounded-bl-lg">RECOMMENDED</div>}
        <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={`w-5 h-5 ${deloadStatus.needsDeload ? 'text-yellow-500' : 'text-zinc-600'}`} />
            <h3 className="font-bold text-zinc-200">Deload Status</h3>
        </div>
        <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">Weeks Trained</span>
            <span className="font-mono font-bold text-white">{deloadStatus.weeksSince} / 5</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-3">
             <div className={`h-full ${deloadStatus.needsDeload ? 'bg-yellow-500' : 'bg-zinc-700'}`} style={{ width: `${Math.min(100, (deloadStatus.weeksSince / 5) * 100)}%` }}></div>
        </div>
        {deloadStatus.needsDeload ? (
            <button className="w-full py-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded-lg text-xs font-bold">
                Schedule Deload Week
            </button>
        ) : (
            <p className="text-xs text-zinc-500">Keep pushing. Fatigue levels within optimal range.</p>
        )}
      </section>

       {/* Card 6: Quality Metrics */}
       <div className="grid grid-cols-2 gap-4">
           <div className="bg-surface rounded-2xl border border-zinc-800 p-4 text-center">
               <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Weekly Freq</div>
               <div className="text-2xl font-mono font-bold text-white">{sessionQuality.count}</div>
           </div>
           <div className="bg-surface rounded-2xl border border-zinc-800 p-4 text-center">
               <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Avg Rating</div>
               <div className="text-2xl font-mono font-bold text-secondary">{sessionQuality.avgRating}</div>
           </div>
       </div>

    </div>
  );
};

export default ScienceTab;