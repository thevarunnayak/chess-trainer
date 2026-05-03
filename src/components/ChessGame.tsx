import React, { useState, useEffect } from 'react';
import { useChess, GameMode, Difficulty, PlayerColor, TimeControl } from '../hooks/useChess';
import { ChessBoard } from './ChessBoard';
import { GameSidebar } from './Sidebar';
import { GameSetup } from './GameSetup';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Share2, RefreshCw, Trophy, Clock, User, Bot } from 'lucide-react';
import { PieceSVG } from './Pieces';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ClockDisplay: React.FC<{ time: number; isActive: boolean; hasTimer: boolean }> = ({ time, isActive, hasTimer }) => {
    if (!hasTimer) return null;
    const isLowTime = time < 30;
    return (
        <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xl font-black transition-all
            ${isActive ? 'bg-brand-accent text-brand-bg scale-105 shadow-xl shadow-brand-accent/20' : 'bg-white/5 text-brand-muted'}
            ${isActive && isLowTime ? 'animate-pulse bg-red-500 text-white' : ''}
        `}>
            <Clock size={16} className={isActive ? 'animate-spin-slow' : ''} />
            {formatTime(time)}
        </div>
    );
};

const PlayerBar: React.FC<{ 
    name: string; 
    isAI?: boolean; 
    isActive: boolean; 
    time: number; 
    hasTimer: boolean;
    captured: { type: string; color: string }[];
    align?: 'top' | 'bottom';
}> = ({ name, isAI, isActive, time, hasTimer, captured, align = 'bottom' }) => {
    return (
        <div className={`flex items-center justify-between w-full p-3 rounded-xl bg-brand-card/50 border ${isActive ? 'border-brand-accent/30 shadow-lg shadow-brand-accent/5' : 'border-brand-border/50'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-accent text-brand-bg' : 'bg-brand-border text-brand-muted'}`}>
                    {isAI ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight">{name}</span>
                    <div className="flex items-center gap-0.5 mt-0.5 opacity-60">
                        {captured.slice(0, 10).map((p, i) => (
                            <div key={i} className="w-4 h-4"><PieceSVG type={p.type} color={p.color} /></div>
                        ))}
                    </div>
                </div>
            </div>
            <ClockDisplay time={time} isActive={isActive} hasTimer={hasTimer} />
        </div>
    );
};

export const ChessGameContainer: React.FC = () => {
    const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
    const [config, setConfig] = useState<{ 
        mode: GameMode, 
        difficulty: Difficulty, 
        playerColor: PlayerColor,
        timeControl: TimeControl | null
    }>({
        mode: 'vs-computer',
        difficulty: 'medium',
        playerColor: 'w',
        timeControl: null
    });

    const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

    const {
        game,
        isPlayerTurn,
        makeMove,
        undoMove,
        resetGame,
        moveHistory,
        isCheck,
        isGameOver,
        turn,
        capturedPieces,
        whiteTime,
        blackTime
    } = useChess({
        mode: config.mode,
        difficulty: config.difficulty,
        playerColor: config.playerColor,
        timeControl: config.timeControl,
        onGameOver: (winner, reason) => {
            if (winner && !hasFiredConfetti) {
                setHasFiredConfetti(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#ffffff']
                });
            }
        }
    });

    const handleStart = (mode: GameMode, difficulty: Difficulty, playerColor: PlayerColor, timeControl: TimeControl | null) => {
        setHasFiredConfetti(false);
        setConfig({ mode, difficulty, playerColor, timeControl });
        resetGame();
        setGameState('playing');
    };

    const handleReset = () => {
        if (isGameOver || confirm('Are you sure you want to resign and return to menu?')) {
            setHasFiredConfetti(false);
            setGameState('setup');
            resetGame();
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
            {/* Professional Header */}
            <header className="h-[60px] bg-brand-header border-b border-brand-border flex items-center justify-between px-6 shrink-0 shadow-md">
                <div className="flex items-center gap-2 text-brand-accent font-black text-xl tracking-tighter">
                    <span className="text-2xl">♜</span> CHESS TRAINER
                </div>
                <div className="flex items-center gap-6">
                    <span className="hidden sm:block text-brand-muted text-xs font-bold uppercase tracking-widest">
                        Session: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                        {game.isGameOver() ? 'Game Over' : 'Game In Progress'}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {gameState === 'setup' ? (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        >
                            <GameSetup onStart={handleStart} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col lg:flex-row lg:items-center lg:justify-center gap-0 lg:gap-12 overflow-hidden bg-brand-bg px-4 lg:px-8 py-4"
                        >
                            {/* Main Board Container */}
                            <main className="flex-none w-full max-w-[550px] flex flex-col gap-4 relative">
                                <PlayerBar 
                                    name={config.mode === 'vs-computer' ? 'STOCKFISH 16' : 'PLAYER 2'}
                                    isAI={config.mode === 'vs-computer'}
                                    isActive={turn === 'b' && !isGameOver}
                                    time={blackTime}
                                    hasTimer={!!config.timeControl}
                                    captured={capturedPieces.filter(p => p.color === 'w')}
                                    align="top"
                                />

                                <div className="relative group/board w-full aspect-square">
                                    <div className="absolute inset-0">
                                        <ChessBoard 
                                            game={game} 
                                            isPlayerTurn={isPlayerTurn} 
                                            onMove={(m) => makeMove(m)} 
                                            lastMove={moveHistory[moveHistory.length - 1]}
                                        />
                                    </div>
                                    
                                    {isGameOver && (
                                        <motion.div 
                                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                                            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                                            className="absolute inset-0 z-50 flex items-center justify-center bg-brand-bg/60 rounded-lg overflow-hidden border-2 border-brand-accent/20"
                                        >
                                            <div className="text-center p-10 bg-brand-card/90 border border-brand-accent/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] relative max-w-[320px]">
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center shadow-xl shadow-brand-accent/40">
                                                    <Trophy className="w-12 h-12 text-brand-bg" />
                                                </div>
                                                <h3 className="text-3xl font-black text-brand-text mb-2 italic mt-8">SESSION OVER</h3>
                                                <p className="text-brand-accent font-black uppercase tracking-[0.2em] text-sm mb-8">
                                                    {game.isCheckmate() ? 'CHECKMATE' : 
                                                     game.isDraw() ? 'DRAW' : 'TIME OUT'}
                                                </p>
                                                <button 
                                                    onClick={handleReset}
                                                    className="w-full bg-brand-accent text-brand-bg py-4 rounded-xl font-black uppercase tracking-widest hover:bg-brand-accent/80 transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
                                                >
                                                    NEW SESSION
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <PlayerBar 
                                    name="PLAYER 1"
                                    isActive={turn === 'w' && !isGameOver}
                                    time={whiteTime}
                                    hasTimer={!!config.timeControl}
                                    captured={capturedPieces.filter(p => p.color === 'b')}
                                    align="bottom"
                                />
                                
                                {/* Mobile/Tablet Controls */}
                                <div className="lg:hidden w-full mb-8">
                                    <GameSidebar 
                                        moveHistory={moveHistory}
                                        turn={turn}
                                        isCheck={isCheck}
                                        isGameOver={isGameOver}
                                        capturedPieces={capturedPieces}
                                        onReset={handleReset}
                                        onUndo={undoMove}
                                        mode={config.mode}
                                        whiteTime={whiteTime}
                                        blackTime={blackTime}
                                        timeControl={config.timeControl}
                                    />
                                </div>
                            </main>

                            {/* Right Sidebar (Desktop Only) */}
                            <div className="hidden lg:flex w-80 h-[calc(100vh-160px)] max-h-[700px] bg-brand-card/50 border border-brand-border p-5 rounded-2xl overflow-y-auto shrink-0 shadow-2xl">
                                <GameSidebar 
                                    moveHistory={moveHistory}
                                    turn={turn}
                                    isCheck={isCheck}
                                    isGameOver={isGameOver}
                                    capturedPieces={capturedPieces}
                                    onReset={handleReset}
                                    onUndo={undoMove}
                                    mode={config.mode}
                                    whiteTime={whiteTime}
                                    blackTime={blackTime}
                                    timeControl={config.timeControl}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
