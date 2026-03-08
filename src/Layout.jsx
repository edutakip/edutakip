import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Users, DollarSign, HelpCircle, LogOut, Sun, Moon, Home, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isDark, setIsDark] = useState(() => localStorage.getItem('edutrack_theme') === 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [role] = useState(() => localStorage.getItem('tilki_role') || '');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('edutrack_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (currentPageName === 'Landing') {
    return <div className={isDark ? 'dark-mode' : ''}>{children}</div>;
  }

  const nav = role === 'teacher' ? TEACHER_NAV : PARENT_NAV;
  const sideW = collapsed ? '68px' : '220px';

  return (
    <div className={isDark ? 'dark-mode' : ''} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sideW, flexShrink: 0,
        background: isDark ? 'var(--bg-secondary)' : 'linear-gradient(180deg, #0f1f3d 0%, #1e3a8a 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0.6rem', paddingTop: '1.25rem', paddingBottom: '1rem',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50, overflowX: 'hidden', transition: 'width 0.2s',
        boxShadow: '2px 0 20px rgba(0,0,0,0.12)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 0.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color='white' />
          </div>
          {!collapsed && (
            <div>
              <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: 1 }}>EduTrack</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginTop: '0.15rem' }}>
                {role === 'teacher' ? 'Öğretmen Paneli' : 'Veli Paneli'}
              </p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {nav.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.page === currentPageName;
            const baseStyle = {
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.65rem 0.75rem', borderRadius: '10px',
              fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
              width: '100%', textAlign: 'left', border: 'none',
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              fontWeight: isActive ? '700' : '400',
              textDecoration: 'none', overflow: 'hidden', whiteSpace: 'nowrap',
              boxShadow: isActive ? 'inset 2px 0 0 rgba(255,255,255,0.7)' : 'none',
            };
            if (item.page) {
              return (
                <Link key={i} to={createPageUrl(item.page)} style={baseStyle}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && item.label}
                </Link>
              );
            }
            return (
              <button key={i} style={baseStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <button onClick={() => setIsDark(d => !d)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {isDark ? <Sun size={18} style={{ flexShrink: 0 }} /> : <Moon size={18} style={{ flexShrink: 0 }} />}
            {!collapsed && (isDark ? 'Açık Tema' : 'Koyu Tema')}
          </button>
          <button onClick={() => { localStorage.removeItem('tilki_role'); window.location.href = createPageUrl('Landing'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && 'Çıkış Yap'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          style={{ position: 'absolute', top: '50%', right: '-12px', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '50%', background: 'white', border: '1px solid #dde6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {collapsed ? <ChevronRight size={12} color='#1e3a8a' /> : <ChevronLeft size={12} color='#1e3a8a' />}
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: sideW, flex: 1, minHeight: '100vh', overflow: 'auto', transition: 'margin-left 0.2s' }}>
        {children}
      </main>
    </div>
  );
}