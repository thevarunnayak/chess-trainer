import React from 'react';
import { motion } from 'motion/react';
import { GameMode, Difficulty, PlayerColor, TimeControl } from '../hooks/useChess';
import { Shield, Users, Zap, Brain, Target, Swords, Clock, Settings2 } from 'lucide-react';

interface GameSetupProps {
  onStart: (mode: GameMode, difficulty: Difficulty, playerColor: PlayerColor, timeControl: TimeControl | null) => void;
}

const PRESET_TIMES = [
  { label: '1m', initial: 1, inc: 0 },
  { label: '3m', initial: 3, inc: 0 },
  { label: '5m', initial: 5, inc: 0 },
  { label: '10m', initial: 10, inc: 0 },
  { label: '15m', initial: 15, inc: 0 },
];

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [mode, setMode] = React.useState<GameMode>('vs-computer');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = React.useState<PlayerColor>('w');
  const [useTimer, setUseTimer] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState(2); // 5m
  const [customTime, setCustomTime] = React.useState('10');
  const [customInc, setCustomInc] = React.useState('0');
  const [isCustom, setIsCustom] = React.useState(false);

  const handleStartGame = () => {
    let timeControl: TimeControl | null = null;
    if (useTimer) {
      if (isCustom) {
        timeControl = {
          initialMinutes: parseInt(customTime) || 10,
          incrementSeconds: parseInt(customInc) || 0,
        };
      } else {
        const p = PRESET_TIMES[selectedPreset];
        timeControl = { initialMinutes: p.initial, incrementSeconds: p.inc };
      }
    }
    onStart(mode, difficulty, playerColor, timeControl);
  };

  return (
    <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative scrollbar-thin">
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-brand-text italic tracking-tight mb-8">
          NEW <span className="text-brand-accent text-4xl">SESSION</span>
        </h2>

        {/* Mode Selection */}
        <div className="space-y-4 mb-8">
          <label className="text-xs font-bold text-brand-muted uppercase tracking-widest ml-1">Select Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('vs-computer')}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                mode === 'vs-computer' ? 'bg-brand-accent/10 border-brand-accent text-brand-text' : 'bg-white/5 border-transparent text-brand-muted hover:bg-white/10'
              }`}
            >
              <Brain className={mode === 'vs-computer' ? 'text-brand-accent' : 'text-brand-muted'} />
              <div className="text-left">
                <div className="font-bold text-sm">Vs Computer</div>
                <div className="text-[10px] uppercase tracking-tighter opacity-60">Practice against AI</div>
              </div>
            </button>
            <button
              onClick={() => setMode('local')}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                mode === 'local' ? 'bg-brand-accent/10 border-brand-accent text-brand-text' : 'bg-white/5 border-transparent text-brand-muted hover:bg-white/10'
              }`}
            >
              <Users className={mode === 'local' ? 'text-brand-accent' : 'text-brand-muted'} />
              <div className="text-left">
                <div className="font-bold text-sm">Offline (2P)</div>
                <div className="text-[10px] uppercase tracking-tighter opacity-60">Play locally</div>
              </div>
            </button>
          </div>
        </div>

        {/* Time Control */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between ml-1">
             <label className="text-xs font-bold text-brand-muted uppercase tracking-widest">Time Control</label>
             <button 
               onClick={() => setUseTimer(!useTimer)}
               className={`text-[10px] font-black uppercase px-2 py-1 rounded transition-all ${useTimer ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-brand-muted'}`}
             >
               {useTimer ? 'Timer On' : 'Timer Off'}
             </button>
          </div>
          
          {useTimer && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <div className="flex flex-wrap gap-2">
                 {PRESET_TIMES.map((p, i) => (
                   <button
                     key={p.label}
                     onClick={() => { setIsCustom(false); setSelectedPreset(i); }}
                     className={`flex-1 min-w-[60px] py-3 rounded-lg font-bold text-xs border-2 transition-all ${!isCustom && selectedPreset === i ? 'bg-brand-accent/20 border-brand-accent text-brand-text' : 'bg-white/5 border-transparent text-brand-muted hover:bg-white/10'}`}
                   >
                     {p.label}
                   </button>
                 ))}
                 <button
                    onClick={() => setIsCustom(true)}
                    className={`flex-1 min-w-[60px] py-3 rounded-lg font-bold text-xs border-2 transition-all ${isCustom ? 'bg-brand-accent/20 border-brand-accent text-brand-text' : 'bg-white/5 border-transparent text-brand-muted hover:bg-white/10'}`}
                 >
                    CUSTOM
                 </button>
               </div>

               {isCustom && (
                 <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                       <span className="text-[10px] text-brand-muted font-bold uppercase ml-1">Minutes per side</span>
                       <input 
                         type="number" 
                         value={customTime} 
                         onChange={(e) => setCustomTime(e.target.value)}
                         className="w-full bg-white/5 border border-brand-border p-3 rounded-lg font-mono text-sm focus:outline-none focus:border-brand-accent"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <span className="text-[10px] text-brand-muted font-bold uppercase ml-1">Increment (sec)</span>
                       <input 
                         type="number" 
                         value={customInc} 
                         onChange={(e) => setCustomInc(e.target.value)}
                         className="w-full bg-white/5 border border-brand-border p-3 rounded-lg font-mono text-sm focus:outline-none focus:border-brand-accent"
                       />
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </div>

        {/* Difficulty Selection */}
        {mode === 'vs-computer' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 mb-8"
          >
            <label className="text-xs font-bold text-brand-muted uppercase tracking-widest ml-1">AI Intensity</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'easy', icon: Zap, label: 'Easy' },
                { id: 'medium', icon: Target, label: 'Medium' },
                { id: 'hard', icon: Swords, label: 'Hard' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id as Difficulty)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs transition-all ${
                    difficulty === lvl.id ? 'bg-brand-accent text-brand-bg shadow-lg shadow-brand-accent/20' : 'bg-white/5 text-brand-muted hover:bg-white/10'
                  }`}
                >
                  <lvl.icon size={14} />
                  {lvl.label.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Side Selection */}
        <div className="space-y-4 mb-10">
          <label className="text-xs font-bold text-brand-muted uppercase tracking-widest ml-1">Choose Side</label>
          <div className="flex gap-4">
            {(['w', 'b'] as const).map((color) => (
              <button
                key={color}
                onClick={() => setPlayerColor(color)}
                className={`flex-1 flex items-center justify-center py-5 rounded-xl border-2 transition-all group ${
                  playerColor === color ? 'border-brand-accent bg-brand-accent/10' : 'border-transparent bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-inner ${color === 'w' ? 'bg-slate-100 text-slate-950' : 'bg-slate-900 text-slate-100'}`}>
                  <Shield size={20} />
                </div>
                <span className={`ml-4 font-black uppercase tracking-widest text-xs ${playerColor === color ? 'text-brand-text' : 'text-brand-muted'}`}>
                  {color === 'w' ? 'White' : 'Black'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full bg-brand-accent hover:bg-brand-accent/80 text-brand-bg font-black text-lg py-5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-accent/20 active:scale-95 group"
        >
          ENGAGE SESSION
          <Zap className="group-hover:fill-current" size={20} />
        </button>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Swords size={180} className="text-brand-text" />
      </div>
    </div>
  );
};
