import React from 'react';
import { Trash2, Save, User, ArrowLeft, Download, Upload, Timer, Bell, Database, Shield } from 'lucide-react';
import { UserGoals, UserPreferences } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_GOALS } from '../constants';

interface SettingsProps {
  onBack: () => void;
  onReset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    defaultRestTimer: 90,
    weightUnit: 'lbs',
    autoStartTimer: true,
    enablePRNotifications: true,
    minRecoveryHours: 48,
    deloadFrequency: 5
};

const Settings: React.FC<SettingsProps> = ({ onBack, onReset }) => {
  const [goals, setGoals] = useLocalStorage<UserGoals>('hl-user-goals', DEFAULT_GOALS);
  const [prefs, setPrefs] = useLocalStorage<UserPreferences>('hl-user-preferences', DEFAULT_PREFERENCES);
  
  // Local state for forms
  const [localGoals, setLocalGoals] = React.useState(goals);
  const [localPrefs, setLocalPrefs] = React.useState(prefs);

  const handleSave = () => {
    setGoals(localGoals);
    setPrefs(localPrefs);
    alert('Settings saved.');
  };

  const exportData = () => {
      const data = {
          history: localStorage.getItem('hl-history'),
          routines: localStorage.getItem('hl-routines'),
          nutrition: localStorage.getItem('hl-nutrition-logs'),
          mealPresets: localStorage.getItem('hl-meal-presets'),
          customExercises: localStorage.getItem('hl-custom-exercises'),
          goals: localStorage.getItem('hl-user-goals'),
          prefs: localStorage.getItem('hl-user-preferences')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypertrophy-lab-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right pb-32">
       <div className="flex items-center gap-4 mb-2 mt-2">
          {/* Back button hidden in tab view usually, but kept if accessed via modal logic in future */}
          <h1 className="text-2xl font-bold text-white">Settings</h1>
       </div>

       {/* Section 1: User Profile */}
       <div className="bg-surface p-4 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <User className="w-5 h-5 text-primary" />
             <h2 className="font-bold text-zinc-200">User Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-zinc-500 uppercase font-bold">Calories</label>
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
       </div>

       {/* Section 2: Training Preferences */}
       <div className="bg-surface p-4 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <Timer className="w-5 h-5 text-primary" />
             <h2 className="font-bold text-zinc-200">Training Preferences</h2>
          </div>
          
          <div>
              <label className="text-xs text-zinc-500 uppercase font-bold">Default Rest Timer</label>
              <select 
                value={localPrefs.defaultRestTimer}
                onChange={e => setLocalPrefs({...localPrefs, defaultRestTimer: Number(e.target.value)})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white mt-1"
              >
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                  <option value={120}>2 Minutes</option>
                  <option value={180}>3 Minutes</option>
              </select>
          </div>

          <div className="flex items-center justify-between p-1">
              <span className="text-sm text-zinc-300">Weight Unit</span>
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                  <button 
                    onClick={() => setLocalPrefs({...localPrefs, weightUnit: 'lbs'})}
                    className={`px-3 py-1 rounded text-xs font-bold ${localPrefs.weightUnit === 'lbs' ? 'bg-primary text-black' : 'text-zinc-500'}`}
                  >LBS</button>
                  <button 
                    onClick={() => setLocalPrefs({...localPrefs, weightUnit: 'kg'})}
                    className={`px-3 py-1 rounded text-xs font-bold ${localPrefs.weightUnit === 'kg' ? 'bg-primary text-black' : 'text-zinc-500'}`}
                  >KG</button>
              </div>
          </div>
          
           <div className="flex items-center justify-between p-1">
              <span className="text-sm text-zinc-300">Auto-Start Timer</span>
               <button 
                onClick={() => setLocalPrefs({...localPrefs, autoStartTimer: !localPrefs.autoStartTimer})}
                className={`w-10 h-6 rounded-full relative transition-colors ${localPrefs.autoStartTimer ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localPrefs.autoStartTimer ? 'left-5' : 'left-1'}`}></div>
              </button>
          </div>
       </div>

       {/* Section 3: Recovery Parameters */}
       <div className="bg-surface p-4 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <Shield className="w-5 h-5 text-primary" />
             <h2 className="font-bold text-zinc-200">Recovery Parameters</h2>
          </div>
          <div>
              <label className="text-xs text-zinc-500 uppercase font-bold flex justify-between">
                  <span>Min Recovery Hours</span>
                  <span className="text-primary">{localPrefs.minRecoveryHours}h</span>
              </label>
              <input 
                type="range" 
                min="24" 
                max="72" 
                step="12"
                value={localPrefs.minRecoveryHours}
                onChange={e => setLocalPrefs({...localPrefs, minRecoveryHours: Number(e.target.value)})}
                className="w-full mt-2 accent-primary"
              />
          </div>
       </div>

       <button 
            onClick={handleSave}
            className="w-full py-4 bg-zinc-100 hover:bg-white rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-colors"
        >
             <Save className="w-5 h-5" /> Save All Settings
        </button>

       {/* Section 4: Data Management */}
       <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 mt-8">
          <div className="flex items-center gap-2 mb-4">
             <Database className="w-5 h-5 text-zinc-500" />
             <h2 className="font-bold text-zinc-400">Data Management</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <button onClick={exportData} className="p-3 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex flex-col items-center gap-2 hover:bg-zinc-700">
                  <Download className="w-5 h-5" /> Export Data
              </button>
              <button className="p-3 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex flex-col items-center gap-2 hover:bg-zinc-700 opacity-50 cursor-not-allowed">
                  <Upload className="w-5 h-5" /> Import Data
              </button>
          </div>
          <button 
             onClick={onReset}
             className="w-full mt-4 py-3 border border-red-500/30 text-red-500 rounded-xl font-bold hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors text-sm"
          >
             <Trash2 className="w-4 h-4" /> Reset All Data
          </button>
       </div>
       
       <div className="text-center text-xs text-zinc-600 mt-8 pb-8">
          Hypertrophy Lab v1.2.0 • Made with Science 💪
       </div>
    </div>
  );
};

export default Settings;