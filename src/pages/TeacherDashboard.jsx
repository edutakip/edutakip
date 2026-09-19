import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isToday, isTomorrow, differenceInMinutes } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Users, CalendarCheck, CheckCircle, DollarSign, ChevronRight, MessageCircle, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import LessonModal from '../components/teacher/LessonModal';
import PendingLessonsPrompt from '../components/teacher/PendingLessonsPrompt';
import TodayLessonPrepPrompt from '../components/teacher/TodayLessonPrepPrompt';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StudentLeaderboard from '../components/gamification/StudentLeaderboard';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : enUS;
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(() => parseInt(localStorage.getItem('monthlyGoal') || '20'));
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showLessonPrep, setShowLessonPrep] = useState(false);
  const isMobile = windowWidth < 640;

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const [l, s, p] = await Promise.all([
        base44.entities.Lesson.filter({ teacherEmail: me.email }),
        base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
        base44.entities.Payment.filter({ teacherEmail: me.email }),
      ]);
      setLessons(l);
      setStudents(s);
      setPayments(p);
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  };

  // Stats
  const activeStudents = students.length;

  const todayLessons = lessons.filter(l => {
    try { return isToday(parseISO(l.date)) && l.status !== 'iptal'; } catch { return false; }
  });

  const thisMonth = format(new Date(), 'yyyy-MM');
  const completedThisMonth = lessons.filter(l => {
    try { return l.date?.startsWith(thisMonth) && l.status === 'tamamlandı'; } catch { return false; }
  }).length;

  // Unpaid balance per student — TeacherFinance ile birebir aynı mantık
  const studentBalances = students.map(s => {
    const debt = payments
      .filter(p => p.studentId === s.id && (p.status === 'bekliyor' || p.status === 'gecikmiş'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const collected = payments
      .filter(p => p.studentId === s.id && p.status === 'alındı')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = Math.max(0, debt - collected);
    return { student: s, balance };
  }).filter(x => x.balance > 0);

  const totalUnpaid = studentBalances.reduce((sum, x) => sum + x.balance, 0);

  // Upcoming lessons sorted
  const upcomingLessons = lessons
    .filter(l => { try { return parseISO(l.date) >= new Date(new Date().setHours(0,0,0,0)) && l.status !== 'iptal'; } catch { return false; } })
    .sort((a, b) => {
      const da = new Date(`${a.date}T${a.startTime || '00:00'}`);
      const db = new Date(`${b.date}T${b.startTime || '00:00'}`);
      return da - db;
    })
    .slice(0, 5);

  const getDayLabel = (dateStr) => {
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return t('teacher.lessons.today');
      if (isTomorrow(d)) return t('teacher.dashboard.tomorrow');
      return format(d, 'EEE, d MMM', { locale: dateLocale });
    } catch { return dateStr; }
  };

  const getDuration = (start, end) => {
    if (!start || !end) return null;
    try {
      const s = new Date(`2000-01-01T${start}`);
      const e = new Date(`2000-01-01T${end}`);
      const mins = differenceInMinutes(e, s);
      return mins > 0 ? `${mins}dk` : null;
    } catch { return null; }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // ── Now Brief ────────────────────────────────────────────────
  const [briefSlide, setBriefSlide] = React.useState(0);
  const [briefVisible, setBriefVisible] = React.useState(true);

  const tomorrowLessons = lessons.filter(l => {
    try { return isTomorrow(parseISO(l.date)) && l.status !== 'iptal'; } catch { return false; }
  });

  const completedToday = todayLessons.filter(l => l.status === 'tamamlandı').length;
  const remainingToday = todayLessons.filter(l => (l.startTime || '') > format(new Date(), 'HH:mm') && l.status !== 'iptal');
  const firstLesson = [...todayLessons].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))[0];
  const nextLesson = remainingToday[0];
  const thisWeekLessons = lessons.filter(l => {
    try {
      const d = parseISO(l.date);
      const now = new Date();
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
      return d >= weekStart && d <= weekEnd && l.status === 'tamamlandı';
    } catch { return false; }
  }).length;

  const hour = new Date().getHours();
  const timeOfDay = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : 'evening';

  const greetings = { morning: t('teacher.dashboard.morning'), afternoon: t('teacher.dashboard.afternoon'), evening: t('teacher.dashboard.evening') };
  const colors = { morning: { primary: '#f97316', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #1a1035 100%)', accent: '#fb923c' }, afternoon: { primary: '#6366f1', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f1035 100%)', accent: '#818cf8' }, evening: { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #0f0f1a 0%, #1a1035 60%, #1a0f2e 100%)', accent: '#a78bfa' } };
  const theme = colors[timeOfDay];

  const briefCards = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      title: t('teacher.dashboard.today'),
      main: todayLessons.length === 0 ? t('teacher.dashboard.noLesson') : `${todayLessons.length} ${t('teacher.dashboard.lessons')}`,
      detail: nextLesson ? `Sıradaki: ${nextLesson.startTime?.slice(0,5)} — ${nextLesson.studentName}` : completedToday > 0 ? `${completedToday} ${t('teacher.dashboard.lessonsCompleted')}` : firstLesson ? `${t('teacher.dashboard.firstLesson')} ${firstLesson.startTime?.slice(0,5)}'de` : t('teacher.dashboard.noLessonsToday'),
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: t('teacher.dashboard.students'),
      main: `${students.length} ${t('teacher.dashboard.active')}`,
      detail: studentBalances.length > 0 ? `${studentBalances.length} ${t('teacher.dashboard.pendingPayment')}` : t('teacher.dashboard.allPaymentsCurrent'),
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      title: t('teacher.dashboard.thisWeek'),
      main: `${thisWeekLessons} ${t('teacher.dashboard.lessons')}`,
      detail: `Bu ay ${completedThisMonth} ${t('teacher.dashboard.lessonsCompleted')}`,
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      title: t('teacher.dashboard.pending'),
      main: `₺${totalUnpaid.toLocaleString('tr-TR')}`,
      detail: studentBalances.length > 0 ? `${studentBalances.length} ${t('teacher.dashboard.toCollect')}` : t('teacher.dashboard.noPendingPayment'),
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      title: t('teacher.dashboard.tomorrow'),
      main: tomorrowLessons.length === 0 ? t('teacher.dashboard.noLesson') : `${tomorrowLessons.length} ${t('teacher.dashboard.lessons')}`,
      detail: tomorrowLessons[0] ? `${t('teacher.dashboard.firstLessonTomorrow')}: ${tomorrowLessons.sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))[0].startTime?.slice(0,5)} — ${tomorrowLessons[0].studentName}` : t('teacher.dashboard.restDay'),
    },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBriefVisible(false);
      setTimeout(() => {
        setBriefSlide(s => (s + 1) % briefCards.length);
        setBriefVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [briefCards.length]);
  const avatarColors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
  const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length] || '#fbbf24';

  // Ders hazırlık popup'ını göster
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const isDismissed = localStorage.getItem(`lessonPrepDismissed_${today}`);
    if (!isDismissed && todayLessons.length > 0) {
      setTimeout(() => setShowLessonPrep(true), 500);
    }
  }, [todayLessons.length]);

  const statCards = [
    { label: t('teacher.dashboard.activeStudents'), value: activeStudents, icon: Users, iconColor: '#0ea5e9', iconBg: '#e0f2fe', page: 'TeacherStudents' },
    { label: t('teacher.dashboard.todayLessons'), value: todayLessons.length, icon: CalendarCheck, iconColor: '#6366f1', iconBg: '#eef2ff', page: 'TeacherCalendar' },
    { label: t('teacher.dashboard.completedThisMonth'), value: completedThisMonth, icon: CheckCircle, iconColor: '#10b981', iconBg: '#d1fae5', page: 'TeacherLessons' },
    { label: t('teacher.dashboard.unpaidBalance'), value: `₺${totalUnpaid.toLocaleString('tr-TR')}`, icon: DollarSign, iconColor: '#f59e0b', iconBg: '#fef3c7', page: 'TeacherFinance' },
  ];

  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem', height: '100vh', overflowY: 'auto', background: '#ffffffff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.8rem' : 0, marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>{t('teacher.dashboard.title')}</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: dateLocale })}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: isMobile ? '100%' : 'auto' }}>
          <LanguageSwitcher />
        <button onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
          <Plus size={16} /> {t('teacher.dashboard.addLesson')}
        </button>
        </div>
      </div>

      {/* ── Now Brief ────────────────────────────────────── */}
      <div style={{ background: theme.gradient, borderRadius: isMobile ? 16 : 20, padding: isMobile ? '1rem' : '1.5rem 1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${theme.primary}30` }}>
        <style>{`
          @keyframes briefFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes briefFadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
          @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>

        {/* Dekoratif arka plan */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: theme.primary + '18', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -50, width: 120, height: 120, borderRadius: '50%', background: theme.accent + '12', animation: 'float 8s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', left: -20, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: theme.primary + '10' }} />

        {isMobile ? (
          <div style={{ position: 'relative' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '0.85rem 0.9rem', animation: briefVisible ? 'briefFadeIn 0.4s ease forwards' : 'briefFadeOut 0.4s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
                {briefCards[briefSlide].icon}
                <span style={{ fontSize: '0.66rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {briefCards[briefSlide].title}
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', marginBottom: '0.15rem', lineHeight: 1.2 }}>
                {briefCards[briefSlide].main}
              </div>
              <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.65)', fontWeight: '500', lineHeight: 1.4 }}>
                {briefCards[briefSlide].detail}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '0.65rem' }}>
              {briefCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setBriefVisible(false); setTimeout(() => { setBriefSlide(i); setBriefVisible(true); }, 300); }}
                  style={{ width: i === briefSlide ? 16 : 6, height: 6, borderRadius: 999, border: 'none', background: i === briefSlide ? theme.accent : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                />
              ))}
            </div>
          </div>
        ) : (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Sol: Selam + saat */}
          <div style={{ flexShrink: 0, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, animation: 'shimmer 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: theme.accent, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t('teacher.dashboard.dailySummary')}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem', lineHeight: 1.2 }}>
              {greetings[timeOfDay]}!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
              {format(new Date(), 'EEEE, d MMMM', { locale: dateLocale })} · {format(new Date(), 'HH:mm')}
            </p>
          </div>

          {/* Dikey ayraç */}
          <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />



          {/* Sağ: Özet metin */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.95rem', color: 'white', fontWeight: '600', marginBottom: '0.4rem', lineHeight: 1.5 }}>
              {todayLessons.length > 0
                ? `${t('teacher.dashboard.today')} ${todayLessons.length} ${t('teacher.dashboard.lessons')}${firstLesson ? `, ${t('teacher.dashboard.firstLesson')} ${firstLesson.startTime?.slice(0,5)}'de.` : '.'}`
                : t('teacher.dashboard.noLessonsTodayDesc')}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: '500', lineHeight: 1.5 }}>
              {studentBalances.length > 0
                ? t('teacher.dashboard.pendingPaymentsDesc').replace('{{count}}', studentBalances.length)
                : t('teacher.dashboard.allPaymentsCurrentDesc')}
            </p>
          </div>

          {/* Dikey ayraç */}
          <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />

          {/* Animasyonlu kart */}
          <div style={{ minWidth: 220, animation: briefVisible ? 'briefFadeIn 0.4s ease forwards' : 'briefFadeOut 0.4s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              {briefCards[briefSlide].icon}
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{briefCards[briefSlide].title}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', marginBottom: '0.15rem', lineHeight: 1.2 }}>{briefCards[briefSlide].main}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>{briefCards[briefSlide].detail}</div>
          </div>

          {/* Nokta göstergeler */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
            {briefCards.map((_, i) => (
              <div key={i} onClick={() => { setBriefVisible(false); setTimeout(() => { setBriefSlide(i); setBriefVisible(true); }, 300); }}
                style={{ width: i === briefSlide ? 6 : 4, height: i === briefSlide ? 20 : 6, borderRadius: 10, background: i === briefSlide ? theme.accent : 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i}
              onClick={() => navigate(createPageUrl(card.page))}
              style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.18s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${card.iconColor}22`; e.currentTarget.style.borderColor = card.iconColor + '44'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} color={card.iconColor} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', lineHeight: 1, marginBottom: '0.4rem' }}>{card.value}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.82rem', fontWeight: '500' }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>

        {/* Upcoming Lessons */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{t('teacher.dashboard.upcomingLessons')}</h2>
            <Link to={createPageUrl('TeacherCalendar')} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#6366f1', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
              {t('teacher.dashboard.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>
          {upcomingLessons.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>{t('teacher.dashboard.noUpcomingLessons')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {upcomingLessons.map(lesson => {
                const duration = getDuration(lesson.startTime, lesson.endTime);
                return (
                  <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ textAlign: 'center', minWidth: '40px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#374151' }}>{lesson.startTime?.slice(0, 5)}</div>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', margin: '4px auto 0' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{lesson.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                        {lesson.subject && `${lesson.subject} · `}{getDayLabel(lesson.date)}
                      </div>
                    </div>
                    {duration && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                        {duration}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unpaid Balances */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{t('teacher.dashboard.unpaidBalances')}</h2>
            <Link to={createPageUrl('TeacherFinance')} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
              {t('teacher.dashboard.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>
          {studentBalances.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>{t('teacher.dashboard.noUnpaidBalance')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {studentBalances.map(({ student, balance }, i) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < studentBalances.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatarColor(student.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'white' }}>{getInitials(student.name)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{student.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>{format(new Date(), 'MMMM yyyy', { locale: dateLocale })}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f59e0b' }}>₺{balance.toLocaleString('tr-TR')}</span>
                    <MessageCircle size={16} color='#d1d5db' />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Hedef Takibi ─────────────────────────────────── */}
      {(() => {
        const pct = Math.min(Math.round((completedThisMonth / monthlyGoal) * 100), 100);
        const remaining = Math.max(monthlyGoal - completedThisMonth, 0);
        const isAchieved = completedThisMonth >= monthlyGoal;

        return (
          <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.2rem' }}>{t('teacher.dashboard.monthlyGoal')}</h2>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{format(new Date(), 'MMMM yyyy', { locale: dateLocale })}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isAchieved && (
                  <span style={{ background: '#d1fae5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 20 }}>
                    {t('teacher.dashboard.goalAchieved')}
                  </span>
                )}
                {editingGoal ? (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="number" value={goalInput}
                      onChange={e => setGoalInput(e.target.value)}
                      style={{ width: 70, padding: '0.35rem 0.5rem', borderRadius: 8, border: '1.5px solid #6366f1', fontSize: '0.85rem', fontWeight: 700, color: '#111827', outline: 'none', textAlign: 'center' }}
                      autoFocus
                    />
                    <button onClick={() => {
                      const val = parseInt(goalInput);
                      if (val > 0) { setMonthlyGoal(val); localStorage.setItem('monthlyGoal', val); }
                      setEditingGoal(false);
                    }} style={{ background: '#6366f1', border: 'none', color: 'white', borderRadius: 8, padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      {t('teacher.dashboard.save')}
                    </button>
                    <button onClick={() => setEditingGoal(false)}
                      style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 8, padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      {t('teacher.dashboard.cancel')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setGoalInput(String(monthlyGoal)); setEditingGoal(true); }}
                    style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    {t('teacher.dashboard.editGoal')}
                  </button>
                )}
              </div>
            </div>

            {/* İstatistikler */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: t('teacher.dashboard.completed'), value: completedThisMonth, color: '#6366f1' },
                { label: t('teacher.dashboard.goal'), value: monthlyGoal, color: '#374151' },
                { label: t('teacher.dashboard.remaining'), value: remaining, color: remaining === 0 ? '#10b981' : '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{completedThisMonth} / {monthlyGoal} {t('teacher.dashboard.lessons')}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isAchieved ? '#10b981' : '#6366f1' }}>{pct}%</span>
              </div>
              <div style={{ height: 12, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 10,
                  background: isAchieved
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : pct >= 70
                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                    : pct >= 40
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #f97316, #fb923c)',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isAchieved ? '0 0 8px rgba(16,185,129,0.4)' : '0 0 8px rgba(99,102,241,0.3)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                {[0, 25, 50, 75, 100].map(mark => (
                  <span key={mark} style={{ fontSize: '0.65rem', color: pct >= mark ? '#6366f1' : '#d1d5db', fontWeight: 600 }}>{mark}%</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Leaderboard ─────────────────────────────────── */}
      <div style={{ marginTop: '1.25rem' }}>
        <StudentLeaderboard />
      </div>

      {showModal && (
        <LessonModal students={students} defaultDate={format(new Date(), 'yyyy-MM-dd')} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
      <PendingLessonsPrompt onDone={loadData} />
      {showLessonPrep && <TodayLessonPrepPrompt onClose={() => setShowLessonPrep(false)} />}
    </div>
  );
}