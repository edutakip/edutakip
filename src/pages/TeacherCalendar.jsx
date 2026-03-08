import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const STATUS_COLOR = {
  planlandı: { bg: '#3b82f6', text: 'white' },
  tamamlandı: { bg: '#10b981', text: 'white' },
  iptal: { bg: '#ef4444', text: 'white' },
};

const DAY_NAMES = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];

export default function TeacherCalendar() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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
    lessons.filter(l => { try { return isSameDay(parseISO(l.date), day); } catch { return false; } });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const days = [];
  let d = calStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setShowModal(true);
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.2 }}>Takvim</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>Ders planlamak için bir güne tıklayın</p>
        </div>
        <button
          onClick={() => { setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setShowModal(true); }}
          style={{ background: '#10b981', border: 'none', color: 'white', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          <Plus size={16} /> Ders Planla
        </button>
      </div>

      {/* Calendar card */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.3rem', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: tr }).replace(/\b\w/g, c => c.toUpperCase())}
          </h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.3rem', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day names */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
          {DAY_NAMES.map(n => (
            <div key={n} style={{ padding: '0.65rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.5px' }}>{n}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayLessons = getLessonsForDay(day);
            const isLastCol = (i + 1) % 7 === 0;
            const isLastRow = i >= days.length - 7;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                style={{
                  minHeight: '100px',
                  padding: '0.5rem',
                  borderRight: isLastCol ? 'none' : '1px solid #f1f5f9',
                  borderBottom: isLastRow ? 'none' : '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: isToday ? '#f0fdf4' : 'transparent',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? '#f0fdf4' : 'transparent'; }}
              >
                {/* Date number */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? '#10b981' : 'transparent',
                  color: isToday ? 'white' : isCurrentMonth ? '#374151' : '#cbd5e1',
                  fontWeight: isToday ? '700' : '500',
                  fontSize: '0.85rem',
                  marginBottom: '0.3rem',
                }}>
                  {format(day, 'd')}
                </div>

                {/* Lesson chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {dayLessons.slice(0, 3).map(l => {
                    const sc = STATUS_COLOR[l.status] || STATUS_COLOR['planlandı'];
                    return (
                      <div key={l.id} style={{
                        background: sc.bg,
                        borderRadius: '5px',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        color: sc.text,
                        fontWeight: '600',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}>
                        {l.startTime} {l.studentName}
                      </div>
                    );
                  })}
                  {dayLessons.length > 3 && (
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', paddingLeft: '0.25rem' }}>+{dayLessons.length - 3} daha</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', padding: '0.85rem 1.5rem', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
          {[['#3b82f6', 'Planlandı'], ['#10b981', 'Tamamlandı'], ['#ef4444', 'İptal']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <LessonModal students={students} defaultDate={selectedDate} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}