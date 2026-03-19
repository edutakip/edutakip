import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, addMonths, subMonths, subWeeks,
  isSameMonth, isSameDay, parseISO, isToday
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, User, BookOpen, MapPin, Video, Edit2, Calendar } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const STATUS = {
  planlandı:  { bg: '#4f46e5', light: '#eef2ff', text: 'white', label: 'Planlandı' },
  tamamlandı: { bg: '#10b981', light: '#ecfdf5', text: 'white', label: 'Tamamlandı' },
  iptal:      { bg: '#ef4444', light: '#fef2f2', text: 'white', label: 'İptal' },
};

const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

export default function TeacherCalendar() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [view, setView] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    ]);
    setLessons(l); setStudents(s);
  };

  const getLessonsForDay = (day) =>
    lessons
      .filter(l => { try { return isSameDay(parseISO(l.date), day); } catch { return false; } })
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const openAdd = (date, hour = null) => {
    setEditingLesson(null);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setShowModal(true);
  };

  const openEdit = (lesson, e) => {
    e.stopPropagation();
    setEditingLesson(lesson);
    setSelectedDate(lesson.date);
    setShowModal(true);
  };

  // ── Navigation ──────────────────────────────────────────────
  const navigate = (dir) => {
    if (view === 'daily') setCurrentDate(d => addDays(d, dir));
    else if (view === 'weekly') setCurrentDate(d => addWeeks(d, dir));
    else setCurrentDate(d => addMonths(d, dir));
  };

  const navLabel = () => {
    if (view === 'daily') return format(currentDate, 'd MMMM yyyy', { locale: tr });
    if (view === 'weekly') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, 'd MMM', { locale: tr })} – ${format(we, 'd MMM yyyy', { locale: tr })}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale: tr });
  };

  // ── Lesson Chip ─────────────────────────────────────────────
  const LessonChip = ({ lesson, compact = false }) => {
    const sc = STATUS[lesson.status] || STATUS['planlandı'];
    return (
      <div
        onClick={(e) => openEdit(lesson, e)}
        style={{
          background: sc.bg,
          borderRadius: compact ? 6 : 10,
          padding: compact ? '0.2rem 0.5rem' : '0.5rem 0.75rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: compact ? 'row' : 'column',
          gap: compact ? '0.3rem' : '0.25rem',
          alignItems: compact ? 'center' : 'flex-start',
          transition: 'opacity 0.15s, transform 0.15s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <div style={{ color: 'white', fontWeight: 700, fontSize: compact ? '0.7rem' : '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          {lesson.startTime} {lesson.studentName}
        </div>
        {!compact && lesson.subject && (
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>{lesson.subject}</div>
        )}
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
            {lesson.type === 'online' ? <Video size={10} color='rgba(255,255,255,0.7)' /> : <MapPin size={10} color='rgba(255,255,255,0.7)' />}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>{lesson.type === 'online' ? 'Online' : 'Yüz Yüze'}</span>
            <Edit2 size={10} color='rgba(255,255,255,0.6)' style={{ marginLeft: 'auto' }} />
          </div>
        )}
      </div>
    );
  };

  // ── Daily View ───────────────────────────────────────────────
  const DailyView = () => {
    const dayLessons = getLessonsForDay(currentDate);
    return (
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Day header */}
        <div style={{ background: isToday(currentDate) ? '#4f46e5' : '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: isToday(currentDate) ? 'white' : '#111827', fontWeight: 800, fontSize: '1.15rem' }}>
              {DAYS_TR[(currentDate.getDay() + 6) % 7]}
            </div>
            <div style={{ color: isToday(currentDate) ? 'rgba(255,255,255,0.75)' : '#9ca3af', fontSize: '0.82rem' }}>
              {dayLessons.length} ders planlandı
            </div>
          </div>
          <button onClick={() => openAdd(currentDate)}
            style={{ background: isToday(currentDate) ? 'rgba(255,255,255,0.2)' : '#4f46e5', border: 'none', color: 'white', borderRadius: 10, padding: '0.55rem 1rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={14} /> Ders Ekle
          </button>
        </div>
        {/* Time slots */}
        <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
          {HOURS.map(hour => {
            const hourLessons = dayLessons.filter(l => {
              try { return parseInt(l.startTime?.split(':')[0]) === hour; } catch { return false; }
            });
            return (
              <div key={hour} onClick={() => openAdd(currentDate, hour)}
                style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', minHeight: 64, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 64, flexShrink: 0, padding: '0.75rem 0.75rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {String(hour).padStart(2, '0')}:00
                </div>
                <div style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignContent: 'flex-start' }}>
                  {hourLessons.map(l => <LessonChip key={l.id} lesson={l} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Weekly View ──────────────────────────────────────────────
  const WeeklyView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return (
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Week day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ borderRight: '1px solid #f1f5f9' }} />
          {weekDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div key={i} onClick={() => openAdd(day)}
                style={{ padding: '0.85rem 0.5rem', textAlign: 'center', borderRight: i < 6 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', background: today ? '#eef2ff' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!today) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = today ? '#eef2ff' : 'transparent'; }}>
                <div style={{ color: '#9ca3af', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{DAYS_SHORT[i]}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: today ? '#4f46e5' : 'transparent', color: today ? 'white' : '#374151', fontWeight: today ? 800 : 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        {/* Time rows */}
        <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9', minHeight: 60 }}>
              <div style={{ padding: '0.6rem 0.5rem 0', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textAlign: 'right', borderRight: '1px solid #f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDays.map((day, di) => {
                const cellLessons = getLessonsForDay(day).filter(l => {
                  try { return parseInt(l.startTime?.split(':')[0]) === hour; } catch { return false; }
                });
                return (
                  <div key={di} onClick={() => openAdd(day, hour)}
                    style={{ padding: '0.3rem', borderRight: di < 6 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem', transition: 'background 0.1s', background: isToday(day) ? 'rgba(79,70,229,0.02)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = isToday(day) ? 'rgba(79,70,229,0.02)' : 'transparent'}>
                    {cellLessons.map(l => <LessonChip key={l.id} lesson={l} compact />)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Monthly View ─────────────────────────────────────────────
  const MonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = [];
    let d = calStart;
    while (d <= monthEnd || days.length % 7 !== 0) {
      days.push(d); d = addDays(d, 1);
      if (days.length > 42) break;
    }
    return (
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Day name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
          {DAYS_SHORT.map(n => (
            <div key={n} style={{ padding: '0.7rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>{n}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, i) => {
            const today = isToday(day);
            const inMonth = isSameMonth(day, currentDate);
            const dayLessons = getLessonsForDay(day);
            const isLastCol = (i + 1) % 7 === 0;
            const isLastRow = i >= days.length - 7;
            return (
              <div key={i} onClick={() => openAdd(day)}
                style={{ minHeight: 110, padding: '0.5rem', borderRight: isLastCol ? 'none' : '1px solid #f1f5f9', borderBottom: isLastRow ? 'none' : '1px solid #f1f5f9', cursor: 'pointer', background: today ? '#fffbeb' : 'transparent', transition: 'background 0.15s', position: 'relative' }}
                onMouseEnter={e => { if (!today) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = today ? '#fffbeb' : 'transparent'; }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: today ? '#4f46e5' : 'transparent', color: today ? 'white' : inMonth ? '#374151' : '#d1d5db', fontWeight: today ? 800 : 500, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  {format(day, 'd')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {dayLessons.slice(0, 3).map(l => <LessonChip key={l.id} lesson={l} compact />)}
                  {dayLessons.length > 3 && (
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', paddingLeft: '0.25rem', fontWeight: 600 }}>+{dayLessons.length - 3} daha</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', padding: '0.85rem 1.5rem', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
          {Object.entries(STATUS).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.bg }} />
              {v.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Sidebar: upcoming lessons ────────────────────────────────
  const upcoming = lessons
    .filter(l => { try { return parseISO(l.date) >= new Date() && l.status === 'planlandı'; } catch { return false; } })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .slice(0, 6);

  return (
    <div style={{ padding: '1.75rem', minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '1.55rem', fontWeight: 800, lineHeight: 1.2 }}>Takvim</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.25rem' }}>Derslerini planla ve yönet</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            {[['daily', 'Günlük'], ['weekly', 'Haftalık'], ['monthly', 'Aylık']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '0.5rem 0.9rem', border: 'none', background: view === v ? '#4f46e5' : 'transparent', color: view === v ? 'white' : '#6b7280', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.25rem 0.6rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.2rem', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#374151', fontWeight: 700, fontSize: '0.85rem', minWidth: 160, textAlign: 'center' }}>{navLabel()}</span>
            <button onClick={() => navigate(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.2rem', borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => setCurrentDate(new Date())}
            style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#4f46e5', borderRadius: 10, padding: '0.5rem 0.85rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            Bugün
          </button>
          {/* Add lesson */}
          <button onClick={() => openAdd(currentDate)}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 10, padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
            <Plus size={15} /> Ders Ekle
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Calendar */}
        <div>
          {view === 'daily' && <DailyView />}
          {view === 'weekly' && <WeeklyView />}
          {view === 'monthly' && <MonthlyView />}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Stats */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1rem' }}>
            <h3 style={{ color: '#374151', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Genel Bakış</h3>
            {[
              { label: 'Toplam Ders', value: lessons.length, color: '#4f46e5' },
              { label: 'Planlandı', value: lessons.filter(l => l.status === 'planlandı').length, color: '#4f46e5' },
              { label: 'Tamamlandı', value: lessons.filter(l => l.status === 'tamamlandı').length, color: '#10b981' },
              { label: 'İptal', value: lessons.filter(l => l.status === 'iptal').length, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{label}</span>
                <span style={{ color, fontWeight: 800, fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1rem' }}>
            <h3 style={{ color: '#374151', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color='#4f46e5' /> Yaklaşan Dersler
            </h3>
            {upcoming.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center', padding: '0.75rem 0' }}>Planlanmış ders yok</p>}
            {upcoming.map(l => (
              <div key={l.id} onClick={(e) => openEdit(l, e)}
                style={{ padding: '0.65rem', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ color: '#374151', fontWeight: 700, fontSize: '0.8rem' }}>{l.studentName}</div>
                  <Edit2 size={11} color='#9ca3af' />
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.2rem', display: 'flex', gap: '0.5rem' }}>
                  <span>{l.date}</span>
                  <span>{l.startTime}</span>
                </div>
                {l.subject && <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '0.15rem' }}>{l.subject}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <LessonModal
          students={students}
          defaultDate={selectedDate}
          existingLesson={editingLesson}
          onClose={() => { setShowModal(false); setEditingLesson(null); }}
          onSaved={() => { setShowModal(false); setEditingLesson(null); loadData(); }}
        />
      )}
    </div>
  );
}