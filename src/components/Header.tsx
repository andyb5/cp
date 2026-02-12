'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Counters', path: '/dashboard' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[var(--background)]/80 border-b border-[var(--divider)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[52px]">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[20px] font-bold tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity"
          >
            Tally<span className="text-[var(--accent)]">Up</span>
          </button>

          {user && (
            <>
              {/* Desktop nav */}
              <nav className="hidden sm:flex items-center">
                <div className="segment-control mr-3">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={pathname === item.path ? 'active' : ''}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all"
                >
                  Sign Out
                </button>
              </nav>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--divider)] transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-[18px] flex flex-col gap-[5px]">
                  <span className={`block h-[1.5px] bg-[var(--foreground)] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[3.25px]' : ''}`} />
                  <span className={`block h-[1.5px] bg-[var(--foreground)] transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`block h-[1.5px] bg-[var(--foreground)] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[3.25px]' : ''}`} />
                </div>
              </button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {user && menuOpen && (
          <>
            <div className="fixed inset-0 top-[52px] bg-black/20 sm:hidden z-30" onClick={() => setMenuOpen(false)} />
            <nav className="sm:hidden pb-3 relative z-40 animate-slide-down">
              <div className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-[16px] font-medium transition-all ${
                      pathname === item.path
                        ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--divider)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-xl text-[16px] font-medium text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
