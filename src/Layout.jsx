import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LogOut, GraduationCap, ChevronLeft, ChevronRight, Users, BookOpen, CalendarDays, DollarSign, MessageCircle, LayoutDashboard, Home, Plus, BarChart2, Bot, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LessonModal from './components/teacher/LessonModal';
import PaymentModal from './components/teacher/PaymentModal';
import { showToast } from '@/lib/toast';
import SubscriptionWidget from './components/SubscriptionWidget';
import ProUpgradeModal from './components/ProUpgradeModal';

// ── Page transition wrapper ───────────────────────────────────
function PageTransition({ children, pageKey }) {
  const [visible, setVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (prevKey.current !== pageKey) {
      setVisible(false);
      const t1 = setTimeout(() => {
        setDisplayChildren(children);
        prevKey.current = pageKey;
        const t2 = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(t2);
      }, 150);
      return () => clearTimeout(t1);
    } else {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [pageKey]);

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
    }}>
      {displayChildren}
    </div>
  );
}

// ── Top loading bar ───────────────────────────────────────────
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: 'none', opacity, transition: 'opacity 0.2s ease' }}>
      <div style={{
        height: '100%', width: `${width}%`,
        background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
        borderRadius: '0 3px 3px 0',
        boxShadow: '0 0 10px rgba(99,102,241,0.6)',
        transition: width === 0 ? 'none' : width === 100 ? 'width 0.2s ease' : 'width 0.8s ease',
      }} />
    </div>
  );
}

// ── Window size hook ──────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// ── Prefetch config ───────────────────────────────────────────
const PAGE_PREFETCH = {
  TeacherFinance:   (base44, me) => Promise.all([
    base44.entities.Payment.filter({ teacherEmail: me.email }),
    base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    base44.entities.Lesson.filter({ teacherEmail: me.email }),
  ]),
  TeacherCalendar:  (base44, me) => Promise.all([
    base44.entities.Lesson.filter({ teacherEmail: me.email }),
    base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
  ]),
  TeacherStudents:  (base44, me) => Promise.all([
    base44.entities.Student.filter({ teacherEmail: me.email }),
    base44.entities.Payment.filter({ teacherEmail: me.email }),
  ]),
  TeacherDashboard: (base44, me) => Promise.all([
    base44.entities.Lesson.filter({ teacherEmail: me.email }),
    base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    base44.entities.Payment.filter({ teacherEmail: me.email }),
  ]),
  TeacherLessons:   (base44, me) => Promise.all([
    base44.entities.Lesson.filter({ teacherEmail: me.email }),
    base44.entities.Student.filter({ teacherEmail: me.email }),
    base44.entities.Payment.filter({ teacherEmail: me.email }),
  ]),
};

const LESSON_TRACKING_PAGES = ['TeacherLessons', 'TeacherHomework', 'TeacherReports'];

// Nav items defined inside component using t() — see below

const PARENT_NAV = [
  { label: 'Ana Sayfa', icon: Home, page: 'ParentDashboard' },
  { label: 'Ödevler', icon: GraduationCap, page: 'ParentHomework' },
  { label: 'Gelişim Raporu', icon: BookOpen, page: 'ParentPerformance' },
  { label: 'Finans', icon: DollarSign, page: 'ParentLessonsPayments' },
  { label: 'Mesajlar', icon: MessageCircle, page: 'ParentMessages' },
];
const PARENT_MOBILE_NAV = [
  { label: 'Ana Sayfa', shortLabel: 'Ana', icon: Home, page: 'ParentDashboard' },
  { label: 'Ödevler', shortLabel: 'Ödev', icon: GraduationCap, page: 'ParentHomework' },
  { label: 'Gelişim Raporu', shortLabel: 'Gelişim', icon: BookOpen, page: 'ParentPerformance' },
  { label: 'Finans', shortLabel: 'Finans', icon: DollarSign, page: 'ParentLessonsPayments' },
  { label: 'Mesajlar', shortLabel: 'Mesaj', icon: MessageCircle, page: 'ParentMessages' },
];

// TEACHER_MOBILE_NAV defined inside component using t()

const FAB_ACTIONS_KEYS = [
  { labelKey: 'teacher.fab.addLesson',    color: '#4f46e5', bg: '#eef2ff', Icon: CalendarDays, action: 'lessonModal'   },
  { labelKey: 'teacher.fab.collectPayment', color: '#10b981', bg: '#ecfdf5', Icon: DollarSign,   action: 'paymentModal'  },
  { labelKey: 'teacher.fab.giveHomework', color: '#f97316', bg: '#fff7ed', Icon: BookOpen,     action: 'homeworkModal' },
];

function MobileSubscriptionButton({ plan, user }) {
  const [showModal, setShowModal] = React.useState(false);
  const label = plan === 'expired' ? 'Yenile' : 'Abone Ol';
  return (
    <>
      <button onClick={() => setShowModal(true)} style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.35rem 0.75rem', borderRadius: 10,
        border: 'none', cursor: 'pointer',
        background: plan === 'expired' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#f59e0b,#f97316)',
        color: 'white', fontWeight: 800, fontSize: '0.8rem',
        boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
      }}>
        <span style={{ fontSize: '0.85rem' }}>👑</span>
        {label}
      </button>
      {showModal && (
        <ProUpgradeModal
          reason='limit'
          onClose={() => setShowModal(false)}
          onUpgraded={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  const { t } = useTranslation();

  const TEACHER_MOBILE_NAV = [
    { label: t('teacher.layout.overview'), icon: LayoutDashboard, page: 'TeacherDashboard' },
    { label: t('teacher.layout.lessonMgmtGroup'), icon: BookOpen, submenu: ['TeacherStudents', 'TeacherLessons', 'TeacherHomework', 'TeacherReports'], multiLine: true },
    { label: t('teacher.layout.calendar'), icon: CalendarDays, page: 'TeacherCalendar' },
    { label: t('teacher.layout.finance'), icon: DollarSign, financeSubmenu: true, multiLine: false },
    { label: t('teacher.layout.parentComm'), icon: MessageCircle, page: 'TeacherMessages', multiLine: true },
  ];

  const TEACHER_NAV = [
    { label: t('teacher.layout.overview'), icon: LayoutDashboard, page: 'TeacherDashboard' },
    { label: t('teacher.layout.myStudents'), icon: Users, page: 'TeacherStudents' },
    {
      label: t('teacher.layout.lessonMgmtGroup'), icon: BookOpen,
      submenu: [
        { label: t('teacher.layout.lessons'), icon: BookOpen, page: 'TeacherLessons' },
        { label: t('teacher.layout.homework'), icon: GraduationCap, page: 'TeacherHomework' },
        { label: t('teacher.layout.progressReports'), icon: BarChart2, page: 'TeacherReports' },
      ],
    },
    { label: t('teacher.layout.calendar'), icon: CalendarDays, page: 'TeacherCalendar' },
    { label: t('teacher.layout.finance'), icon: DollarSign, page: 'TeacherFinance' },
    { label: t('teacher.layout.parentComm'), icon: MessageCircle, page: 'TeacherMessages' },
    { label: t('teacher.layout.assistant'), icon: Bot, page: 'TeacherAssistant' },
    { label: t('teacher.layout.smartRaise'), icon: TrendingUp, page: 'Page1' },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [role] = useState(() => localStorage.getItem('tilki_role') || '');
  const [user, setUser] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fabStudents, setFabStudents] = useState([]);
  const [selectedPayStudent, setSelectedPayStudent] = useState(null);
  const [derslerOpen, setDerslerOpen] = useState(false);
  const [finansOpen, setFinansOpen] = useState(false);

  const navigate = useNavigate();
  const prevPage = useRef(currentPageName);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 1024;
  const isNarrowMobile = windowWidth < 430;

  useEffect(() => {
    if (role === 'teacher') {
      import('@/api/base44Client').then(({ base44 }) => {
        base44.auth.me().then(me => {
          base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }).then(setFabStudents).catch(() => {});
        }).catch(() => {});
      });
    }
  }, [role]);

  useEffect(() => {
    if (prevPage.current !== currentPageName) {
      setNavigating(true);
      const t = setTimeout(() => { setNavigating(false); prevPage.current = currentPageName; }, 400);
      return () => clearTimeout(t);
    }
  }, [currentPageName]);

  const handleNav = (e, page) => {
    if (page === currentPageName) return;
    e.preventDefault();
    setNavigating(true);
    const prefetch = PAGE_PREFETCH[page];
    if (prefetch) {
      import('@/api/base44Client').then(({ base44 }) => {
        base44.auth.me().then(me => {
          const timeout = new Promise(res => setTimeout(res, 1200));
          Promise.race([prefetch(base44, me), timeout]).finally(() => navigate(createPageUrl(page)));
        }).catch(() => navigate(createPageUrl(page)));
      });
    } else {
      setTimeout(() => navigate(createPageUrl(page)), 300);
    }
  };

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

  // SidebarContent artık inline JSX olarak kullanılıyor (her render'da yeni component tanımlamayı önler)
  const sidebarContent = (
    <>
      <div style={{ padding: '1.25rem 1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '12px' }} />
        {!collapsed && (
          <div>
            <h1 style={{ color: 'white', fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: 1 }}>EduTakip</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
              {role === 'teacher' ? t('teacher.layout.teacherPanel') : t('teacher.layout.parentPanel')}
            </p>
          </div>
        )}
      </div>

      {user && !collapsed && (
        <div style={{ margin: '0 0.75rem 0.75rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={12} /> {t('teacher.layout.logout')}
          </button>
        </div>
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0.75rem 1rem' }} />

      <nav style={{ flex: 1, padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', overflowY: 'auto' }}>
        {nav.map((item, i) => {
          const Icon = item.icon;
          if (item.submenu) {
            const isGroupActive = item.submenu.some(s => s.page === currentPageName);
            const [subOpen, setSubOpen] = React.useState(isGroupActive);
            return (
              <div key={i}>
                <button onClick={() => setSubOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px',
                    fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s',
                    background: isGroupActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: isGroupActive ? '#c7d2fe' : 'rgba(255,255,255,0.55)',
                    fontWeight: isGroupActive ? '600' : '400',
                    border: 'none', borderLeft: isGroupActive ? '3px solid #6366f1' : '3px solid transparent',
                    overflow: 'hidden', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isGroupActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                  onMouseLeave={e => { if (!isGroupActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}>
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                      <ChevronRight size={13} style={{ transform: subOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', opacity: 0.5 }} />
                    </>
                  )}
                </button>
                {subOpen && !collapsed && (
                  <div style={{ marginLeft: '1rem', marginTop: '0.1rem', display: 'flex', flexDirection: 'column', gap: '0.05rem', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '0.5rem' }}>
                    {item.submenu.map((sub, j) => {
                      const SubIcon = sub.icon;
                      const isActive = sub.page === currentPageName;
                      return (
                        <Link key={j} to={createPageUrl(sub.page)}
                          onClick={(e) => handleNav(e, sub.page)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.5rem 0.65rem', borderRadius: '8px',
                            fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                            background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
                            color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: isActive ? '600' : '400',
                            textDecoration: 'none', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}>
                          <SubIcon size={14} style={{ flexShrink: 0 }} />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const isActive = item.page === currentPageName;
          return (
            <Link key={i} to={createPageUrl(item.page)}
              onClick={(e) => handleNav(e, item.page)}
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

      {role === 'teacher' && <SubscriptionWidget user={user} collapsed={collapsed} />}

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

  // ── Veli: her zaman alt nav ───────────────────────────────
  if (isParent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <LoadingBar active={navigating} />
        {/* Üst başlık */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 51,
          background: '#1a1a2e',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.65rem 1rem',
          display: 'flex', alignItems: 'center',
        }}>
          <div>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.3px', margin: 0, lineHeight: 1 }}>EduTakip</h1>
            <div style={{ width: 32, height: 2.5, background: '#6366f1', borderRadius: 2, marginTop: 3 }} />
          </div>
        </header>
        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto', paddingTop: '56px', paddingBottom: '80px' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
        </main>
        {/* Alt tab bar */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: '#1a1a2e',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: '64px',
        }}>
          {PARENT_NAV.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.page === currentPageName;
            return (
              <Link key={i} to={createPageUrl(item.page)}
                onClick={(e) => handleNav(e, item.page)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem', flex: 1, height: '100%', cursor: 'pointer',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none', transition: 'color 0.15s ease',
                }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span style={{ fontSize: '0.62rem', fontWeight: isActive ? '700' : '400', whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.25rem', flex: 1, height: '100%', cursor: 'pointer',
              color: '#f97316', background: 'none', border: 'none',
              transition: 'color 0.15s ease', fontSize: '0.62rem', fontWeight: '600',
            }}>
            <LogOut size={20} strokeWidth={1.75} />
            <span>Çıkış</span>
          </button>
        </nav>
      </div>
    );
  }

  // ── Öğretmen: tablet/mobil → alt nav, masaüstü → sidebar ──
  if (isMobile) {
    // Abonelik durumu için header bilgisi
    const plan = user?.plan || 'free';
    const daysLeft = user ? (() => {
      if (plan !== 'trialing' || !user.trial_end_date) return null;
      const diff = Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    })() : null;
    const showSubscriptionChip = plan === 'trialing' || plan === 'expired' || plan === 'free';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <LoadingBar active={navigating} />

        {/* ── Üst başlık bar ── */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 51,
          background: '#1a1a2e',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.55rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          {/* Sol: başlık */}
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.3px', margin: 0, lineHeight: 1 }}>EduTakip</h1>
            <div style={{ width: 32, height: 2.5, background: '#6366f1', borderRadius: 2, marginTop: 3 }} />
          </div>

          {/* Orta: deneme süresi progress bar (sadece trialing/free/expired) */}
          {showSubscriptionChip && (
            <div style={{ flex: 1, minWidth: 0 }}>
              {plan === 'trialing' && daysLeft !== null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Deneme Süresi</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: daysLeft < 5 ? '#fca5a5' : '#fbbf24' }}>{daysLeft} gün kaldı</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`,
                      borderRadius: 999,
                      background: daysLeft < 5 ? 'linear-gradient(90deg,#f97316,#ef4444)' : 'linear-gradient(90deg,#6366f1,#a78bfa)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </>
              )}
              {plan === 'free' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Ücretsiz Plan</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a5b4fc' }}>3 öğrenci limiti</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: '30%', borderRadius: 999, background: 'linear-gradient(90deg,#6366f1,#a78bfa)' }} />
                  </div>
                </>
              )}
              {plan === 'expired' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Abonelik</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fca5a5' }}>Süresi doldu</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sağ: buton veya PRO rozeti */}
          <div style={{ flexShrink: 0 }}>
            {showSubscriptionChip && <MobileSubscriptionButton plan={plan} user={user} />}
            {plan === 'pro' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6ee7b7', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '0.25rem 0.7rem' }}>
                PRO ✓
              </span>
            )}
          </div>
        </header>

        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto', paddingTop: '66px', paddingBottom: '80px' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
        </main>

        {/* Finans alt menü popup */}
        {finansOpen && (
          <>
            <div onClick={() => setFinansOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
            <div style={{
              position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px', padding: '0.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              minWidth: '180px',
            }}>
              {[
                { label: t('teacher.layout.finance'), icon: DollarSign, page: 'TeacherFinance' },
                { label: t('teacher.layout.smartRaise'), icon: TrendingUp, page: 'Page1' },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = item.page === currentPageName;
                return (
                  <Link key={i} to={createPageUrl(item.page)}
                    onClick={(e) => { handleNav(e, item.page); setFinansOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.6rem 0.85rem', borderRadius: '10px',
                      color: isActive ? '#c7d2fe' : 'rgba(255,255,255,0.75)',
                      textDecoration: 'none', fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                      background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Dersler alt menü popup */}
        {derslerOpen && (
          <>
            <div onClick={() => setDerslerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
            <div style={{
              position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px', padding: '0.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              minWidth: '160px',
            }}>
              {[
                { label: 'Öğrencilerim', icon: Users, page: 'TeacherStudents' },
                { label: 'Dersler', icon: BookOpen, page: 'TeacherLessons' },
                { label: 'Ödevler', icon: GraduationCap, page: 'TeacherHomework' },
                { label: 'Gelişim Raporları', icon: BarChart2, page: 'TeacherReports' },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = item.page === currentPageName;
                return (
                  <Link key={i} to={createPageUrl(item.page)}
                    onClick={(e) => { handleNav(e, item.page); setDerslerOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.6rem 0.85rem', borderRadius: '10px',
                      color: isActive ? '#c7d2fe' : 'rgba(255,255,255,0.75)',
                      textDecoration: 'none', fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                      background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* ── Alt tab bar ── */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 50,
          background: '#1a1a2e',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: '64px',
        }}>
          {TEACHER_MOBILE_NAV.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.submenu
              ? item.submenu.some(s => s === currentPageName)
              : item.financeSubmenu
              ? (currentPageName === 'TeacherFinance' || currentPageName === 'Page1')
              : item.page === currentPageName;
            const handleClick = (e) => {
              if (item.submenu) {
                e.preventDefault();
                setFinansOpen(false);
                setDerslerOpen(o => !o);
              } else if (item.financeSubmenu) {
                e.preventDefault();
                setDerslerOpen(false);
                setFinansOpen(o => !o);
              } else {
                setDerslerOpen(false);
                setFinansOpen(false);
                handleNav(e, item.page);
              }
            };

            const labelText = item.submenu || item.financeSubmenu
              ? item.label + ' ›'
              : item.label;

            return (
              <Link key={i}
                to={(item.submenu || item.financeSubmenu) ? '#' : createPageUrl(item.page)}
                onClick={handleClick}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem', flex: 1, height: '100%', cursor: 'pointer',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span style={{ fontSize: '0.62rem', fontWeight: isActive ? '700' : '400', whiteSpace: 'nowrap', letterSpacing: '0.1px' }}>
                  {labelText}
                </span>
              </Link>
            );
          })}
          {/* Profil butonu */}
          <button onClick={handleLogout}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.25rem', flex: 1, height: '100%', cursor: 'pointer',
              color: 'rgba(249,115,22,0.9)', background: 'none', border: 'none',
              transition: 'color 0.15s ease', fontSize: '0.62rem', fontWeight: '500',
            }}>
            {user?.full_name ? (
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(249,115,22,0.2)',
                border: '1.5px solid rgba(249,115,22,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#f97316',
              }}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <LogOut size={20} strokeWidth={1.75} />
            )}
            <span style={{ color: '#f97316', fontWeight: '600' }}>Profil</span>
          </button>
        </nav>

        {/* FAB */}
        {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
        <div className="app-fab" style={{ position: 'fixed', bottom: '5rem', right: '1rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          {fabOpen && FAB_ACTIONS_KEYS.map((a, i) => {
            const Icon = a.Icon;
            const handleClick = () => {
              if (a.action === 'lessonModal') setShowLessonModal(true);
              else if (a.action === 'paymentModal') setShowPaymentModal(true);
              else if (a.action === 'homeworkModal') navigate(createPageUrl('TeacherHomework') + '?openForm=true');
              setFabOpen(false);
            };
            return (
              <div key={i} onClick={handleClick} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <span style={{ background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>{t(a.labelKey)}</span>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Icon size={18} color={a.color} />
                </div>
              </div>
            );
          })}
          <button onClick={() => setFabOpen(o => !o)}
            style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'transform 0.25s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            <Plus size={22} color="white" />
          </button>
        </div>

        {showLessonModal && (
          <LessonModal
            students={fabStudents}
            defaultDate={new Date().toISOString().slice(0, 10)}
            onClose={() => setShowLessonModal(false)}
            onSaved={() => setShowLessonModal(false)}
          />
        )}
        {showPaymentModal && !selectedPayStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowPaymentModal(false)}>
            <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>Ödeme Al</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                {fabStudents.map(s => (
                  <button key={s.id} onClick={() => setSelectedPayStudent(s)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#111827', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}>{s.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {showPaymentModal && selectedPayStudent && (
          <PaymentModal
            student={selectedPayStudent}
            onClose={() => { setShowPaymentModal(false); setSelectedPayStudent(null); }}
            onSaved={() => { showToast({ message: `Ödeme alındı — ${selectedPayStudent.name}` }); setShowPaymentModal(false); setSelectedPayStudent(null); }}
          />
        )}
      </div>
    );
  }

  // ── Öğretmen: masaüstü → sidebar (değişmedi) ─────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <LoadingBar active={navigating} />

      <aside style={{
        width: sideW, flexShrink: 0,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 50, overflowX: 'hidden', overflowY: 'hidden', transition: 'width 0.2s ease',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {sidebarContent}
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

      <main style={{ marginLeft: sideW, flex: 1, minHeight: '100vh', overflow: 'auto', transition: 'margin-left 0.2s ease' }}>
        <div style={{ maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
          <PageTransition pageKey={currentPageName}>{children}</PageTransition>
        </div>
      </main>

      {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
      {showLessonModal && (
        <LessonModal
          students={fabStudents}
          defaultDate={new Date().toISOString().slice(0, 10)}
          onClose={() => setShowLessonModal(false)}
          onSaved={() => setShowLessonModal(false)}
        />
      )}
      {showPaymentModal && !selectedPayStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPaymentModal(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem' }}>Ödeme Al</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Öğrenci seçin</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
              {fabStudents.map(s => (
                <button key={s.id} onClick={() => setSelectedPayStudent(s)}
                  style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#111827', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showPaymentModal && selectedPayStudent && (
        <PaymentModal
          student={selectedPayStudent}
          onClose={() => { setShowPaymentModal(false); setSelectedPayStudent(null); }}
          onSaved={() => { showToast({ message: `Ödeme alındı — ${selectedPayStudent.name}` }); setShowPaymentModal(false); setSelectedPayStudent(null); }}
        />
      )}
      <div className="app-fab" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        {fabOpen && FAB_ACTIONS_KEYS.map((a, i) => {
          const Icon = a.Icon;
          const handleClick = () => {
            if (a.action === 'lessonModal') setShowLessonModal(true);
            else if (a.action === 'paymentModal') setShowPaymentModal(true);
            else if (a.action === 'homeworkModal') navigate(createPageUrl('TeacherHomework') + '?openForm=true');
            setFabOpen(false);
          };
          return (
            <div key={i} onClick={handleClick}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <span style={{ background: 'white', color: '#374151', fontSize: '0.82rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>{t(a.labelKey)}</span>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Icon size={18} color={a.color} />
              </div>
            </div>
          );
        })}
        <button onClick={() => setFabOpen(o => !o)}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'transform 0.25s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <Plus size={22} color="white" />
        </button>
      </div>
    </div>
  );
}