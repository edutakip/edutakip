import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight, Users, BookOpen, CalendarDays, DollarSign, MessageCircle, LayoutDashboard, Home } from 'lucide-react';

const TEACHER_NAV = [
  { label: 'Genel Bakış', icon: LayoutDashboard, page: 'TeacherDashboard' },
  { label: 'Öğrencilerim', icon: Users, page: 'TeacherStudents' },
  { label: 'Dersler', icon: BookOpen, page: 'TeacherLessons' },
  { label: 'Takvim', icon: CalendarDays, page: 'TeacherCalendar' },
  { label: 'Finans', icon: DollarSign, page: 'TeacherFinance' },
  { label: 'Veli İletişim', icon: MessageCircle, page: 'TeacherMessages' },
];

const PARENT_NAV = [
  { label: 'Ana Sayfa', icon: Home, page: 'ParentDashboard' },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [role] = useState(() => localStorage.getItem('tilki_role') || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    import('@/api/base44Client').then(({ base44 }) => {
      base44.auth.me().then(setUser).catch(() => {});
    });
  }, []);

  if (currentPageName === 'Landing') {
    return <div>{children}</div>;
  }

  const nav = role === 'teacher' ? TEACHER_NAV : PARENT_NAV;
  const sideW = collapsed ? '64px' : '224px';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTrack" style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '12px' }} />
        {!collapsed && (
          <div>
            <h1 style={{ color: 'white', fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: 1 }}>EduTrack</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
              {role === 'teacher' ? 'Öğretmen Paneli' : 'Veli Paneli'}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0.75rem 1rem' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        {nav.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.page === currentPageName;
          return (
            <Link key={i} to={createPageUrl(item.page)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: '10px',
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s',
                background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? '600' : '400',
                textDecoration: 'none', overflow: 'hidden', whiteSpace: 'nowrap',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0 0.5rem 1rem', marginTop: 'auto', flexShrink: 0 }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0.25rem 0.75rem' }} />
        {user && !collapsed && (
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        )}
        <button onClick={() => { localStorage.removeItem('tilki_role'); window.location.href = createPageUrl('Landing'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
            borderRadius: '10px', border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.85rem',
            overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && 'Çıkış Yap'}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sideW, flexShrink: 0,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50, overflowX: 'hidden', overflowY: 'auto', transition: 'width 0.2s ease',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>
        <SidebarContent />

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', top: '50%', right: '-11px', transform: 'translateY(-50%)',
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'white', border: '1.5px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.15s', zIndex: 10,
          }}>
          {collapsed ? <ChevronRight size={11} color='#4f46e5' /> : <ChevronLeft size={11} color='#4f46e5' />}
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: sideW, flex: 1, minHeight: '100vh', overflow: 'auto', transition: 'margin-left 0.2s ease' }}>
        {children}
      </main>
    </div>
  );
}