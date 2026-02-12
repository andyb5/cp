'use client';

import { useState, useCallback } from 'react';
import GoalCelebration from './GoalCelebration';
import { CounterData } from '@/lib/types';

interface CounterCardProps {
  counter: CounterData;
  onUpdate: () => void;
  onEdit: (counter: CounterData) => void;
}

export default function CounterCard({ counter, onUpdate, onEdit }: CounterCardProps) {
  const [periodTotal, setPeriodTotal] = useState(counter.periodTotal);
  const [animating, setAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPressed, setIsPressed] = useState<'plus' | 'minus' | null>(null);

  const tally = useCallback(async (value: number) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const res = await fetch(`/api/counters/${counter.id}/tally`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (res.ok) {
        setPeriodTotal(data.periodTotal);
        if (data.justReachedGoal) {
          setShowCelebration(true);
        }
        onUpdate();
      }
    } catch (err) {
      console.error('Tally error:', err);
    }
  }, [counter.id, onUpdate]);

  const goalProgress = counter.goal ? Math.min((periodTotal / counter.goal) * 100, 100) : 0;
  const goalReached = counter.goal ? periodTotal >= counter.goal : false;

  const periodLabel = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
    alltime: 'All Time',
  }[counter.periodType] || 'Period';

  return (
    <>
      <div
        className={`glass-card p-5 sm:p-6 transition-all duration-200 ${
          goalReached ? 'animate-goal-pulse ring-2 ring-[var(--success)]' : ''
        }`}
        style={{ borderTop: `3px solid ${counter.color}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
              {counter.name}
            </h3>
            <p className="text-sm text-[var(--muted)]">{periodLabel}</p>
          </div>
          <button
            onClick={() => onEdit(counter)}
            className="ml-2 p-2 rounded-full hover:bg-[var(--divider)] transition-colors text-[var(--muted)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>

        {/* Counter Display */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 my-6">
          <button
            onPointerDown={() => setIsPressed('minus')}
            onPointerUp={() => setIsPressed(null)}
            onPointerLeave={() => setIsPressed(null)}
            onClick={() => tally(-counter.increment)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl font-medium transition-all
              bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)]
              hover:bg-[var(--divider)] active:scale-90
              ${isPressed === 'minus' ? 'scale-90 bg-[var(--divider)]' : ''}`}
          >
            −
          </button>

          <div className={`text-center ${animating ? 'animate-scale-up' : ''}`}>
            <div
              className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight"
              style={{ color: counter.color }}
            >
              {periodTotal.toLocaleString()}
            </div>
            {counter.goal && (
              <div className="text-sm text-[var(--muted)] mt-1">
                of {counter.goal.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onPointerDown={() => setIsPressed('plus')}
            onPointerUp={() => setIsPressed(null)}
            onPointerLeave={() => setIsPressed(null)}
            onClick={() => tally(counter.increment)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl font-medium transition-all
              text-white shadow-lg active:scale-90
              ${isPressed === 'plus' ? 'scale-90' : ''}`}
            style={{ backgroundColor: counter.color }}
          >
            +
          </button>
        </div>

        {/* Goal Progress Bar */}
        {counter.goal && (
          <div className="mt-2">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${goalProgress}%`,
                  backgroundColor: goalReached ? 'var(--success)' : counter.color,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[var(--muted)]">
                {Math.round(goalProgress)}%
              </span>
              {goalReached && (
                <span className="text-xs font-medium text-[var(--success)]">
                  Goal reached!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Increment info */}
        {counter.increment > 1 && (
          <p className="text-xs text-[var(--muted)] text-center mt-2">
            Step: {counter.increment}
          </p>
        )}
      </div>

      <GoalCelebration
        show={showCelebration}
        counterName={counter.name}
        goal={counter.goal || 0}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
}
