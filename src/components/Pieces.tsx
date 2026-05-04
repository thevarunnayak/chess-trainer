import React from 'react';

export const PieceSVG: React.FC<{
  type: string;
  color: string;
  className?: string;
}> = ({ type, color, className }) => {
  if (!type || !color) return null;

  const piece = type.toLowerCase();

  // Construct image path
  const src = `/pieces/${color}${piece}.png`;

  return (
    <img
      src={src}
      alt={`${color}-${piece}`}
      className={className}
      draggable={false}
    />
  );
};