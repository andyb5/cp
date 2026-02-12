'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import { PERIOD_LABELS } from '@/lib/constants';

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

  // Compute stats
  const stats = useMemo(() => {
    if (!report || report.periods.length === 0) return null;

    const totals = report.periods.map((p) => p.total);
    const nonCurrentTotals = report.periods.filter((p) => !p.isCurrent).map((p) => p.total);
    const average = nonCurrentTotals.length > 0
      ? nonCurrentTotals.reduce((sum, t) => sum + t, 0) / nonCurrentTotals.length
      : 0;
    const best = Math.max(...totals);
    const currentTotal = report.periods.find((p) => p.isCurrent)?.total ?? 0;
    const previousTotal = nonCurrentTotals[0] ?? 0;

    let trendPercent = 0;
    let trendDirection: 'up' | 'down' | 'flat' = 'flat';
    if (previousTotal > 0) {
      trendPercent = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
      trendDirection = trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'flat';
    } else if (currentTotal > 0) {
      trendDirection = 'up';
      trendPercent = 100;
    }

    const goalsReached = report.counter.goal
      ? totals.filter((t) => t >= report.counter.goal!).length
      : 0;

    const streak = (() => {
      let count = 0;
      for (const p of report.periods) {
        if (p.total > 0) count++;
        else break;
      }
      return count;
    })();

    return { average, best, currentTotal, previousTotal, trendPercent, trendDirection, goalsReached, streak };
  }, [report]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxTotal = report ? Math.max(...report.periods.map((p) => p.total), 1) : 1;
  const periodLabel = report ? PERIOD_LABELS[report.counter.periodType] || 'Period' : 'Period';

  return (
    <div className="min-h-dvh fullscreen-container">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 safe-area">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[var(--foreground)] leading-tight">
              Reports
            </h1>
            <p className="text-[13px] text-[var(--muted)] mt-0.5">
              Track your progress over time
            </p>
          </div>
        </div>

        {counters.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-[64px] mb-4 animate-float">📊</div>
            <h2 className="text-[22px] font-bold text-[var(--foreground)] mb-2">No counters to report on</h2>
            <p className="text-[15px] text-[var(--muted)] mb-8 max-w-xs mx-auto">
              Create some counters first, then come back to see your trends.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary text-[17px] py-3.5 px-8">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Controls */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--muted)] mb-2">Counter</label>
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
                <label className="block text-[13px] font-medium text-[var(--muted)] mb-2">Periods to show</label>
                <div className="segment-control">
                  {[5, 7, 14, 30].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPeriodsToShow(n)}
                      className={periodsToShow === n ? 'active' : ''}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Content */}
            {loadingReport ? (
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center">
                        <div className="skeleton h-3 w-16 mx-auto mb-2" />
                        <div className="skeleton h-8 w-20 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-5">
                  <div className="skeleton h-4 w-24 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}>
                        <div className="skeleton h-3 w-full mb-1.5" />
                        <div className="skeleton h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : report && stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Current Period */}
                  <div className="glass-card p-4 text-center">
                    <p className="text-[12px] font-medium text-[var(--muted)] mb-1">{periodLabel}</p>
                    <p className="text-[28px] font-bold leading-tight" style={{ color: report.counter.color }}>
                      {stats.currentTotal.toLocaleString()}
                    </p>
                    {stats.trendDirection !== 'flat' && (
                      <div className={`flex items-center justify-center gap-1 mt-1 text-[12px] font-medium ${
                        stats.trendDirection === 'up' ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                      }`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {stats.trendDirection === 'up' ? (
                            <polyline points="18 15 12 9 6 15" />
                          ) : (
                            <polyline points="6 9 12 15 18 9" />
                          )}
                        </svg>
                        {Math.abs(stats.trendPercent)}%
                      </div>
                    )}
                  </div>

                  {/* Average */}
                  <div className="glass-card p-4 text-center">
                    <p className="text-[12px] font-medium text-[var(--muted)] mb-1">Average</p>
                    <p className="text-[28px] font-bold text-[var(--foreground)] leading-tight">
                      {Math.round(stats.average).toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--muted)] mt-1">per period</p>
                  </div>

                  {/* Best Period */}
                  <div className="glass-card p-4 text-center">
                    <p className="text-[12px] font-medium text-[var(--muted)] mb-1">Best</p>
                    <p className="text-[28px] font-bold text-[var(--foreground)] leading-tight">
                      {stats.best.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--muted)] mt-1">personal best</p>
                  </div>

                  {/* All Time or Streak */}
                  <div className="glass-card p-4 text-center">
                    {report.counter.goal ? (
                      <>
                        <p className="text-[12px] font-medium text-[var(--muted)] mb-1">Goals Hit</p>
                        <p className="text-[28px] font-bold text-[var(--success)] leading-tight">
                          {stats.goalsReached}
                        </p>
                        <p className="text-[12px] text-[var(--muted)] mt-1">of {report.periods.length}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[12px] font-medium text-[var(--muted)] mb-1">All Time</p>
                        <p className="text-[28px] font-bold text-[var(--foreground)] leading-tight">
                          {report.allTimeTotal.toLocaleString()}
                        </p>
                        <p className="text-[12px] text-[var(--muted)] mt-1">total</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Goal progress for current period */}
                {report.counter.goal && (
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-[var(--foreground)]">
                        {periodLabel} Goal Progress
                      </h3>
                      <span className="text-[13px] font-medium" style={{ color: report.counter.color }}>
                        {stats.currentTotal} / {report.counter.goal}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '10px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min((stats.currentTotal / report.counter.goal) * 100, 100)}%`,
                          backgroundColor: report.counter.color,
                        }}
                      />
                    </div>
                    <p className="text-[12px] text-[var(--muted)] mt-2">
                      {stats.currentTotal >= report.counter.goal
                        ? 'Goal reached! Keep it up!'
                        : `${report.counter.goal - stats.currentTotal} more to reach your goal`}
                    </p>
                  </div>
                )}

                {/* Streak indicator */}
                {stats.streak > 1 && (
                  <div className="glass-card p-4 flex items-center gap-3">
                    <span className="text-[28px]">🔥</span>
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--foreground)]">
                        {stats.streak} period streak!
                      </p>
                      <p className="text-[12px] text-[var(--muted)]">
                        You&apos;ve been active for {stats.streak} consecutive periods
                      </p>
                    </div>
                  </div>
                )}

                {/* Bar chart */}
                <div className="glass-card p-5">
                  <h3 className="text-[16px] font-semibold text-[var(--foreground)] mb-4">History</h3>
                  <div className="space-y-2.5">
                    {report.periods.map((period, idx) => {
                      const pct = (period.total / maxTotal) * 100;
                      const goalPct = report.counter.goal ? (report.counter.goal / maxTotal) * 100 : null;
                      const isGoalReached = report.counter.goal ? period.total >= report.counter.goal : false;

                      return (
                        <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[13px] ${period.isCurrent ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                              {period.label}
                              {period.isCurrent && (
                                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: `${report.counter.color}15`,
                                    color: report.counter.color,
                                  }}
                                >
                                  Current
                                </span>
                              )}
                            </span>
                            <span className={`text-[13px] font-semibold tabular-nums ${
                              isGoalReached ? 'text-[var(--success)]' : period.isCurrent ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'
                            }`}>
                              {period.total.toLocaleString()}
                              {isGoalReached && ' ✓'}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="progress-bar">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: report.counter.color,
                                  opacity: period.isCurrent ? 1 : 0.55,
                                }}
                              />
                            </div>
                            {goalPct && goalPct <= 100 && (
                              <div
                                className="absolute top-0 bottom-0 w-px"
                                style={{
                                  left: `${goalPct}%`,
                                  backgroundColor: 'var(--foreground)',
                                  opacity: 0.3,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Time total */}
                <div className="glass-card p-5 text-center">
                  <p className="text-[13px] font-medium text-[var(--muted)] mb-1">All Time Total</p>
                  <p className="text-[36px] font-bold text-[var(--foreground)]">
                    {report.allTimeTotal.toLocaleString()}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
