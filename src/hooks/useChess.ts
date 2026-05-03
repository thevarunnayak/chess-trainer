import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { getRandomMove, getMediumMove, getHardMove } from '../lib/chess/ai';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'vs-computer' | 'local';
export type PlayerColor = 'w' | 'b';

export interface TimeControl {
  initialMinutes: number;
  incrementSeconds: number;
}

interface UseChessProps {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  timeControl: TimeControl | null;
  onGameOver?: (winner: string | null, reason?: string) => void;
  onMove?: (move: Move) => void;
}

export function useChess({ mode, difficulty, playerColor, timeControl, onGameOver, onMove }: UseChessProps) {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [whiteTime, setWhiteTime] = useState(timeControl ? timeControl.initialMinutes * 60 : 0);
  const [blackTime, setBlackTime] = useState(timeControl ? timeControl.initialMinutes * 60 : 0);
  const [isPaused, setIsPaused] = useState(false);

  const isPlayerTurn = useMemo(() => {
    if (mode === 'local') return true;
    return game.turn() === playerColor;
  }, [game, mode, playerColor]);

  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const [timeoutHandled, setTimeoutHandled] = useState(false);
  const gameOverCalledRef = useRef(false);

  // Sync timers when timeControl changes (e.g. starting a new game)
  useEffect(() => {
    if (timeControl) {
      setWhiteTime(timeControl.initialMinutes * 60);
      setBlackTime(timeControl.initialMinutes * 60);
      setTimeoutHandled(false);
      gameOverCalledRef.current = false;
    }
  }, [timeControl]);

  // Timer Ticking
  useEffect(() => {
    if (!timeControl || game.isGameOver() || isPaused || timeoutHandled || gameOverCalledRef.current) return;

    const interval = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime(t => {
          if (t <= 1) {
            if (!gameOverCalledRef.current) {
               gameOverCalledRef.current = true;
               setTimeoutHandled(true);
               onGameOverRef.current?.('Black', 'Time Out');
            }
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) {
            if (!gameOverCalledRef.current) {
               gameOverCalledRef.current = true;
               setTimeoutHandled(true);
               onGameOverRef.current?.('White', 'Time Out');
            }
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, timeControl, isPaused, timeoutHandled]);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      if (timeoutHandled) return null;
      const turnBefore = game.turn();
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(h => [...h, result]);
        onMove?.(result);

        // Handle Increment
        if (timeControl && timeControl.incrementSeconds > 0) {
          if (turnBefore === 'w') {
            setWhiteTime(t => t + timeControl.incrementSeconds);
          } else {
            setBlackTime(t => t + timeControl.incrementSeconds);
          }
        }
        
        if (game.isGameOver()) {
          if (!gameOverCalledRef.current) {
            gameOverCalledRef.current = true;
            const winner = game.isCheckmate() ? (game.turn() === 'w' ? 'Black' : 'White') : null;
            onGameOverRef.current?.(winner);
          }
        }
        return result;
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [game, onMove, timeControl]);

  const undoMove = useCallback(() => {
    game.undo();
    if (mode === 'vs-computer') game.undo(); 
    setGame(new Chess(game.fen()));
    setMoveHistory(h => h.slice(0, mode === 'vs-computer' ? -2 : -1));
  }, [game, mode]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setTimeoutHandled(false);
    gameOverCalledRef.current = false;
    if (timeControl) {
      setWhiteTime(timeControl.initialMinutes * 60);
      setBlackTime(timeControl.initialMinutes * 60);
    }
  }, [timeControl]);

  // AI Move logic
  useEffect(() => {
    if (mode === 'vs-computer' && !isPlayerTurn && !game.isGameOver() && !isPaused) {
      const timer = setTimeout(() => {
        let aiMove: string | null = null;
        if (difficulty === 'easy') aiMove = getRandomMove(game);
        else if (difficulty === 'medium') aiMove = getMediumMove(game);
        else aiMove = getHardMove(game);

        if (aiMove) {
          makeMove(aiMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game, mode, difficulty, isPlayerTurn, makeMove, isPaused]);

  return {
    game,
    fen: game.fen(),
    isPlayerTurn,
    makeMove,
    undoMove,
    resetGame,
    moveHistory,
    whiteTime,
    blackTime,
    setIsPaused,
    isCheck: game.inCheck(),
    isGameOver: game.isGameOver() || timeoutHandled,
    turn: game.turn(),
    capturedPieces: moveHistory
      .filter(m => m.captured)
      .map(m => ({ type: m.captured!, color: m.color === 'w' ? 'b' : 'w' })),
  };
}
