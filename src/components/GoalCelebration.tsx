'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface GoalCelebrationProps {
  show: boolean;
  counterName: string;
  goal: number;
  onClose: () => void;
}

const CHEESY_MESSAGES = [
  "You're on FIRE! 🔥",
  "GOAL CRUSHED! 💪",
  "Unstoppable! 🚀",
  "Legend status! 👑",
  "You did THAT! ✨",
  "Absolute unit! 💯",
  "No cap, you slayed! 🎯",
  "Built different! 🏆",
  "Main character energy! 🌟",
  "Nailed it! 🎉",
];

export default function GoalCelebration({ show, counterName, goal, onClose }: GoalCelebrationProps) {
  const [message] = useState(() => CHEESY_MESSAGES[Math.floor(Math.random() * CHEESY_MESSAGES.length)]);
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (show && !hasLaunched.current) {
      hasLaunched.current = true;

      // Burst from both sides
      const defaults = { startVelocity: 30, spread: 360, ticks: 100, zIndex: 9999 };

      confetti({ ...defaults, particleCount: 80, origin: { x: 0.2, y: 0.6 } });
      confetti({ ...defaults, particleCount: 80, origin: { x: 0.8, y: 0.6 } });

      // Delayed center burst
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          startVelocity: 45,
          ticks: 120,
          zIndex: 9999,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        });
      }, 300);

      // Stars
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 160,
          origin: { x: 0.5, y: 0.3 },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500'],
          scalar: 1.5,
          ticks: 80,
          zIndex: 9999,
        });
      }, 600);

      // Auto close after 4 seconds
      setTimeout(onClose, 4000);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card p-8 sm:p-12 text-center max-w-sm mx-4 animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[var(--foreground)]">
          {message}
        </h2>
        <p className="text-[var(--muted)] text-lg mb-1">
          <span className="font-semibold text-[var(--foreground)]">{counterName}</span>
        </p>
        <p className="text-[var(--success)] text-xl font-bold mb-6">
          Goal of {goal} reached!
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          Keep Going!
        </button>
      </div>
    </div>
  );
}
