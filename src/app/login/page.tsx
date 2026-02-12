'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12">
      {/* Floating background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-[var(--success)] opacity-[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <button onClick={() => router.push('/')} className="text-[32px] font-bold tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity">
            Tally<span className="text-[var(--accent)]">Up</span>
          </button>
          <p className="text-[15px] text-[var(--muted)] mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-elevated p-6 space-y-4">
          {error && (
            <div className="bg-[var(--danger-light)] text-[var(--danger)] px-4 py-2.5 rounded-xl text-[14px] font-medium animate-slide-down">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-[16px] mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[var(--muted)] mt-6">
          Don&apos;t have an account?{' '}
          <button onClick={() => router.push('/register')} className="text-[var(--accent)] font-semibold hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
