import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  spread?: number;
  origin?: { x: number; y: number };
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#00DC82', // Pitch green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F97316', // Orange
  '#EC4899'  // Pink
];

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  spread = 45,
  origin = { x: 0.5, y: 0.5 },
  onComplete
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = [];
    const centerX = window.innerWidth * origin.x;
    const centerY = window.innerHeight * origin.y;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() - 0.5) * spread * (Math.PI / 180);
      const velocity = 10 + Math.random() * 15;
      const size = 8 + Math.random() * 8;

      newPieces.push({
        id: `confetti-${i}`,
        x: centerX,
        y: centerY,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        velocity: {
          x: Math.sin(angle) * velocity,
          y: Math.cos(angle) * velocity,
          rotation: (Math.random() - 0.5) * 720
        },
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as any
      });
    }

    setPieces(newPieces);

    // Clean up after duration
    const cleanup = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(cleanup);
  }, [active, duration, particleCount, colors, spread, origin, onComplete]);

  if (!active && pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <ConfettiPiece key={piece.id} piece={piece} duration={duration} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ConfettiPieceProps {
  piece: ConfettiPiece;
  duration: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ piece, duration }) => {
  const fallDistance = window.innerHeight + 100;
  const finalX = piece.x + piece.velocity.x * (duration / 100);
  const finalY = piece.y + fallDistance;
  const finalRotation = piece.rotation + piece.velocity.rotation * (duration / 1000);

  return (
    <motion.div
      initial={{
        x: piece.x,
        y: piece.y,
        rotate: piece.rotation,
        opacity: 1,
        scale: 1
      }}
      animate={{
        x: finalX,
        y: finalY,
        rotate: finalRotation,
        opacity: 0,
        scale: 0.5
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: duration / 1000,
        ease: [0.4, 0.0, 0.6, 1],
        opacity: { delay: (duration / 1000) * 0.7 }
      }}
      className="absolute"
      style={{
        width: piece.size,
        height: piece.size
      }}
    >
      <ConfettiShape shape={piece.shape} color={piece.color} />
    </motion.div>
  );
};

interface ConfettiShapeProps {
  shape: 'circle' | 'square' | 'triangle';
  color: string;
}

const ConfettiShape: React.FC<ConfettiShapeProps> = ({ shape, color }) => {
  switch (shape) {
    case 'circle':
      return (
        <div
          className="w-full h-full rounded-full shadow-lg"
          style={{ backgroundColor: color }}
        />
      );
    case 'square':
      return (
        <div
          className="w-full h-full shadow-lg"
          style={{ backgroundColor: color }}
        />
      );
    case 'triangle':
      return (
        <div
          className="w-full h-full shadow-lg"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            backgroundColor: color
          }}
        />
      );
    default:
      return null;
  }
};

// Preset confetti configurations
export const ConfettiPresets = {
  celebration: {
    duration: 4000,
    particleCount: 150,
    spread: 70,
    colors: ['#00DC82', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
  },
  goal: {
    duration: 3000,
    particleCount: 100,
    spread: 45,
    colors: ['#00DC82', '#10B981', '#34D399', '#6EE7B7']
  },
  teamGenerated: {
    duration: 2500,
    particleCount: 80,
    spread: 60,
    colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']
  },
  matchComplete: {
    duration: 3500,
    particleCount: 120,
    spread: 80,
    colors: ['#00DC82', '#F59E0B', '#EF4444', '#3B82F6']
  }
};