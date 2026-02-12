'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import CounterCard from '@/components/CounterCard';
import CounterModal from '@/components/CounterModal';
import FullscreenButton from '@/components/FullscreenButton';
import { CounterData } from '@/lib/types';
import { POLL_INTERVAL_MS } from '@/lib/constants';
import { requestWakeLock } from '@/lib/haptics';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [loadingCounters, setLoadingCounters] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCounter, setEditingCounter] = useState<CounterData | null>(null);

  const fetchCounters = useCallback(async () => {
    try {
      const res = await fetch('/api/counters');
      if (res.ok) {
        const data = await res.json();
        setCounters(data.counters);
      }
    } catch (err) {
      console.error('Failed to fetch counters:', err);
    } finally {
      setLoadingCounters(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCounters();
      const interval = setInterval(fetchCounters, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [user, fetchCounters]);

  // Wake lock to keep screen on
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    requestWakeLock().then(wl => { wakeLock = wl; });
    return () => { wakeLock?.release(); };
  }, []);

  // Keyboard shortcut: N to create new counter
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setEditingCounter(null);
        setShowModal(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSave = async (data: { id?: string; name: string; color: string; goal: number | null; increment: number; periodType: string; periodStart: string }) => {
    if (data.id) {
      await fetch(`/api/counters/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/counters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    fetchCounters();
  };

  const handleDelete = async () => {
    if (!editingCounter) return;
    await fetch(`/api/counters/${editingCounter.id}`, { method: 'DELETE' });
    fetchCounters();
  };

  const handleEdit = (counter: CounterData) => {
    setEditingCounter(counter);
    setShowModal(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh fullscreen-container">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 safe-area">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[var(--foreground)] leading-tight">
              My Counters
            </h1>
            <p className="text-[13px] text-[var(--muted)] mt-0.5">
              {counters.length === 0 ? 'Create your first counter to get started' : `${counters.length} counter${counters.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FullscreenButton />
            <button
              onClick={() => { setEditingCounter(null); setShowModal(true); }}
              className="btn-primary !py-2 !px-4 !text-[14px] !rounded-xl"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </button>
          </div>
        </div>

        {/* Counter grid */}
        {loadingCounters ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 h-[220px]">
                <div className="skeleton h-4 w-1/2 mb-4" />
                <div className="skeleton h-3 w-1/4 mb-8" />
                <div className="skeleton h-14 w-1/3 mx-auto mb-6" />
                <div className="skeleton h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : counters.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-[64px] mb-4 animate-float">🎯</div>
            <h2 className="text-[22px] font-bold text-[var(--foreground)] mb-2">No counters yet</h2>
            <p className="text-[15px] text-[var(--muted)] mb-8 max-w-xs mx-auto">
              Create your first counter and start tracking what matters to you.
            </p>
            <button
              onClick={() => { setEditingCounter(null); setShowModal(true); }}
              className="btn-primary text-[17px] py-3.5 px-8"
            >
              Create Your First Counter
            </button>
            <p className="text-[12px] text-[var(--muted-2)] mt-4">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--input-bg)] text-[var(--muted)] font-mono text-[11px]">N</kbd> to create quickly
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((counter, idx) => (
              <div
                key={counter.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CounterCard
                  counter={counter}
                  onUpdate={fetchCounters}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <CounterModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingCounter(null); }}
        onSave={handleSave}
        onDelete={editingCounter ? handleDelete : undefined}
        initialData={editingCounter}
      />
    </div>
  );
}
