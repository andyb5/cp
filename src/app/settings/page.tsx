'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTrialActive = user.subscriptionStatus === 'trial' && user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry) > new Date()
    : false;

  const trialDaysLeft = user.subscriptionExpiry
    ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-dvh">
      <Header />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 safe-area">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6">
          Settings
        </h1>

        <div className="space-y-4 animate-slide-up">
          {/* Account Info */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">Account</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[var(--divider)]">
                <span className="text-[var(--muted)]">Name</span>
                <span className="font-medium text-[var(--foreground)]">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--divider)]">
                <span className="text-[var(--muted)]">Email</span>
                <span className="font-medium text-[var(--foreground)]">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--muted)]">Member since</span>
                <span className="font-medium text-[var(--foreground)]">
                  {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">Subscription</h2>

            <div className="flex items-center justify-between py-2 mb-3">
              <span className="text-[var(--muted)]">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.subscriptionStatus === 'active'
                  ? 'bg-[var(--success)]/15 text-[var(--success)]'
                  : isTrialActive
                  ? 'bg-[var(--warning)]/15 text-[var(--warning)]'
                  : 'bg-[var(--danger)]/15 text-[var(--danger)]'
              }`}>
                {user.subscriptionStatus === 'active'
                  ? 'Active'
                  : isTrialActive
                  ? `Trial (${trialDaysLeft} days left)`
                  : 'Expired'}
              </span>
            </div>

            {user.subscriptionStatus !== 'active' && (
              <button
                onClick={() => setShowSubscription(true)}
                className="btn-primary w-full"
              >
                Subscribe — $5.55/year
              </button>
            )}
          </div>

          {/* App Info */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">App</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[var(--divider)]">
                <span className="text-[var(--muted)]">Version</span>
                <span className="font-medium text-[var(--foreground)]">1.0.0</span>
              </div>
              <div className="py-2">
                <p className="text-sm text-[var(--muted)]">
                  Add to Home Screen for the best experience. TallyUp works as a standalone app on iOS, iPadOS, and macOS.
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="btn-secondary w-full text-[var(--danger)]"
          >
            Sign Out
          </button>
        </div>
      </main>

      {/* Subscription Modal */}
      {showSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSubscription(false)}
        >
          <div
            className="glass-card w-full sm:max-w-md sm:mx-4 p-8 sm:rounded-2xl rounded-t-2xl animate-slide-up safe-area"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">TallyUp Pro</h2>
              <p className="text-[var(--muted)] mb-6">Unlimited counters, unlimited potential.</p>

              <div className="glass-card p-6 mb-6" style={{ border: '2px solid var(--accent)' }}>
                <p className="text-4xl font-bold text-[var(--accent)]">$5.55</p>
                <p className="text-sm text-[var(--muted)]">per year</p>
                <p className="text-xs text-[var(--muted)] mt-2">That&apos;s less than $0.50/month!</p>
              </div>

              <ul className="text-left space-y-3 mb-6">
                {[
                  'Unlimited counters',
                  'Full reporting history',
                  'Cross-device sync',
                  'Goal celebrations',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                    <span className="text-[var(--success)] flex-shrink-0">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="btn-primary w-full text-lg py-4 mb-3"
                onClick={() => {
                  alert('Payment integration would connect to Stripe or Apple Pay here. For now, your trial continues!');
                  setShowSubscription(false);
                }}
              >
                Subscribe Now
              </button>
              <button
                onClick={() => setShowSubscription(false)}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
