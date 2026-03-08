import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Video, MapPin } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

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

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = [];
  let d = calStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length > 42) break;
  }

  const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.2rem', minWidth: '160px', textAlign: 'center' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: tr })}
          </h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())}
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            Bugün
          </button>
        </div>
        <button onClick={() => { setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setShowModal(true); }}
          style={{ background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Ders Ekle
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Day names */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DAY_NAMES.map(n => (
            <div key={n} style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{n}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayLessons = getLessonsForDay(day);
            return (
              <div key={i} onClick={() => { setSelectedDate(format(day, 'yyyy-MM-dd')); setShowModal(true); }}
                style={{ minHeight: '90px', padding: '0.5rem', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? 'white' : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isToday ? '700' : '500', fontSize: '0.85rem', marginBottom: '0.3rem',
                }}>{format(day, 'd')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {dayLessons.slice(0, 3).map(l => (
                    <div key={l.id} style={{
                      background: l.type === 'online' ? 'rgba(37,99,235,0.15)' : 'rgba(124,58,237,0.15)',
                      borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.7rem',
                      color: l.type === 'online' ? 'var(--info)' : 'var(--purple)',
                      fontWeight: '600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      display: 'flex', alignItems: 'center', gap: '0.2rem',
                    }}>
                      {l.type === 'online' ? <Video size={9} /> : <MapPin size={9} />}
                      {l.studentName}
                    </div>
                  ))}
                  {dayLessons.length > 3 && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: '0.4rem' }}>+{dayLessons.length - 3} daha</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <LessonModal students={students} defaultDate={selectedDate} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}