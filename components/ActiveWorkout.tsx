import React, { useState, useEffect } from 'react';
import { Plus, Repeat, CheckCircle2, Info, Trophy, TrendingUp, Timer, Star, X } from 'lucide-react';
import { WorkoutSession, SetLog, ExerciseDefinition, ExerciseTemplate } from '../types';
import { generateId, getWeightRecommendation, calculate1RM, getMax1RM } from '../constants';
import RestTimer from './RestTimer';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  history: WorkoutSession[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinish: () => void;
  availableExercises: ExerciseTemplate[];
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ session, history, onUpdateSession, onFinish, availableExercises }) => {
  const [lastCompletedTime, setLastCompletedTime] = useState<number | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [newPRs, setNewPRs] = useState<string[]>([]);
  
  // Finish Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');

  // --- Effects ---

  // Timer
  useEffect(() => {
      const interval = setInterval(() => {
          setElapsedSeconds(s => s + 1);
          // Also update session duration in state occasionally or on finish
          // For now we keep local and update on finish
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  // --- Logic ---

  const getPreviousStats = (exerciseId: string, setIndex: number): string => {
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const pastSession of sortedHistory) {
      if (pastSession.id === session.id) continue;
      const exercise = pastSession.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise && exercise.sets[setIndex]) {
        const s = exercise.sets[setIndex];
        if (s.completed) {
            return `${s.weight}lbs x ${s.reps}`;
        }
      }
    }
    return '-';
  };

  const updateSet = (exerciseIdx: number, setIdx: number, field: keyof SetLog, value: any) => {
    const newExercises = [...session.exercises];
    const currentExercise = newExercises[exerciseIdx];
    const currentSet = currentExercise.sets[setIdx];
    
    // Update value
    newExercises[exerciseIdx].sets[setIdx] = {
      ...currentSet,
      [field]: value
    };
    
    // Auto-trigger timer if completing
    if (field === 'completed' && value === true) {
      setLastCompletedTime(Date.now());
      checkPR(currentExercise.exerciseId, currentSet.weight, currentSet.reps);
    }

    onUpdateSession({ ...session, exercises: newExercises });
  };

  const checkPR = (exerciseId: string, weight: number, reps: number) => {
      if (!weight || !reps) return;
      const current1RM = calculate1RM(weight, reps);
      const historicalMax = getMax1RM(exerciseId, history);
      
      // We only celebrate if it's strictly greater and significantly valid (>0)
      if (current1RM > historicalMax && historicalMax > 0) {
          if(!newPRs.includes(exerciseId)) {
            setNewPRs(prev => [...prev, exerciseId]);
            // Could trigger a mini toast here
          }
      }
  };

  const addSet = (exerciseIdx: number) => {
    const newExercises = [...session.exercises];
    const previousSet = newExercises[exerciseIdx].sets[newExercises[exerciseIdx].sets.length - 1];
    newExercises[exerciseIdx].sets.push({
      id: generateId(),
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      rpe: 8,
      completed: false
    });
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const updateNotes = (exerciseIdx: number, text: string) => {
    const newExercises = [...session.exercises];
    newExercises[exerciseIdx].notes = text;
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const swapExercise = (currentExerciseIdx: number, newExerciseDef: ExerciseTemplate) => {
    const newExercises = [...session.exercises];
    const newSets: SetLog[] = Array.from({ length: newExerciseDef.defaultSets }).map(() => ({
      id: generateId(),
      weight: 0,
      reps: 0,
      rpe: 8,
      completed: false
    }));

    newExercises[currentExerciseIdx] = {
      exerciseId: newExerciseDef.id,
      name: newExerciseDef.name,
      targetMuscle: newExerciseDef.muscleGroup,
      sets: newSets,
      notes: ''
    };

    onUpdateSession({ ...session, exercises: newExercises });
    setSwapModalOpen(null);
  };

  const handleFinish = () => {
      // Update session with final details
      onUpdateSession({
          ...session,
          duration: elapsedSeconds,
          rating: rating,
          generalNotes: notes
      });
      onFinish(); // Trigger parent finish
  };

  // --- Render Helpers ---

  const formatTimer = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderSwapModal = () => {
    if (!swapModalOpen) return null;
    const currentEx = session.exercises.find(e => e.exerciseId === swapModalOpen);
    if (!currentEx) return null;
    const currentIdx = session.exercises.indexOf(currentEx);

    const alternatives = availableExercises.filter(
        db => db.muscleGroup === currentEx.targetMuscle && db.id !== currentEx.exerciseId
    );

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-surface border border-zinc-800 w-full max-w-sm rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
            <h3 className="font-bold text-lg text-white">Swap {currentEx.name}</h3>
            <button onClick={() => setSwapModalOpen(null)}><X className="w-5 h-5 text-zinc-500" /></button>
          </div>
          <div className="overflow-y-auto flex-1">
             {alternatives.length === 0 && (
                 <div className="p-6 text-center text-zinc-500">No alternatives found for {currentEx.targetMuscle}.</div>
             )}
             {alternatives.map(alt => (
                 <button
                    key={alt.id}
                    onClick={() => swapExercise(currentIdx, alt)}
                    className="w-full text-left p-4 hover:bg-zinc-800 border-b border-zinc-800/50 flex flex-col group"
                 >
                     <span className="font-semibold text-zinc-300 group-hover:text-primary">{alt.name}</span>
                     <span className="text-xs text-zinc-500">{alt.muscleGroup} • {alt.type}</span>
                 </button>
             ))}
          </div>
        </div>
      </div>
    );
  };

  if (showFinishModal) {
      return (
          <div className="fixed inset-0 z-50 bg-background flex flex-col p-6 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Session Complete</h2>
                  <button onClick={() => setShowFinishModal(false)}><X className="w-6 h-6 text-zinc-500" /></button>
              </div>

              <div className="space-y-6">
                  <div>
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider block mb-3">Session Rating</label>
                      <div className="flex gap-2">
                          {[1,2,3,4,5].map(r => (
                              <button 
                                key={r}
                                onClick={() => setRating(r)}
                                className={`flex-1 h-14 rounded-xl flex items-center justify-center border transition-all ${rating >= r ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}
                              >
                                  <Star className={`w-6 h-6 ${rating >= r ? 'fill-yellow-500' : ''}`} />
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider block mb-2">Session Notes</label>
                      <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="How did it feel? Energy levels? Pain?"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white h-32 focus:outline-none focus:border-primary"
                      />
                  </div>

                  <div className="bg-surface border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">Duration</span>
                      <span className="text-xl font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</span>
                  </div>

                  <button 
                    onClick={handleFinish}
                    className="w-full py-4 bg-primary text-black font-bold text-lg rounded-full mt-4"
                  >
                      Save Workout
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center shadow-md">
            <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white leading-tight">{session.name}</h1>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-0.5">
                    <Timer className="w-3 h-3" /> {formatTimer(elapsedSeconds)}
                </div>
            </div>
            <button 
                onClick={() => setShowFinishModal(true)}
                className="bg-primary text-background font-bold px-5 py-2 rounded-full hover:bg-cyan-400 transition-colors text-sm"
            >
                Finish
            </button>
        </div>

        {/* Exercises List */}
        <div className="p-4 space-y-6">
            {session.exercises.map((exercise, exIdx) => {
                const recommendation = getWeightRecommendation(exercise.exerciseId, history);
                const isPRActive = newPRs.includes(exercise.exerciseId);

                return (
                <div key={exercise.exerciseId + exIdx} className={`bg-surface rounded-2xl p-1 border shadow-sm transition-all ${isPRActive ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-zinc-800/50'}`}>
                    {/* Card Header */}
                    <div className="p-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-white leading-tight">{exercise.name}</h2>
                                {isPRActive && <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold uppercase">
                                    {exercise.targetMuscle}
                                </span>
                                {recommendation && (
                                    <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded font-bold border border-green-400/20">
                                        <TrendingUp className="w-3 h-3" />
                                        Rec: +{recommendation}lbs
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => setSwapModalOpen(exercise.exerciseId)}
                            className="p-2 text-zinc-500 hover:text-primary transition-colors"
                        >
                            <Repeat className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Notes Area */}
                    <div className="px-4 mb-4">
                        <textarea
                            placeholder="Add exercise notes..."
                            value={exercise.notes || ''}
                            onChange={(e) => updateNotes(exIdx, e.target.value)}
                            className="w-full bg-zinc-900/50 text-zinc-300 text-xs p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-zinc-700 border border-transparent focus:border-zinc-700"
                            rows={1}
                        />
                    </div>

                    {/* Grid Header */}
                    <div className="grid grid-cols-10 gap-2 px-2 text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2 text-center">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Lbs</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-2">RPE</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2 px-2 pb-4">
                        {exercise.sets.map((set, setIdx) => {
                            const prevData = getPreviousStats(exercise.exerciseId, setIdx);
                            return (
                                <div key={set.id} className={`relative grid grid-cols-10 gap-2 items-center transition-all ${set.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                    
                                    {/* Set Number */}
                                    <div className="col-span-1 flex justify-center">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                            {setIdx + 1}
                                        </div>
                                    </div>

                                    {/* Weight Input + Ghost */}
                                    <div className="col-span-3 relative">
                                        <input
                                            type="number"
                                            value={set.weight || ''}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value))}
                                            className={`w-full bg-zinc-900 rounded-md py-3 text-center text-lg font-bold focus:ring-1 focus:ring-primary focus:outline-none ${set.completed ? 'text-zinc-500' : 'text-white'}`}
                                            placeholder="0"
                                        />
                                        <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] text-zinc-600 font-mono">
                                            {prevData.split('x')[0]}
                                        </div>
                                    </div>

                                    {/* Reps Input + Ghost */}
                                    <div className="col-span-3 relative">
                                        <input
                                            type="number"
                                            value={set.reps || ''}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseFloat(e.target.value))}
                                            className={`w-full bg-zinc-900 rounded-md py-3 text-center text-lg font-bold focus:ring-1 focus:ring-primary focus:outline-none ${set.completed ? 'text-zinc-500' : 'text-white'}`}
                                            placeholder="0"
                                        />
                                        <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] text-zinc-600 font-mono">
                                            {prevData.includes('x') ? prevData.split('x')[1] : '-'}
                                        </div>
                                    </div>

                                    {/* RPE Input */}
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={set.rpe || ''}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'rpe', parseFloat(e.target.value))}
                                            className={`w-full bg-zinc-900 rounded-md py-3 text-center text-lg font-bold focus:ring-1 focus:ring-primary focus:outline-none ${set.completed ? 'text-zinc-500' : 'text-secondary'}`}
                                            placeholder="8"
                                            max={10}
                                        />
                                    </div>

                                    {/* Completion Checkbox */}
                                    <div className="col-span-1 flex justify-center">
                                        <button 
                                            onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-primary text-background' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Set Button */}
                    <div className="px-2 pb-4">
                        <button 
                            onClick={() => addSet(exIdx)}
                            className="w-full py-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Set
                        </button>
                    </div>
                </div>
            )})}
        </div>
        
        <div className="h-12"></div>
        <RestTimer lastCompleted={lastCompletedTime} />
        {renderSwapModal()}
    </div>
  );
};

export default ActiveWorkout;