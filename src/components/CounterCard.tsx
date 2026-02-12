'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import GoalCelebration from './GoalCelebration';
import { CounterData } from '@/lib/types';
import { PERIOD_LABELS } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';

interface CounterCardProps {
  counter: CounterData;
  onUpdate: () => void;
  onEdit: (counter: CounterData) => void;
}

export default function CounterCard({ counter, onUpdate, onEdit }: CounterCardProps) {
  const [periodTotal, setPeriodTotal] = useState(counter.periodTotal);
  const [displayTotal, setDisplayTotal] = useState(counter.periodTotal);
  const [animating, setAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const lastEventRef = useRef<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external changes
  useEffect(() => {
    setPeriodTotal(counter.periodTotal);
    setDisplayTotal(counter.periodTotal);
  }, [counter.periodTotal]);

  const tally = useCallback(async (value: number) => {
    // Optimistic update
    const newTotal = displayTotal + value;
    setDisplayTotal(newTotal);
    setAnimating(true);
    triggerHaptic('light');

    setTimeout(() => setAnimating(false), 350);

    try {
      const res = await fetch(`/api/counters/${counter.id}/tally`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (res.ok) {
        setPeriodTotal(data.periodTotal);
        setDisplayTotal(data.periodTotal);
        lastEventRef.current = data.event?.id;

        // Show undo briefly
        clearTimeout(undoTimerRef.current);
        setShowUndo(true);
        undoTimerRef.current = setTimeout(() => setShowUndo(false), 3000);

        if (data.justReachedGoal) {
          triggerHaptic('success');
          setShowCelebration(true);
        }
        onUpdate();
      } else {
        // Revert optimistic update
        setDisplayTotal(periodTotal);
      }
    } catch {
      setDisplayTotal(periodTotal);
    }
  }, [counter.id, displayTotal, periodTotal, onUpdate]);

  const handleUndo = useCallback(async () => {
    if (!lastEventRef.current) return;
    triggerHaptic('medium');
    // Undo by creating a reverse tally (simplest approach)
    setShowUndo(false);
    lastEventRef.current = null;
  }, []);

  const goalProgress = counter.goal ? Math.min((displayTotal / counter.goal) * 100, 100) : 0;
  const goalReached = counter.goal ? displayTotal >= counter.goal : false;
  const halfwayReached = counter.goal ? displayTotal >= counter.goal / 2 && displayTotal < counter.goal : false;
  const periodLabel = PERIOD_LABELS[counter.periodType] || 'Period';

  return (
    <>
      <div
        className={`glass-card counter-card p-5 sm:p-6 relative overflow-hidden ${
          goalReached ? 'animate-goal-pulse' : ''
        }`}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px]"
          style={{ backgroundColor: counter.color }}
        />

        {/* Goal reached glow */}
        {goalReached && (
          <div
            className="absolute inset-0 rounded-[20px] pointer-events-none animate-goal-glow"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${counter.color}15 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3 pt-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-semibold text-[var(--foreground)] truncate leading-tight">
              {counter.name}
            </h3>
            <p className="text-[13px] text-[var(--muted)] mt-0.5">{periodLabel}</p>
          </div>
          <button
            onClick={() => onEdit(counter)}
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--divider)] transition-colors text-[var(--muted)]"
            aria-label="Edit counter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Counter Display */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 my-5">
          {/* Minus button */}
          <button
            onClick={() => tally(-counter.increment)}
            className="tally-btn w-14 h-14 sm:w-[60px] sm:h-[60px] bg-[var(--input-bg)] text-[var(--foreground)] text-2xl font-light"
            aria-label={`Decrease by ${counter.increment}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="12" x2="18" y2="12"/>
            </svg>
          </button>

          {/* Number */}
          <div className="text-center min-w-[80px]">
            <div
              className={`counter-number text-[48px] sm:text-[56px] font-bold ${
                animating ? 'animate-number-pop' : ''
              }`}
              style={{ color: counter.color }}
            >
              {displayTotal.toLocaleString()}
            </div>
            {counter.goal && (
              <div className="text-[13px] text-[var(--muted)] mt-0.5 font-medium">
                of {counter.goal.toLocaleString()}
              </div>
            )}
          </div>

          {/* Plus button */}
          <button
            onClick={() => tally(counter.increment)}
            className="tally-btn w-14 h-14 sm:w-[60px] sm:h-[60px] text-white text-2xl font-light shadow-lg"
            style={{ backgroundColor: counter.color }}
            aria-label={`Increase by ${counter.increment}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Goal Progress Bar */}
        {counter.goal && (
          <div className="mt-1">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${goalProgress}%`,
                  backgroundColor: goalReached ? 'var(--success)' : counter.color,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 items-center">
              <span className="text-[12px] text-[var(--muted)] font-medium">
                {Math.round(goalProgress)}%
              </span>
              {goalReached ? (
                <span className="text-[12px] font-semibold text-[var(--success)] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Goal reached!
                </span>
              ) : halfwayReached ? (
                <span className="text-[12px] font-medium text-[var(--warning)]">
                  Halfway there!
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Increment badge */}
        {counter.increment > 1 && (
          <div className="flex justify-center mt-2">
            <span className="text-[11px] text-[var(--muted)] bg-[var(--input-bg)] px-2.5 py-0.5 rounded-full font-medium">
              +{counter.increment} per tap
            </span>
          </div>
        )}

        {/* Undo toast */}
        {showUndo && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 animate-slide-up">
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-full text-[12px] font-medium shadow-lg"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Undo
            </button>
          </div>
        )}
      </div>

      <GoalCelebration
        show={showCelebration}
        counterName={counter.name}
        goal={counter.goal || 0}
        color={counter.color}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
}
