'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Counters', path: '/dashboard', icon: '⊞' },
    { label: 'Reports', path: '/reports', icon: '⊟' },
    { label: 'Settings', path: '/settings', icon: '⊙' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--divider)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xl font-bold tracking-tight text-[var(--foreground)]"
          >
            Tally<span className="text-[var(--accent)]">Up</span>
          </button>

          {user && (
            <>
              {/* Desktop nav */}
              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      pathname === item.path
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--divider)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-full text-sm font-medium text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                >
                  Sign Out
                </button>
              </nav>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden p-2 rounded-lg hover:bg-[var(--divider)] transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="w-5 flex flex-col gap-1">
                  <span className={`block h-0.5 bg-[var(--foreground)] transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`block h-0.5 bg-[var(--foreground)] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-[var(--foreground)] transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {user && menuOpen && (
          <nav className="sm:hidden pb-4 animate-slide-up">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { router.push(item.path); setMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all mb-1 ${
                  pathname === item.path
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--divider)]'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
            >
              Sign Out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
