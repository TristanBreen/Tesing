import React from 'react';
import { Trash2, Save, User, ArrowLeft } from 'lucide-react';
import { UserGoals } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_GOALS } from '../constants';

interface SettingsProps {
  onBack: () => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onReset }) => {
  const [goals, setGoals] = useLocalStorage<UserGoals>('hl-user-goals', DEFAULT_GOALS);
  
  // Local state for form
  const [localGoals, setLocalGoals] = React.useState(goals);

  const handleSave = () => {
    setGoals(localGoals);
    alert('Settings saved.');
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right pb-24">
       <div className="flex items-center gap-4 mb-2 mt-2">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
       </div>

       {/* Customization / Goals */}
       <div className="bg-surface p-4 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <User className="w-5 h-5 text-primary" />
             <h2 className="font-bold text-zinc-200">My Targets</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-zinc-500 uppercase font-bold">Daily Calories</label>
                <input 
                   type="number" 
                   value={localGoals.dailyCalories}
                   onChange={e => setLocalGoals({...localGoals, dailyCalories: Number(e.target.value)})}
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white mt-1 font-mono"
                />
             </div>
             <div>
                <label className="text-xs text-zinc-500 uppercase font-bold">Protein (g)</label>
                <input 
                   type="number" 
                   value={localGoals.dailyProtein}
                   onChange={e => setLocalGoals({...localGoals, dailyProtein: Number(e.target.value)})}
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white mt-1 font-mono"
                />
             </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors"
          >
             <Save className="w-4 h-4" /> Save Targets
          </button>
       </div>

       {/* Danger Zone */}
       <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
          <h2 className="font-bold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-sm text-zinc-500 mb-4">Permanently delete all workout history and nutrition logs.</p>
          <button 
             onClick={onReset}
             className="w-full py-3 border border-red-500/50 text-red-500 rounded-xl font-bold hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors"
          >
             <Trash2 className="w-4 h-4" /> Reset All Data
          </button>
       </div>
       
       <div className="text-center text-xs text-zinc-600 mt-8">
          Hypertrophy Lab v1.1.0
       </div>
    </div>
  );
};

export default Settings;