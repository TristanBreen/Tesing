import React, { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RefreshCw } from 'lucide-react';

interface RestTimerProps {
  lastCompleted: number | null; // Timestamp of last completed set
  defaultDuration?: number; // Seconds
}

const RestTimer: React.FC<RestTimerProps> = ({ lastCompleted, defaultDuration = 90 }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (lastCompleted) {
      setSeconds(defaultDuration);
      setIsActive(true);
      setIsMinimized(false);
    }
  }, [lastCompleted, defaultDuration]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
      setSeconds(defaultDuration);
      setIsActive(true);
  }
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isActive && seconds === 0) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 bg-surface border border-zinc-800 p-3 rounded-full shadow-lg flex items-center justify-center animate-pulse"
      >
        <Timer className="w-6 h-6 text-primary" />
        <span className="ml-2 font-mono text-primary font-bold">{formatTime(seconds)}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-64 bg-surface border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-zinc-900/50 p-3 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rest Timer</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className="text-4xl font-mono font-bold text-primary mb-4 tabular-nums">
          {formatTime(seconds)}
        </div>
        <div className="flex gap-4">
            <button onClick={toggleTimer} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white">
                {isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
            </button>
             <button onClick={() => setSeconds((s) => s + 30)} className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-sm font-medium">
                +30s
            </button>
            <button onClick={resetTimer} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400">
                <RefreshCw className="w-5 h-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;