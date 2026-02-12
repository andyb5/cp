'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';

interface Counter {
  id: string;
  name: string;
  color: string;
  goal: number | null;
  periodType: string;
}

interface PeriodReport {
  label: string;
  start: string;
  end: string;
  total: number;
  isCurrent: boolean;
}

interface ReportData {
  counter: Counter;
  periods: PeriodReport[];
  allTimeTotal: number;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [counters, setCounters] = useState<Counter[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<string>('');
  const [periodsToShow, setPeriodsToShow] = useState(7);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/counters')
        .then((r) => r.json())
        .then((data) => {
          setCounters(data.counters);
          if (data.counters.length > 0 && !selectedCounter) {
            setSelectedCounter(data.counters[0].id);
          }
        });
    }
  }, [user, selectedCounter]);

  const fetchReport = useCallback(async () => {
    if (!selectedCounter) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/reports?counterId=${selectedCounter}&periods=${periodsToShow}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setLoadingReport(false);
    }
  }, [selectedCounter, periodsToShow]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxTotal = report ? Math.max(...report.periods.map((p) => p.total), 1) : 1;

  return (
    <div className="min-h-dvh">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 safe-area">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6">
          Reports
        </h1>

        {counters.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No counters to report on</h2>
            <p className="text-[var(--muted)] mb-6">Create some counters first, then come back here.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Controls */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">Counter</label>
                <select
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                >
                  {counters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">Periods to show</label>
                <div className="flex gap-2">
                  {[5, 7, 10, 14, 30].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPeriodsToShow(n)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        periodsToShow === n
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--divider)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Report */}
            {loadingReport ? (
              <div className="glass-card p-6 animate-pulse">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-[var(--divider)] rounded" />
                  ))}
                </div>
              </div>
            ) : report ? (
              <>
                {/* Summary */}
                <div className="glass-card p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-[var(--muted)]">Current Period</p>
                      <p className="text-3xl font-bold" style={{ color: report.counter.color }}>
                        {report.periods[0]?.total.toLocaleString() || 0}
                      </p>
                      {report.counter.goal && (
                        <p className="text-xs text-[var(--muted)]">Goal: {report.counter.goal}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[var(--muted)]">All Time</p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">
                        {report.allTimeTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="glass-card p-5">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">History</h3>
                  <div className="space-y-3">
                    {report.periods.map((period, idx) => (
                      <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${period.isCurrent ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                            {period.label}
                            {period.isCurrent && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                                Current
                              </span>
                            )}
                          </span>
                          <span className={`text-sm font-medium ${period.isCurrent ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                            {period.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${(period.total / maxTotal) * 100}%`,
                              backgroundColor: report.counter.color,
                              opacity: period.isCurrent ? 1 : 0.6,
                            }}
                          />
                        </div>
                        {report.counter.goal && period.total >= report.counter.goal && (
                          <p className="text-xs text-[var(--success)] mt-0.5 font-medium">Goal reached!</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
