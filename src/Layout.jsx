import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Users, DollarSign, HelpCircle, LogOut, Sun, Moon, Home } from 'lucide-react';

const TEACHER_NAV = [
  { label: 'Takvim', icon: Calendar, page: 'TeacherDashboard' },
  { label: 'Öğrencilerim', icon: Users, page: 'TeacherStudents' },
  { label: 'Finans', icon: DollarSign, page: 'TeacherFinance' },
  { label: 'Destek', icon: HelpCircle, page: null },
];

const PARENT_NAV = [
  { label: 'Ana Sayfa', icon: Home, page: 'ParentDashboard' },
];

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('tilki_theme') || 'dark');
  const [role] = useState(() => localStorage.getItem('tilki_role') || '');

  useEffect(() => {
    localStorage.setItem('tilki_theme', theme);
  }, [theme]);

  if (currentPageName === 'Landing') {
    return (
      <div className={theme === 'light' ? 'light-mode' : ''} style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {children}
      </div>
    );
  }

  const nav = role === 'teacher' ? TEACHER_NAV : PARENT_NAV;
  const isLight = theme === 'light';

  const navItemBase = {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    padding: '0.6rem 0.75rem', borderRadius: '10px',
    fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
    width: '100%', textAlign: 'left',
  };

  return (
    <div className={isLight ? 'light-mode' : ''} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '1.25rem 0.75rem',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 0.5rem', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            🦊 Tilki.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '0.2rem' }}>
            {role === 'teacher' ? 'Öğretmen Paneli' : 'Veli Paneli'}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          {nav.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.page === currentPageName;
            const style = {
              ...navItemBase,
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-secondary)',
              fontWeight: isActive ? '600' : '400',
              textDecoration: 'none', border: 'none',
            };
            if (item.page) {
              return (
                <Link key={i} to={createPageUrl(item.page)} style={style}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon size={17} />{item.label}
                </Link>
              );
            }
            return (
              <button key={i} style={style}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon size={17} />{item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{ ...navItemBase, background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {isLight ? <Moon size={17} /> : <Sun size={17} />}
            {isLight ? 'Koyu Tema' : 'Açık Tema'}
          </button>
          <button
            onClick={() => { localStorage.removeItem('tilki_role'); window.location.href = createPageUrl('Landing'); }}
            style={{ ...navItemBase, background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={17} />Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}