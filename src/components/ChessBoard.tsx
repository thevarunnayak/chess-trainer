import React, { useState, useMemo } from 'react';
import { Chess, Move, Color, PieceSymbol, Square } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import { PieceSVG } from './Pieces';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChessBoardProps {
  game: Chess;
  isPlayerTurn: boolean;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  lastMove?: Move;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ game, isPlayerTurn, onMove, lastMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);
  const board = useMemo(() => game.board(), [game]);

  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare as Square, verbose: true });
  }, [game, selectedSquare]);

  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const move = validMoves.find(m => m.to === square);
    
    if (move) {
      const isPromotion = move.piece === 'p' && (square[1] === '8' || square[1] === '1');
      
      if (isPromotion) {
        setPromotionMove({ from: selectedSquare!, to: square });
      } else {
        onMove({ from: selectedSquare!, to: square });
        setSelectedSquare(null);
      }
    } else {
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square as Square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  const handlePromotionSelect = (pieceSymbol: string) => {
    if (promotionMove) {
      onMove({ ...promotionMove, promotion: pieceSymbol });
      setPromotionMove(null);
      setSelectedSquare(null);
    }
  };

  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="relative aspect-square w-full max-w-[600px] border-4 border-brand-border bg-brand-sidebar shadow-2xl rounded-sm overflow-hidden select-none">
      {/* Promotion Overlay */}
      <AnimatePresence>
        {promotionMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <div className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-2xl text-center">
              <h3 className="text-brand-text font-black uppercase tracking-widest mb-6">Promote Pawn</h3>
              <div className="flex gap-4">
                {['q', 'r', 'b', 'n'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromotionSelect(p)}
                    className="w-16 h-16 bg-white/5 hover:bg-brand-accent/20 border border-brand-border rounded-xl transition-all p-2"
                  >
                    <PieceSVG type={p} color={game.turn()} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {rows.map((row, i) =>
          cols.map((col, j) => {
            const square = `${col}${row}` as Square;
            const piece = game.get(square);
            const isDark = (i + j) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.some(m => m.to === square);
            const isCapture = isValidMove && game.get(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                className={cn(
                  'relative flex items-center justify-center cursor-pointer transition-colors duration-200',
                  isDark ? 'bg-chess-dark' : 'bg-chess-light',
                  isLastMove && 'bg-amber-400/40',
                  isSelected && 'bg-brand-accent/60'
                )}
              >
                {/* Coordinates */}
                {j === 0 && (
                  <span className={cn('absolute left-1 top-1 text-[10px] font-bold font-mono opacity-50', isDark ? 'text-brand-text' : 'text-brand-bg')}>
                    {row}
                  </span>
                )}
                {i === 7 && (
                  <span className={cn('absolute right-1 bottom-1 text-[10px] font-bold font-mono opacity-50', isDark ? 'text-brand-text' : 'text-brand-bg')}>
                    {col}
                  </span>
                )}

                {/* Move Hint */}
                {isValidMove && (
                  <div className={cn(
                    'absolute z-10 rounded-full',
                    isCapture ? 'w-full h-full border-4 border-black/10' : 'w-4 h-4 bg-black/10'
                  )} />
                )}

                {/* Piece */}
                <AnimatePresence mode="popLayout">
                  {piece && (
                    <motion.div
                      key={`${square}-${piece.type}-${piece.color}`}
                      layoutId={`${piece.color}-${piece.type}-${square}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="w-[90%] h-[90%] z-20 flex items-center justify-center pointer-events-none drop-shadow-lg"
                    >
                      <PieceSVG type={piece.type} color={piece.color} className="w-full h-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
