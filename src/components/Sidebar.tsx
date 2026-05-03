import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move } from 'chess.js';
import { Clock } from 'lucide-react';
import { PieceSVG } from './Pieces';
import { TimeControl } from '../hooks/useChess';

interface GameSidebarProps {
  moveHistory: Move[];
  turn: 'w' | 'b';
  isCheck: boolean;
  isGameOver: boolean;
  capturedPieces: { type: string; color: string }[];
  onReset: () => void;
  onUndo: () => void;
  mode: string;
  whiteTime: number;
  blackTime: number;
  timeControl: TimeControl | null;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GameSidebar: React.FC<GameSidebarProps> = ({ 
  moveHistory, 
  turn, 
  isCheck, 
  isGameOver, 
  capturedPieces,
  onReset,
  onUndo,
  mode,
  whiteTime,
  blackTime,
  timeControl
}) => {
  const whiteCaptured = capturedPieces.filter(p => p.color === 'w');
  const blackCaptured = capturedPieces.filter(p => p.color === 'b');

  const aiLevel = mode.includes('-') ? mode.split('-')[1] : 'OFF';

  return (
    <div className="w-full lg:w-72 flex flex-col gap-5 select-none h-full">
      {/* Game Info Section */}
      <div className="bg-brand-card border border-brand-border rounded-lg p-4 shadow-lg shrink-0">
        <div className="text-[11px] uppercase font-bold text-brand-muted tracking-widest mb-4">Game Info</div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <div className="text-[10px] text-brand-muted font-bold uppercase">Mode</div>
                <div className="text-xs font-black text-brand-text truncate">{mode === 'vs-computer' ? 'Versus AI' : 'Local 2P'}</div>
             </div>
             <div className="space-y-1">
                <div className="text-[10px] text-brand-muted font-bold uppercase">Difficulty</div>
                <div className="text-xs font-black text-brand-accent">{aiLevel}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Engine Analysis (Conditional) */}
      <AnimatePresence>
        {isCheck && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-brand-card border border-red-500/30 rounded-lg p-4"
          >
            <div className="text-[11px] uppercase font-bold text-red-400 tracking-widest mb-1">Status</div>
            <div className="text-xl font-bold text-red-500 uppercase italic">Check</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Notation Section */}
      <div className="flex-1 min-h-0 bg-brand-sidebar border border-brand-border rounded-lg flex flex-col p-4">
          <div className="text-[11px] uppercase font-bold text-brand-muted tracking-widest mb-4">Move Notation</div>
          
          <div className="flex-1 overflow-y-auto font-mono text-[13px] pr-2 scrollbar-thin">
             {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                const isCurrentRow = i === Math.floor((moveHistory.length - 1) / 2);
                return (
                  <div key={i} className={`grid grid-cols-[30px_1fr_1fr] py-1 border-b border-brand-border/50 ${isCurrentRow ? 'bg-brand-accent/10' : ''}`}>
                    <span className="text-brand-muted">{i + 1}.</span>
                    <span className="text-brand-text font-bold tracking-tight">{moveHistory[i * 2]?.san}</span>
                    <span className="text-brand-muted italic">{moveHistory[i * 2 + 1]?.san || ''}</span>
                  </div>
                );
             })}
             {moveHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-8 italic text-xs">
                    Waiting for move...
                </div>
             )}
          </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={onUndo}
          className="bg-brand-accent hover:bg-brand-accent/80 text-brand-bg py-2.5 rounded font-bold text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGameOver}
        >
          Undo Move
        </button>
        {isGameOver ? (
          <button
            onClick={onReset}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded font-bold text-[13px] transition-all col-span-1 shadow-lg shadow-emerald-500/20"
          >
            New Game
          </button>
        ) : (
          <button
            onClick={onReset}
            className="bg-brand-card border border-brand-border hover:bg-slate-700 text-brand-text py-2.5 rounded font-bold text-[13px] transition-all"
          >
            Resign
          </button>
        )}
      </div>
    </div>
  );
};
