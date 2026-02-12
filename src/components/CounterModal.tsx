'use client';

import { useState, useEffect } from 'react';
import { COLORS, PERIOD_TYPES, WEEKDAYS, COUNTER_TEMPLATES } from '@/lib/constants';

interface CounterFormData {
  id?: string;
  name: string;
  color: string;
  goal: number | null;
  increment: number;
  periodType: string;
  periodStart: string;
}

interface CounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CounterFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: CounterFormData | null;
}

export default function CounterModal({ isOpen, onClose, onSave, onDelete, initialData }: CounterModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [goal, setGoal] = useState<string>('');
  const [increment, setIncrement] = useState<string>('1');
  const [periodType, setPeriodType] = useState('daily');
  const [periodStart, setPeriodStart] = useState('monday');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setGoal(initialData.goal?.toString() || '');
      setIncrement(initialData.increment.toString());
      setPeriodType(initialData.periodType);
      setPeriodStart(initialData.periodStart);
      setShowTemplates(false);
    } else {
      setName('');
      setColor('#007AFF');
      setGoal('');
      setIncrement('1');
      setPeriodType('daily');
      setPeriodStart('monday');
      setShowTemplates(true);
    }
    setShowDeleteConfirm(false);
    setError('');
  }, [initialData, isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    if (!name.trim()) { setError('Please enter a counter name'); return false; }
    if (goal && (parseInt(goal) <= 0 || isNaN(parseInt(goal)))) { setError('Goal must be a positive number'); return false; }
    if (parseInt(increment) <= 0 || isNaN(parseInt(increment))) { setError('Step must be a positive number'); return false; }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        color,
        goal: goal ? parseInt(goal) : null,
        increment: parseInt(increment) || 1,
        periodType,
        periodStart,
      });
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setError('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const applyTemplate = (template: typeof COUNTER_TEMPLATES[number]) => {
    setName(template.name);
    setColor(template.color);
    setGoal(template.goal.toString());
    setIncrement(template.increment.toString());
    setPeriodType(template.periodType);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="glass-card-elevated w-full sm:max-w-[420px] sm:mx-4 p-6 sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto no-scrollbar animate-slide-in-bottom sm:animate-bounce-in safe-area"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-bold text-[var(--foreground)]">
            {initialData ? 'Edit Counter' : 'New Counter'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--input-bg)] flex items-center justify-center hover:bg-[var(--divider)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[var(--danger-light)] text-[var(--danger)] px-4 py-2.5 rounded-xl text-[14px] font-medium mb-4 animate-slide-down">
            {error}
          </div>
        )}

        {/* Templates (only for new counters) */}
        {!initialData && showTemplates && (
          <div className="mb-5">
            <p className="text-[13px] font-medium text-[var(--muted)] mb-2">Quick start from template</p>
            <div className="flex flex-wrap gap-2">
              {COUNTER_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--divider)] transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
            <div className="border-b border-[var(--divider)] my-5" />
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Counter Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Push-ups, Glasses of Water"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-2">Color</label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`color-dot ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Period Type */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-2">Tracking Period</label>
            <div className="segment-control flex-wrap">
              {PERIOD_TYPES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodType(p.value)}
                  className={periodType === p.value ? 'active' : ''}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Start (weekly) */}
          {periodType === 'weekly' && (
            <div className="animate-slide-down">
              <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Week Starts On</label>
              <select value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}>
                {WEEKDAYS.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
              </select>
            </div>
          )}

          {/* Period Start (monthly) */}
          {periodType === 'monthly' && (
            <div className="animate-slide-down">
              <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Month Starts On Day</label>
              <select value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d.toString()}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Goal & Increment side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">
                Goal <span className="text-[var(--muted-2)]">(optional)</span>
              </label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., 100"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Step Amount</label>
              <input
                type="number"
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 space-y-2.5">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="btn-primary w-full text-[17px] py-3.5"
            style={{ backgroundColor: color }}
          >
            {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Counter'}
          </button>

          {initialData && onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 !py-3">
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 !py-3">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 text-[var(--danger)] text-[15px] font-medium hover:bg-[var(--danger-light)] rounded-xl transition-colors"
                >
                  Delete Counter
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
