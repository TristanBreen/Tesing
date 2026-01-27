import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Save, Trash2, GripVertical, Dumbbell, X, Beaker } from 'lucide-react';
import { generateId } from '../constants';
import { Routine, ExerciseTemplate, MuscleGroup } from '../types';

interface RoutineBuilderProps {
  onSave: (routine: Routine) => void;
  onCancel: () => void;
  availableExercises: ExerciseTemplate[];
  onAddCustomExercise: (ex: ExerciseTemplate) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ onSave, onCancel, availableExercises, onAddCustomExercise }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{
    uniqueId: string;
    template: ExerciseTemplate;
    targetSets: number;
    targetRepRange: string;
  }[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom Exercise State
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customType, setCustomType] = useState('Isolation');

  const addExercise = (template: ExerciseTemplate) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        uniqueId: generateId(),
        template,
        targetSets: template.defaultSets,
        targetRepRange: '8-12'
      }
    ]);
  };

  const removeExercise = (index: number) => {
    const newEx = [...selectedExercises];
    newEx.splice(index, 1);
    setSelectedExercises(newEx);
  };

  const updateExerciseConfig = (index: number, field: 'targetSets' | 'targetRepRange', value: any) => {
    const newEx = [...selectedExercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setSelectedExercises(newEx);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(selectedExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedExercises(items);
  };

  const handleSave = () => {
    if (!routineName) return alert('Please name your routine');
    if (selectedExercises.length === 0) return alert('Add at least one exercise');

    const routine: Routine = {
      id: generateId(),
      name: routineName,
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.template.id,
        targetSets: ex.targetSets,
        targetRepRange: ex.targetRepRange
      }))
    };
    onSave(routine);
  };

  const handleCreateCustom = () => {
      if(!customName) return;
      const newEx: ExerciseTemplate = {
          id: `custom-${generateId()}`,
          name: customName,
          muscleGroup: customMuscle,
          type: 'Custom',
          defaultSets: 3
      };
      onAddCustomExercise(newEx);
      setCustomName('');
      setIsCustomModalOpen(false);
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300 relative">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-white">Lab Builder</h2>
           <p className="text-xs text-zinc-400">Design your hypertrophy block</p>
        </div>
        <div className="flex gap-2">
            <button onClick={onCancel} className="text-zinc-400 hover:text-white px-3 py-2 text-sm">Cancel</button>
            <button 
                onClick={handleSave}
                className="bg-primary text-background font-bold px-4 py-2 rounded-full hover:bg-cyan-400 flex items-center gap-2"
            >
                <Save className="w-4 h-4" /> Save
            </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <input 
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="Routine Name (e.g. Leg Day A)"
            className="w-full bg-surface border border-zinc-800 p-4 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-primary placeholder-zinc-600"
        />

        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 order-1 lg:order-2">
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 min-h-[300px]">
                    <div className="flex items-center gap-2 mb-4 text-zinc-400 uppercase tracking-wider text-xs font-bold">
                        <Dumbbell className="w-4 h-4" /> Routine Sequence
                    </div>
                    
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="routine-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {selectedExercises.length === 0 && (
                                        <div className="text-center py-10 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                                            Tap exercises below to add.
                                        </div>
                                    )}
                                    {selectedExercises.map((item, index) => (
                                        <Draggable key={item.uniqueId} draggableId={item.uniqueId} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} className="bg-surface p-3 rounded-xl border border-zinc-800 flex items-center gap-3 shadow-sm group">
                                                    <div {...provided.dragHandleProps} className="text-zinc-600 hover:text-zinc-300 cursor-grab active:cursor-grabbing">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-zinc-200">{item.template.name}</div>
                                                        <div className="flex gap-4 mt-2">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Sets</span>
                                                                <input type="number" value={item.targetSets} onChange={(e) => updateExerciseConfig(index, 'targetSets', parseInt(e.target.value))} className="w-10 bg-zinc-900 text-center text-xs text-white rounded py-1 border border-zinc-800" />
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Reps</span>
                                                                <input value={item.targetRepRange} onChange={(e) => updateExerciseConfig(index, 'targetRepRange', e.target.value)} className="w-16 bg-zinc-900 text-center text-xs text-white rounded py-1 border border-zinc-800" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeExercise(index)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            <div className="flex-1 order-2 lg:order-1 h-[500px] flex flex-col">
                <div className="sticky top-0 bg-background z-10 pb-2 border-b border-zinc-800/50 mb-2 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Exercise Library</h3>
                   <button 
                    onClick={() => setIsCustomModalOpen(true)}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded border border-zinc-700 flex items-center gap-1"
                   >
                       <Beaker className="w-3 h-3" /> Create Custom
                   </button>
                </div>
                
                <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                    {availableExercises.map(ex => (
                        <button 
                            key={ex.id}
                            onClick={() => addExercise(ex)}
                            className="w-full text-left bg-surface/50 hover:bg-zinc-800 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center transition-colors group"
                        >
                            <div>
                                <div className="font-semibold text-zinc-300 text-sm">{ex.name}</div>
                                <div className="text-[10px] text-zinc-500 uppercase mt-0.5">
                                    {ex.muscleGroup} • {ex.type}
                                </div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-500 group-hover:text-primary group-hover:border-primary transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Custom Exercise Modal */}
      {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-zinc-800 w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in zoom-in-95">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">Create Custom Exercise</h3>
                      <button onClick={() => setIsCustomModalOpen(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs text-zinc-500 uppercase font-bold">Name</label>
                          <input 
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. Bulgarian Split Squat"
                            className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="text-xs text-zinc-500 uppercase font-bold">Muscle</label>
                             <select 
                                value={customMuscle}
                                onChange={(e) => setCustomMuscle(e.target.value as any)}
                                className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1"
                             >
                                 {['Chest','Back','Legs','Shoulders','Arms','Abs','Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="text-xs text-zinc-500 uppercase font-bold">Type</label>
                             <select 
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="w-full bg-zinc-900 p-3 rounded-lg text-white border border-zinc-800 mt-1"
                             >
                                 <option value="Isolation">Isolation</option>
                                 <option value="Compound">Compound</option>
                                 <option value="Machine">Machine</option>
                                 <option value="Bodyweight">Bodyweight</option>
                             </select>
                        </div>
                      </div>
                  </div>
                  <button 
                    onClick={handleCreateCustom}
                    className="w-full py-3 bg-primary text-background font-bold rounded-xl mt-2"
                  >
                      Create Exercise
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default RoutineBuilder;