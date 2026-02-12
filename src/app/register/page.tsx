'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_PERIOD, TRIAL_DAYS } from '@/lib/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12">
      {/* Floating background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-72 h-72 rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 rounded-full bg-[var(--warning)] opacity-[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <button onClick={() => router.push('/')} className="text-[32px] font-bold tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity">
            Tally<span className="text-[var(--accent)]">Up</span>
          </button>
          <p className="text-[15px] text-[var(--muted)] mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-elevated p-6 space-y-4">
          {error && (
            <div className="bg-[var(--danger-light)] text-[var(--danger)] px-4 py-2.5 rounded-xl text-[14px] font-medium animate-slide-down">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-[16px] mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-[12px] text-center text-[var(--muted-2)] pt-1">
            {TRIAL_DAYS}-day free trial &middot; Then {SUBSCRIPTION_PRICE}/{SUBSCRIPTION_PERIOD}
          </p>
        </form>

        <p className="text-center text-[14px] text-[var(--muted)] mt-6">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-[var(--accent)] font-semibold hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
