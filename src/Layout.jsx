import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight, Users, BookOpen, CalendarDays, DollarSign, MessageCircle, LayoutDashboard, Home, Calculator } from 'lucide-react';

// ── Page transition wrapper ───────────────────────────────────
function PageTransition({ children, pageKey }) {
  const [visible, setVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (prevKey.current !== pageKey) {
      // Yeni sayfa geldi: önce gizle, sonra içeriği değiştir, sonra göster
      setVisible(false);
      const t1 = setTimeout(() => {
        setDisplayChildren(children);
        prevKey.current = pageKey;
        const t2 = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(t2);
      }, 150);
      return () => clearTimeout(t1);
    } else {
      // İlk yükleme
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [pageKey]);

  // children değişince (data yüklenince) displayChildren'ı güncelle
  useEffect(() => {
    if (prevKey.current === pageKey) {
      setDisplayChildren(children);
    }
  }, [children]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.22s ease, transform 0.22s ease',
      willChange: 'opacity, transform',
    }}>
      {displayChildren}
    </div>
  );
}

const TEACHER_NAV = [
  { label: 'Genel Bakış', icon: LayoutDashboard, page: 'TeacherDashboard' },
  { label: 'Öğrencilerim', icon: Users, page: 'TeacherStudents' },
  { label: 'Dersler', icon: BookOpen, page: 'TeacherLessons' },
  { label: 'Ödevler', icon: GraduationCap, page: 'TeacherHomework' },
  { label: 'Takvim', icon: CalendarDays, page: 'TeacherCalendar' },
  { label: 'Finans', icon: DollarSign, page: 'TeacherFinance' },
  { label: 'Veli İletişim', icon: MessageCircle, page: 'TeacherMessages' },
  { label: 'Hesap Makinesi', icon: Calculator, page: 'Calculator' },
];

const PARENT_NAV = [
  { label: 'Ana Sayfa', icon: Home, page: 'ParentDashboard' },
  { label: 'Ödevler', icon: GraduationCap, page: 'ParentHomework' },
  { label: 'Gelişim Raporu', icon: BookOpen, page: 'ParentPerformance' },
  { label: 'Mesajlar', icon: MessageCircle, page: 'ParentMessages' },
];

// ── Top loading bar ──────────────────────────────────────────
function LoadingBar({ active }) {
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (active) {
      setWidth(0);
      setOpacity(1);
      const t1 = setTimeout(() => setWidth(70), 30);
      const t2 = setTimeout(() => setWidth(90), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setWidth(100);
      const t = setTimeout(() => setOpacity(0), 200);
      return () => clearTimeout(t);
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      const t = setTimeout(() => { setWidth(0); setOpacity(1); }, 400);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3,
      zIndex: 9999, pointerEvents: 'none', opacity,
      transition: 'opacity 0.2s ease',
    }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
        borderRadius: '0 3px 3px 0',
        boxShadow: '0 0 10px rgba(99,102,241,0.6)',
        transition: width === 0 ? 'none' : width === 100 ? 'width 0.2s ease' : 'width 0.8s ease',
      }} />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [role] = useState(() => localStorage.getItem('tilki_role') || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const prevPage = useRef(currentPageName);

  useEffect(() => {
    if (prevPage.current !== currentPageName) {
      setNavigating(true);
      const t = setTimeout(() => {
        setNavigating(false);
        prevPage.current = currentPageName;
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentPageName]);

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
        <LoadingBar active={navigating} />
        {/* MAIN */}
        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto', paddingBottom: '70px' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
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
      <LoadingBar active={navigating} />

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
      <main style={{ marginLeft: sideW, flex: 1, minHeight: '100vh', overflow: 'auto', transition: 'margin-left 0.2s ease' }}>
        <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}