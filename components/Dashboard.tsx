import React from 'react';
import { WorkoutSession, Routine } from '../types';
import { formatDate } from '../constants';
import { Play, ArrowRight, Plus, Dumbbell, Trash2, X } from 'lucide-react';

interface DashboardProps {
  history: WorkoutSession[];
  routines: Routine[];
  onStartWorkout: (routine?: Routine) => void;
  onResume: () => void;
  onGoToBuilder: () => void;
  onOpenSettings: () => void;
  activeSession: WorkoutSession | null;
  onDeleteRoutine: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  routines, 
  onStartWorkout, 
  onResume, 
  onGoToBuilder, 
  onOpenSettings, 
  activeSession,
  onDeleteRoutine,
  onDeleteSession
}) => {
  return (
    <div className="p-4 pb-24 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 text-sm">Welcome to the Lab.</p>
        </div>
      </div>

      {/* Main Action - Resume or Builder */}
      {activeSession ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-1">
          <div className="bg-surface/90 backdrop-blur-sm rounded-[20px] p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-2">Session in Progress</h2>
              <p className="text-sm text-zinc-400 mb-6">Continuing {activeSession.name}...</p>
              <button 
                  onClick={onResume}
                  className="w-full h-14 bg-white text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shadow-primary/10"
              >
                  <Play className="fill-black w-5 h-5" /> Resume Workout
              </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onGoToBuilder}
                className="bg-surface border border-zinc-800 hover:border-zinc-700 text-white p-5 rounded-2xl flex flex-row items-center gap-4 h-24 transition-colors relative overflow-hidden group"
              >
                  <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                      <div className="font-bold text-lg leading-tight">Builder</div>
                      <div className="text-xs text-zinc-500 font-medium">Create New Routine</div>
                  </div>
              </button>
          </div>
      )}

      {/* Saved Routines */}
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Your Routines</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {routines.map(routine => (
                <button 
                    key={routine.id}
                    onClick={() => onStartWorkout(routine)}
                    className="flex-shrink-0 w-40 bg-surface p-4 rounded-xl border border-zinc-800 hover:border-primary/50 transition-colors text-left flex flex-col gap-2 group relative"
                >
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRoutine(routine.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-zinc-900 transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-zinc-200 truncate pr-4">{routine.name}</div>
                        <div className="text-xs text-zinc-500">{routine.exercises.length} Exercises</div>
                    </div>
                </button>
            ))}
            {routines.length === 0 && (
                <div className="text-sm text-zinc-500 italic p-2">No routines saved. Use the Builder!</div>
            )}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Logs</h3>
        </div>
        <div className="space-y-3">
            {history.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 bg-surface rounded-xl border border-zinc-800 border-dashed">
                    No history found. Start lifting!
                </div>
            ) : (
                [...history].reverse().slice(0, 5).map((session) => (
                    <div key={session.id} className="bg-surface p-4 rounded-xl border border-zinc-800 flex justify-between items-center group">
                        <div>
                            <div className="font-bold text-zinc-200">{session.name}</div>
                            <div className="text-xs text-zinc-500">{formatDate(session.date)} • {session.exercises.length} Exercises</div>
                        </div>
                        <button 
                            onClick={() => onDeleteSession(session.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;