import React, { useState } from 'react';
import { Plus, Repeat, CheckCircle2, Info } from 'lucide-react';
import { WorkoutSession, SetLog, ExerciseDefinition } from '../types';
import { MASTER_EXERCISE_LIST, generateId } from '../constants';
import RestTimer from './RestTimer';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  history: WorkoutSession[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinish: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ session, history, onUpdateSession, onFinish }) => {
  const [lastCompletedTime, setLastCompletedTime] = useState<number | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState<string | null>(null); // Exercise ID to swap

  // --- Logic ---

  const getPreviousStats = (exerciseId: string, setIndex: number): string => {
    // Find the most recent session containing this exercise
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const pastSession of sortedHistory) {
      if (pastSession.id === session.id) continue; // Skip current
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
    newExercises[exerciseIdx].sets[setIdx] = {
      ...newExercises[exerciseIdx].sets[setIdx],
      [field]: value
    };
    
    // Auto-trigger timer if completing
    if (field === 'completed' && value === true) {
      setLastCompletedTime(Date.now());
    }

    onUpdateSession({ ...session, exercises: newExercises });
  };

  const addSet = (exerciseIdx: number) => {
    const newExercises = [...session.exercises];
    // Copy previous set values for UX convenience
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

  // Updated swap logic using MASTER_EXERCISE_LIST
  const swapExercise = (currentExerciseIdx: number, newExerciseDef: any) => {
    const newExercises = [...session.exercises];
    
    // Create new sets based on default
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

  // --- Render Helpers ---

  const renderSwapModal = () => {
    if (!swapModalOpen) return null;
    const currentEx = session.exercises.find(e => e.exerciseId === swapModalOpen);
    if (!currentEx) return null;
    const currentIdx = session.exercises.indexOf(currentEx);

    // Filter alternatives: Same muscle group, not current exercise
    const alternatives = MASTER_EXERCISE_LIST.filter(
        db => db.muscleGroup === currentEx.targetMuscle && db.id !== currentEx.exerciseId
    );

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-surface border border-zinc-800 w-full max-w-sm rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-lg">Swap {currentEx.name}</h3>
            <button onClick={() => setSwapModalOpen(null)}><Info className="w-5 h-5 text-zinc-500" /></button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
             {alternatives.length === 0 && (
                 <div className="p-6 text-center text-zinc-500">No alternatives found for {currentEx.targetMuscle}.</div>
             )}
             {alternatives.map(alt => (
                 <button
                    key={alt.id}
                    onClick={() => swapExercise(currentIdx, alt)}
                    className="w-full text-left p-4 hover:bg-zinc-800 border-b border-zinc-800/50 flex flex-col"
                 >
                     <span className="font-semibold text-primary">{alt.name}</span>
                     <span className="text-xs text-zinc-400">Target: {alt.muscleGroup} • {alt.type}</span>
                 </button>
             ))}
          </div>
          <div className="p-4 bg-zinc-900">
            <button 
                onClick={() => setSwapModalOpen(null)}
                className="w-full py-3 bg-zinc-800 rounded-lg font-semibold"
            >
                Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-white">{session.name}</h1>
                <p className="text-xs text-secondary font-mono tracking-wider uppercase">Hypertrophy Phase</p>
            </div>
            <button 
                onClick={onFinish}
                className="bg-primary text-background font-bold px-6 py-2 rounded-full hover:bg-cyan-400 transition-colors"
            >
                Finish
            </button>
        </div>

        {/* Exercises List */}
        <div className="p-4 space-y-8">
            {session.exercises.map((exercise, exIdx) => (
                <div key={exercise.exerciseId + exIdx} className="bg-surface rounded-2xl p-1 border border-zinc-800/50 shadow-sm">
                    {/* Card Header */}
                    <div className="p-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{exercise.name}</h2>
                            <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded mt-1 inline-block">
                                {exercise.targetMuscle}
                            </span>
                        </div>
                        <button 
                            onClick={() => setSwapModalOpen(exercise.exerciseId)}
                            className="p-2 text-zinc-500 hover:text-primary transition-colors"
                        >
                            <Repeat className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Notes Area */}
                    <div className="px-4 mb-4">
                        <textarea
                            placeholder="Cues (e.g., controlled eccentric...)"
                            value={exercise.notes || ''}
                            onChange={(e) => updateNotes(exIdx, e.target.value)}
                            className="w-full bg-zinc-900/50 text-zinc-300 text-sm p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-zinc-600"
                            rows={2}
                        />
                    </div>

                    {/* Grid Header */}
                    <div className="grid grid-cols-10 gap-2 px-2 text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2 text-center">
                        <div className="col-span-1">Set</div>
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
            ))}
        </div>
        
        <div className="h-12"></div> {/* Spacer */}
        <RestTimer lastCompleted={lastCompletedTime} />
        {renderSwapModal()}
    </div>
  );
};

export default ActiveWorkout;