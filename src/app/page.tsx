'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-bounce-in">
          <div className="text-7xl sm:text-8xl mb-6">🎯</div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            Tally<span className="text-[var(--accent)]">Up</span>
          </h1>
          <p className="text-xl sm:text-2xl text-[var(--muted)] max-w-lg mx-auto mb-2 font-light">
            Track anything. Celebrate everything.
          </p>
          <p className="text-base text-[var(--muted)] max-w-md mx-auto mb-10">
            A beautifully simple tally counter for your daily goals, habits, and anything worth counting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md animate-slide-up">
          <button
            onClick={() => router.push('/register')}
            className="btn-primary flex-1 text-lg py-4"
          >
            Get Started Free
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn-secondary flex-1 text-lg py-4"
          >
            Sign In
          </button>
        </div>

        <p className="text-sm text-[var(--muted)] mt-4">
          14-day free trial &middot; Then just $5.55/year
        </p>
      </div>

      {/* Features */}
      <div className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            {
              emoji: '📊',
              title: 'Period Tracking',
              desc: 'Track daily, weekly, monthly, or yearly. Set custom start days for your periods.',
            },
            {
              emoji: '🏆',
              title: 'Goal Celebrations',
              desc: 'Set goals and get rewarded with satisfying celebrations when you hit them.',
            },
            {
              emoji: '📱',
              title: 'All Your Devices',
              desc: 'Works on iPhone, iPad, Mac — sign in anywhere and your counters stay in sync.',
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-card p-6 text-center animate-slide-up">
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[var(--muted)] border-t border-[var(--divider)]">
        <p>TallyUp &middot; Track anything, celebrate everything.</p>
      </footer>
    </div>
  );
}
