'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_PERIOD, TRIAL_DAYS } from '@/lib/constants';

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
    <div className="min-h-dvh flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 text-center relative hero-gradient">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-[var(--accent)] rounded-full opacity-[0.03] blur-3xl animate-hero-float" />
          <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-[var(--success)] rounded-full opacity-[0.03] blur-3xl animate-hero-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <div className="animate-bounce-in">
            <div className="text-[72px] sm:text-[88px] mb-4 leading-none animate-float">🎯</div>
            <h1 className="text-[40px] sm:text-[64px] font-bold tracking-tight text-[var(--foreground)] mb-3 leading-[1.05]">
              Tally<span className="text-[var(--accent)]">Up</span>
            </h1>
            <p className="text-[20px] sm:text-[26px] text-[var(--muted)] max-w-lg mx-auto mb-1.5 font-light leading-snug">
              Track anything. Celebrate everything.
            </p>
            <p className="text-[16px] text-[var(--muted-2)] max-w-md mx-auto mb-10 leading-relaxed">
              A beautifully simple tally counter for your daily goals, habits, and anything worth counting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm mx-auto animate-slide-up delay-2">
            <button
              onClick={() => router.push('/register')}
              className="btn-primary flex-1 text-[17px] py-4"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn-secondary flex-1 text-[17px] py-4"
            >
              Sign In
            </button>
          </div>

          <p className="text-[13px] text-[var(--muted-2)] mt-5 animate-slide-up delay-3">
            {TRIAL_DAYS}-day free trial &middot; Then just {SUBSCRIPTION_PRICE}/{SUBSCRIPTION_PERIOD}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[13px] font-semibold text-[var(--accent)] uppercase tracking-widest text-center mb-3">
            Features
          </h2>
          <h3 className="text-[28px] sm:text-[34px] font-bold text-[var(--foreground)] text-center mb-12 leading-tight">
            Everything you need to<br />count what matters
          </h3>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { emoji: '📊', title: 'Period Tracking', desc: 'Track daily, weekly, monthly, or yearly. Set custom start days for each period.' },
              { emoji: '🏆', title: 'Goal Celebrations', desc: 'Set goals and unlock satisfying confetti celebrations when you hit them.' },
              { emoji: '📱', title: 'All Your Devices', desc: 'Works on iPhone, iPad, Mac. Sign in anywhere and your counters stay in sync.' },
              { emoji: '🌙', title: 'Dark Mode', desc: 'Beautiful in light and dark. Automatically matches your system preference.' },
              { emoji: '⚡', title: 'Instant Feedback', desc: 'Haptic vibration, animated counters, and optimistic updates. Feels native.' },
              { emoji: '📈', title: 'Smart Reports', desc: 'See trends over time with period-by-period breakdowns and goal tracking.' },
            ].map((feature, idx) => (
              <div
                key={feature.title}
                className="glass-card p-6 text-center animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="text-[40px] mb-3 leading-none">{feature.emoji}</div>
                <h4 className="text-[17px] font-semibold text-[var(--foreground)] mb-1.5">{feature.title}</h4>
                <p className="text-[14px] text-[var(--muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 sm:py-20 text-center border-t border-[var(--divider)]">
        <div className="max-w-md mx-auto">
          <h3 className="text-[24px] sm:text-[28px] font-bold text-[var(--foreground)] mb-3">
            Ready to start counting?
          </h3>
          <p className="text-[16px] text-[var(--muted)] mb-8">
            Join thousands who track their goals with TallyUp.
          </p>
          <button onClick={() => router.push('/register')} className="btn-primary text-[17px] py-4 px-10">
            Create Free Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-[var(--divider)]">
        <p className="text-[13px] text-[var(--muted-2)]">TallyUp &middot; Track anything, celebrate everything.</p>
      </footer>
    </div>
  );
}
