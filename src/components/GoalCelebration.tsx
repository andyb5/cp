'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CHEESY_MESSAGES, CELEBRATION_DURATION_MS } from '@/lib/constants';

interface GoalCelebrationProps {
  show: boolean;
  counterName: string;
  goal: number;
  color: string;
  onClose: () => void;
}

export default function GoalCelebration({ show, counterName, goal, color, onClose }: GoalCelebrationProps) {
  const [message] = useState(() => CHEESY_MESSAGES[Math.floor(Math.random() * CHEESY_MESSAGES.length)]);
  const hasLaunched = useRef(false);
  const [visible, setVisible] = useState(false);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (show && !hasLaunched.current) {
      hasLaunched.current = true;
      setVisible(true);

      const defaults = { startVelocity: 35, spread: 360, ticks: 120, zIndex: 9999 };

      // Wave 1: Side bursts
      confetti({ ...defaults, particleCount: 60, origin: { x: 0.15, y: 0.7 } });
      confetti({ ...defaults, particleCount: 60, origin: { x: 0.85, y: 0.7 } });

      // Wave 2: Center explosion with counter color
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { x: 0.5, y: 0.45 },
          startVelocity: 50,
          ticks: 150,
          zIndex: 9999,
          colors: [color, '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7'],
        });
      }, 250);

      // Wave 3: Gold stars
      setTimeout(() => {
        confetti({
          particleCount: 25,
          spread: 180,
          origin: { x: 0.5, y: 0.35 },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500', '#FFE066'],
          scalar: 1.8,
          ticks: 100,
          zIndex: 9999,
        });
      }, 500);

      // Wave 4: Gentle rain
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 200,
          origin: { x: 0.5, y: -0.1 },
          gravity: 0.6,
          ticks: 200,
          zIndex: 9999,
          colors: [color, '#FFD700'],
          scalar: 0.8,
        });
      }, 800);

      // Wave 5: Final flourish
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { x: 0.3, y: 0.5 },
          shapes: ['star'],
          colors: ['#FFD700'],
          scalar: 1.2,
          zIndex: 9999,
        });
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { x: 0.7, y: 0.5 },
          shapes: ['star'],
          colors: ['#FFD700'],
          scalar: 1.2,
          zIndex: 9999,
        });
      }, 1200);

      setTimeout(handleClose, CELEBRATION_DURATION_MS);
    }

    if (!show) {
      hasLaunched.current = false;
    }
  }, [show, color, handleClose]);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [visible, handleClose]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div
        className={`relative glass-card-elevated p-8 sm:p-10 text-center max-w-[340px] mx-4 ${
          visible ? 'animate-bounce-in' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect behind card */}
        <div
          className="absolute -inset-4 rounded-3xl blur-2xl opacity-20 -z-10"
          style={{ backgroundColor: color }}
        />

        <div className="text-6xl sm:text-7xl mb-3 animate-float">{message.emoji}</div>

        <h2 className="text-[26px] sm:text-[30px] font-bold mb-1 text-[var(--foreground)] leading-tight">
          {message.text}
        </h2>

        <p className="text-[var(--muted)] text-[16px] mb-1">
          <span className="font-semibold text-[var(--foreground)]">{counterName}</span>
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--success)' }}
          />
          <p className="text-[var(--success)] text-[18px] font-bold">
            Goal of {goal.toLocaleString()} reached!
          </p>
        </div>

        <button
          onClick={handleClose}
          className="btn-primary w-full text-[17px] py-3.5"
          style={{ backgroundColor: color }}
        >
          Keep Going!
        </button>
      </div>
    </div>
  );
}
