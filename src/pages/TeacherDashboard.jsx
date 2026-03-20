import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isToday, isTomorrow, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Users, CalendarCheck, CheckCircle, DollarSign, ChevronRight, MessageCircle, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import LessonModal from '../components/teacher/LessonModal';
import PendingLessonsPrompt from '../components/teacher/PendingLessonsPrompt';

export default function TeacherDashboard() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s, p] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
      base44.entities.Payment.filter({ teacherEmail: me.email }),
    ]);
    setLessons(l); setStudents(s); setPayments(p);
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
      if (isToday(d)) return 'Bugün';
      if (isTomorrow(d)) return 'Yarın';
      return format(d, 'EEE, d MMM', { locale: tr });
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
  const getBriefing = () => {
    const hour = new Date().getHours();
    const firstName = ''; // kullanıcı adı varsa buraya
    const todayCount = todayLessons.length;
    const firstLesson = todayLessons.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))[0];
    const unpaidCount = studentBalances.length;
    const tomorrowLessons = lessons.filter(l => {
      try { return isTomorrow(parseISO(l.date)) && l.status !== 'iptal'; } catch { return false; }
    });

    if (hour >= 5 && hour < 12) {
      // Sabah
      if (todayCount === 0) return { greeting: 'Günaydın! ☀️', message: 'Bugün planlanmış dersiniz yok.', sub: unpaidCount > 0 ? `${unpaidCount} öğrencinizin bekleyen ödemesi var.` : 'Harika bir gün olsun!', color: '#f97316', gradient: 'linear-gradient(135deg, #fff7ed, #ffedd5)' };
      return { greeting: 'Günaydın! ☀️', message: `Bugün ${todayCount} dersiniz var${firstLesson ? `, ilki saat ${firstLesson.startTime?.slice(0,5)}'de` : ''}.`, sub: unpaidCount > 0 ? `${unpaidCount} öğrencinizin bekleyen ödemesi bulunuyor.` : 'Tüm ödemeler güncel, harika!', color: '#f97316', gradient: 'linear-gradient(135deg, #fff7ed, #ffedd5)' };
    } else if (hour >= 12 && hour < 18) {
      // Öğle
      const remaining = todayLessons.filter(l => (l.startTime || '') > format(new Date(), 'HH:mm'));
      if (remaining.length === 0) return { greeting: 'İyi öğleler! 🌤', message: 'Bugünkü derslerinizi tamamladınız.', sub: tomorrowLessons.length > 0 ? `Yarın ${tomorrowLessons.length} dersiniz var.` : 'Yarın için planlanmış ders yok.', color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' };
      return { greeting: 'İyi öğleler! 🌤', message: `Bugün ${remaining.length} dersiniz kaldı.`, sub: `Bu ay toplam ${completedThisMonth} ders tamamladınız.`, color: '#6366f1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' };
    } else {
      // Akşam
      const completedToday = todayLessons.filter(l => l.status === 'tamamlandı').length;
      return { greeting: 'İyi akşamlar! 🌙', message: completedToday > 0 ? `Bugün ${completedToday} ders tamamladınız.` : 'Bugünkü dersler bitti.', sub: tomorrowLessons.length > 0 ? `Yarın ${tomorrowLessons.length} dersiniz var, hazır olun!` : 'Yarın için planlanmış ders yok, dinlenin!', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' };
    }
  };

  const briefing = getBriefing();
  const avatarColors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
  const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length] || '#fbbf24';

  const statCards = [
    { label: 'Aktif Öğrenci', value: activeStudents, icon: Users, iconColor: '#0ea5e9', iconBg: '#e0f2fe' },
    { label: 'Bugünkü Dersler', value: todayLessons.length, icon: CalendarCheck, iconColor: '#6366f1', iconBg: '#eef2ff' },
    { label: 'Bu Ay Tamamlanan', value: completedThisMonth, icon: CheckCircle, iconColor: '#10b981', iconBg: '#d1fae5' },
    { label: 'Ödenmemiş Bakiye', value: `₺${totalUnpaid.toLocaleString('tr-TR')}`, icon: DollarSign, iconColor: '#f59e0b', iconBg: '#fef3c7' },
  ];

  return (
    <div style={{ padding: '2rem', height: '100vh', overflowY: 'auto', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Genel Bakış</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: tr })}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ders Ekle
        </button>
      </div>

      {/* ── Now Brief ────────────────────────────────────── */}
      <div style={{ background: briefing.gradient, borderRadius: 20, padding: '1.5rem 1.75rem', marginBottom: '1.5rem', border: `1.5px solid ${briefing.color}22`, position: 'relative', overflow: 'hidden' }}>
        {/* Dekoratif daire */}
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: briefing.color + '12' }} />
        <div style={{ position: 'absolute', right: 40, bottom: -40, width: 100, height: 100, borderRadius: '50%', background: briefing.color + '08' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: briefing.color, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: briefing.color, textTransform: 'uppercase', letterSpacing: '1px' }}>Günün Özeti</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827', marginBottom: '0.4rem' }}>{briefing.greeting}</h2>
          <p style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600', marginBottom: '0.25rem' }}>{briefing.message}</p>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' }}>{briefing.sub}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Upcoming Lessons */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>Yaklaşan Dersler</h2>
            <Link to={createPageUrl('TeacherCalendar')} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#6366f1', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
              Tümü <ChevronRight size={14} />
            </Link>
          </div>
          {upcomingLessons.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Yaklaşan ders yok</p>
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
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>Ödenmemiş Bakiyeler</h2>
            <Link to={createPageUrl('TeacherFinance')} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
              Tümü <ChevronRight size={14} />
            </Link>
          </div>
          {studentBalances.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Ödenmemiş bakiye yok 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {studentBalances.map(({ student, balance }, i) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < studentBalances.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatarColor(student.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'white' }}>{getInitials(student.name)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{student.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>{format(new Date(), 'MMMM yyyy', { locale: tr })}</div>
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

      {showModal && (
        <LessonModal students={students} defaultDate={format(new Date(), 'yyyy-MM-dd')} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
      <PendingLessonsPrompt onDone={loadData} />
    </div>
  );
}