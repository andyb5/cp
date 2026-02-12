'use client';

import { useState, useEffect } from 'react';

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

const COLORS = [
  '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30',
  '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7',
  '#5AC8FA', '#64D2FF', '#A2845E', '#8E8E93',
];

const PERIOD_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'alltime', label: 'All Time' },
];

const WEEKDAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setGoal(initialData.goal?.toString() || '');
      setIncrement(initialData.increment.toString());
      setPeriodType(initialData.periodType);
      setPeriodStart(initialData.periodStart);
    } else {
      setName('');
      setColor('#007AFF');
      setGoal('');
      setIncrement('1');
      setPeriodType('daily');
      setPeriodStart('monday');
    }
    setShowDeleteConfirm(false);
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;
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
    } catch (err) {
      console.error('Save error:', err);
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
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="glass-card w-full sm:max-w-md sm:mx-4 p-6 sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up safe-area"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {initialData ? 'Edit Counter' : 'New Counter'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--divider)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Counter Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Push-ups, Glasses of Water"
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-[var(--accent)] scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Period Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Tracking Period</label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_TYPES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodType(p.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    periodType === p.value
                      ? 'text-white'
                      : 'bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--divider)]'
                  }`}
                  style={periodType === p.value ? { backgroundColor: color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Start (for weekly) */}
          {periodType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-2">Week Starts On</label>
              <select
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              >
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Period Start (for monthly) */}
          {periodType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-2">Month Starts On Day</label>
              <select
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d.toString()}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              Goal <span className="text-xs text-[var(--muted)]">(optional)</span>
            </label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., 100"
              min="1"
            />
          </div>

          {/* Increment */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Step Amount</label>
            <input
              type="number"
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="btn-primary w-full"
            style={{ backgroundColor: color }}
          >
            {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Counter'}
          </button>

          {initialData && onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 text-[var(--danger)] text-sm font-medium hover:bg-[var(--danger)]/10 rounded-xl transition-colors"
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
