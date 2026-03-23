import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight, Users, BookOpen, CalendarDays, DollarSign, MessageCircle, LayoutDashboard, Home, Plus } from 'lucide-react';

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

function useWindowSize() {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

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

  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 1024;
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

  // Öğretmen için layout — masaüstü sidebar, tablet/mobil alt nav
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <LoadingBar active={navigating} />
        <main style={{ flex: 1, minHeight: '100vh', paddingBottom: '70px' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
        </main>

        {/* ALT NAV — öğretmen */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: '65px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}>
          {nav.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.page === currentPageName;
            return (
              <Link key={i} to={createPageUrl(item.page)}
                onClick={(e) => handleNav(e, item.page)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.2rem', padding: '0.4rem 0.5rem', cursor: 'pointer',
                  color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none', flex: 1, height: '100%', transition: 'all 0.15s',
                  borderTop: isActive ? '2px solid #6366f1' : '2px solid transparent',
                }}>
                <Icon size={18} />
                <span style={{ fontSize: '0.55rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.2rem', padding: '0.4rem 0.5rem', cursor: 'pointer',
              color: 'rgba(255,150,150,0.6)', background: 'none', border: 'none', flex: 1, height: '100%',
              borderTop: '2px solid transparent',
            }}>
            <LogOut size={18} />
            <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>Çıkış</span>
          </button>
        </nav>

        {/* FAB — mobilde de göster */}
        {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
        <div style={{ position: 'fixed', bottom: '5rem', right: '1rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          {fabOpen && [
            { label: 'Ders Ekle', color: '#4f46e5', bg: '#eef2ff', Icon: CalendarDays, action: 'lessonModal' },
            { label: 'Ödeme Al',  color: '#10b981', bg: '#ecfdf5', Icon: DollarSign,   action: 'paymentModal' },
            { label: 'Ödev Ver',  color: '#f97316', bg: '#fff7ed', Icon: BookOpen,     action: 'homeworkModal' },
          ].map((a, i) => {
            const handleClick = () => {
              if (a.action === 'lessonModal') setShowLessonModal(true);
              else if (a.action === 'paymentModal') setShowPaymentModal(true);
              else if (a.action === 'homeworkModal') { navigate(createPageUrl('TeacherHomework') + '?openForm=true'); }
              setFabOpen(false);
            };
            return (
              <div key={i} onClick={handleClick} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <span style={{ background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>{a.label}</span>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <a.Icon size={18} color={a.color} />
                </div>
              </div>
            );
          })}
          <button onClick={() => setFabOpen(o => !o)}
            style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'transform 0.25s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            <Plus size={22} color="white" />
          </button>
        </div>

        {showLessonModal && <LessonModal students={fabStudents} defaultDate={new Date().toISOString().slice(0,10)} onClose={() => setShowLessonModal(false)} onSaved={() => setShowLessonModal(false)} />}
        {showPaymentModal && !selectedPayStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowPaymentModal(false)}>
            <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>Ödeme Al</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                {fabStudents.map(s => (
                  <button key={s.id} onClick={() => setSelectedPayStudent(s)} style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#111827', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}>{s.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {showPaymentModal && selectedPayStudent && <PaymentModal student={selectedPayStudent} onClose={() => { setShowPaymentModal(false); setSelectedPayStudent(null); }} onSaved={() => { setShowPaymentModal(false); setSelectedPayStudent(null); }} />}
      </div>
    );
  }

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

      {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        {fabOpen && [
          { label: 'Ders Ekle', color: '#4f46e5', bg: '#eef2ff', Icon: CalendarDays, page: 'TeacherLessons' },
          { label: 'Ödeme Al',  color: '#10b981', bg: '#ecfdf5', Icon: DollarSign,   page: 'TeacherFinance' },
          { label: 'Ödev Ver',  color: '#f97316', bg: '#fff7ed', Icon: BookOpen,     page: 'TeacherHomework' },
        ].map((a, i) => (
          <div key={i} onClick={() => { navigate(createPageUrl(a.page)); setFabOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <span style={{ background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>{a.label}</span>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <a.Icon size={18} color={a.color} />
            </div>
          </div>
        ))}
        <button onClick={() => setFabOpen(o => !o)}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'transform 0.25s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <Plus size={22} color="white" />
        </button>
      </div>

    </div>
  );
}