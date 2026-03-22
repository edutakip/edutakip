import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight, Users, BookOpen, CalendarDays, DollarSign, MessageCircle, LayoutDashboard, Home } from 'lucide-react';

const TEACHER_NAV = [
  { label: 'Genel Bakış', icon: LayoutDashboard, page: 'TeacherDashboard' },
  { label: 'Öğrencilerim', icon: Users, page: 'TeacherStudents' },
  { label: 'Dersler', icon: BookOpen, page: 'TeacherLessons' },
  { label: 'Ödevler', icon: GraduationCap, page: 'TeacherHomework' },
  { label: 'Takvim', icon: CalendarDays, page: 'TeacherCalendar' },
  { label: 'Finans', icon: DollarSign, page: 'TeacherFinance' },
  { label: 'Veli İletişim', icon: MessageCircle, page: 'TeacherMessages' },
];

const PARENT_NAV = [
  { label: 'Ana Sayfa', icon: Home, page: 'ParentDashboard' },
  { label: 'Ödevler', icon: GraduationCap, page: 'ParentHomework' },
  { label: 'Gelişim Raporu', icon: BookOpen, page: 'ParentPerformance' },
  { label: 'Mesajlar', icon: MessageCircle, page: 'ParentMessages' },
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
  const isParent = role === 'parent';

  const handleLogout = () => {
    localStorage.removeItem('tilki_role');
    window.location.href = createPageUrl('Landing');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '12px' }} />
        {!collapsed && (
          <div>
            <h1 style={{ color: 'white', fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: 1 }}>EduTakip</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
              {role === 'teacher' ? 'Öğretmen Paneli' : 'Veli Paneli'}
            </p>
          </div>
        )}
      </div>

      {/* User info */}
      {user && !collapsed && (
        <div style={{ margin: '0 0.75rem 0.75rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={12} /> Çıkış Yap
          </button>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0.75rem 1rem' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', overflowY: 'auto' }}>
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

      {/* Bottom - only show logout icon when collapsed */}
      {collapsed && (
        <div style={{ padding: '0 0.5rem 1rem', marginTop: 'auto', flexShrink: 0 }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0.25rem 0.75rem' }} />
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            <LogOut size={17} />
          </button>
        </div>
      )}
    </>
  );

  // Veli için alt navigation layout
  if (isParent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* MAIN */}
        <main style={{ flex: 1, minHeight: '100vh', paddingBottom: '70px' }}>
          {children}
        </main>

        {/* BOTTOM NAV */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: '70px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}>
          {nav.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.page === currentPageName;
            return (
              <Link key={i} to={createPageUrl(item.page)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem', padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                  color: isActive ? '#6366f1' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', flex: 1, height: '100%',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                <Icon size={19} />
                <span style={{ fontSize: '0.6rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            );
          })}
          {/* Logout button */}
          <button onClick={handleLogout}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.25rem', padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.15s',
              color: 'rgba(255,150,150,0.7)', background: 'none', border: 'none', flex: 1, height: '100%',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,150,150,0.7)'}>
            <LogOut size={19} />
            <span style={{ fontSize: '0.6rem', fontWeight: '600', whiteSpace: 'nowrap' }}>Çıkış</span>
          </button>
        </nav>
      </div>
    );
  }

  // Öğretmen için sol sidebar layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sideW, flexShrink: 0,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50, overflowX: 'hidden', overflowY: 'hidden', transition: 'width 0.2s ease',
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
      <main style={{ marginLeft: sideW, flex: 1, minHeight: '100vh', transition: 'margin-left 0.2s ease' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* ── Hızlı Aksiyonlar FAB ─────────────────────────── */}
      <FAB navigate={navigate} />
    </div>
  );
}

function FAB({ navigate }) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: 'Ders Ekle',
      color: '#4f46e5',
      bg: '#eef2ff',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>,
      onClick: () => { navigate(createPageUrl('TeacherLessons')); setOpen(false); },
    },
    {
      label: 'Ödeme Al',
      color: '#10b981',
      bg: '#ecfdf5',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
      onClick: () => { navigate(createPageUrl('TeacherFinance')); setOpen(false); },
    },
    {
      label: 'Ödev Ver',
      color: '#f97316',
      bg: '#fff7ed',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
      onClick: () => { navigate(createPageUrl('TeacherHomework')); setOpen(false); },
    },
  ];

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
      )}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        <style>{`@keyframes fabIn { from { opacity:0; transform:scale(0.7) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        {open && actions.map((action, i) => (
          <div key={i} onClick={action.onClick}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', animation: `fabIn 0.2s ease ${i * 0.06}s both` }}>
            <span style={{ background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: '700', padding: '0.4rem 0.85rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>
              {action.label}
            </span>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: action.bg, border: `2px solid ${action.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {action.icon}
            </div>
          </div>
        ))}
        <button onClick={() => setOpen(o => !o)}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'transform 0.25s, box-shadow 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,70,229,0.6)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.45)'}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </>
  );
}