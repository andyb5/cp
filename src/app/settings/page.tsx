'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { APP_VERSION, SUBSCRIPTION_PRICE, SUBSCRIPTION_PERIOD, TRIAL_DAYS } from '@/lib/constants';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showSubscription, setShowSubscription] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Escape to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSubscription(false);
        setShowExportConfirm(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/counters');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tallyup-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Export failed silently
    } finally {
      setExporting(false);
      setShowExportConfirm(false);
    }
  };

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
    <div className="min-h-dvh fullscreen-container">
      <Header />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 safe-area">
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[var(--foreground)] leading-tight">
            Settings
          </h1>
          <p className="text-[13px] text-[var(--muted)] mt-0.5">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-5 animate-fade-in">
          {/* Account Section */}
          <div>
            <h2 className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 px-1">Account</h2>
            <div className="grouped-list">
              <div className="grouped-list-item">
                <span className="text-[15px] text-[var(--foreground)]">Name</span>
                <span className="text-[15px] text-[var(--muted)]">{user.name}</span>
              </div>
              <div className="grouped-list-item">
                <span className="text-[15px] text-[var(--foreground)]">Email</span>
                <span className="text-[15px] text-[var(--muted)]">{user.email}</span>
              </div>
              <div className="grouped-list-item">
                <span className="text-[15px] text-[var(--foreground)]">Member since</span>
                <span className="text-[15px] text-[var(--muted)]">
                  {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div>
            <h2 className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 px-1">Subscription</h2>
            <div className="grouped-list">
              <div className="grouped-list-item">
                <span className="text-[15px] text-[var(--foreground)]">Status</span>
                <span className={`text-[13px] font-medium px-2.5 py-1 rounded-full ${
                  user.subscriptionStatus === 'active'
                    ? 'bg-[var(--success-light)] text-[var(--success)]'
                    : isTrialActive
                    ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                    : 'bg-[var(--danger-light)] text-[var(--danger)]'
                }`}>
                  {user.subscriptionStatus === 'active'
                    ? 'Active'
                    : isTrialActive
                    ? `Trial \u2022 ${trialDaysLeft} days left`
                    : 'Expired'}
                </span>
              </div>
              {user.subscriptionStatus !== 'active' && (
                <button
                  onClick={() => setShowSubscription(true)}
                  className="grouped-list-item hover:bg-[var(--divider)] transition-colors cursor-pointer"
                >
                  <span className="text-[15px] text-[var(--accent)] font-medium">Upgrade to Pro</span>
                  <span className="text-[13px] text-[var(--muted)]">{SUBSCRIPTION_PRICE}/{SUBSCRIPTION_PERIOD}</span>
                </button>
              )}
            </div>
          </div>

          {/* Data Section */}
          <div>
            <h2 className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 px-1">Data</h2>
            <div className="grouped-list">
              <button
                onClick={() => setShowExportConfirm(true)}
                className="grouped-list-item hover:bg-[var(--divider)] transition-colors cursor-pointer w-full"
              >
                <span className="text-[15px] text-[var(--foreground)]">Export Data</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>

          {/* App Section */}
          <div>
            <h2 className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 px-1">App</h2>
            <div className="grouped-list">
              <div className="grouped-list-item">
                <span className="text-[15px] text-[var(--foreground)]">Version</span>
                <span className="text-[15px] text-[var(--muted)]">{APP_VERSION}</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                  Add to Home Screen for the best experience. TallyUp works as a standalone app on iOS, iPadOS, and macOS.
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div>
            <div className="grouped-list">
              <button
                onClick={async () => { await logout(); router.push('/'); }}
                className="grouped-list-item hover:bg-[var(--danger-light)] transition-colors cursor-pointer w-full justify-center"
              >
                <span className="text-[15px] text-[var(--danger)] font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Export Confirm */}
      {showExportConfirm && (
        <div
          className="modal-backdrop flex items-center justify-center"
          onClick={() => setShowExportConfirm(false)}
        >
          <div
            className="glass-card-elevated w-full max-w-[320px] mx-4 p-6 rounded-2xl animate-bounce-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[40px] mb-3">📦</div>
            <h3 className="text-[18px] font-bold text-[var(--foreground)] mb-2">Export Data</h3>
            <p className="text-[14px] text-[var(--muted)] mb-5">
              Download all your counter data as a JSON file.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary flex-1 !py-3"
              >
                {exporting ? 'Exporting...' : 'Download'}
              </button>
              <button
                onClick={() => setShowExportConfirm(false)}
                className="btn-secondary flex-1 !py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscription && (
        <div
          className="modal-backdrop flex items-end sm:items-center justify-center"
          onClick={() => setShowSubscription(false)}
        >
          <div
            className="glass-card-elevated w-full sm:max-w-[400px] sm:mx-4 p-8 sm:rounded-2xl rounded-t-2xl animate-slide-in-bottom sm:animate-bounce-in safe-area"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-[56px] mb-3 animate-float">✨</div>
              <h2 className="text-[24px] font-bold text-[var(--foreground)] mb-1">TallyUp Pro</h2>
              <p className="text-[15px] text-[var(--muted)] mb-6">Unlimited counters, unlimited potential.</p>

              <div className="glass-card p-6 mb-6" style={{ border: '2px solid var(--accent)' }}>
                <p className="text-[40px] font-bold text-[var(--accent)] leading-none">{SUBSCRIPTION_PRICE}</p>
                <p className="text-[14px] text-[var(--muted)] mt-1">per {SUBSCRIPTION_PERIOD}</p>
                <p className="text-[12px] text-[var(--muted-2)] mt-1.5">That&apos;s less than $0.50/month!</p>
              </div>

              <div className="text-left space-y-3 mb-6">
                {[
                  { icon: '∞', text: 'Unlimited counters' },
                  { icon: '📊', text: 'Full reporting history' },
                  { icon: '🔄', text: 'Cross-device sync' },
                  { icon: '🎉', text: 'Goal celebrations' },
                  { icon: '⚡', text: 'Priority support' },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3 text-[14px] text-[var(--foreground)]">
                    <span className="text-[16px] w-6 text-center flex-shrink-0">{feature.icon}</span>
                    {feature.text}
                  </div>
                ))}
              </div>

              <button
                className="btn-primary w-full text-[17px] py-3.5 mb-3"
                onClick={() => {
                  alert('Payment integration would connect to Stripe or Apple Pay here. For now, your trial continues!');
                  setShowSubscription(false);
                }}
              >
                Subscribe Now
              </button>
              <button
                onClick={() => setShowSubscription(false)}
                className="text-[14px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-2"
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
