import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00

export default function TeacherDashboard() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    loadData();
  }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    ]);
    setLessons(l); setStudents(s);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getLessonsForSlot = (day, hour) => {
    return lessons.filter(l => {
      if (!l.date || !l.startTime) return false;
      try {
        const lDate = parseISO(l.date);
        const lHour = parseInt(l.startTime.split(':')[0]);
        return isSameDay(lDate, day) && lHour === hour;
      } catch { return false; }
    });
  };

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem' }}>
            {format(weekStart, 'd MMM', { locale: tr })} – {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: tr })}
          </span>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            Bugün
          </button>
        </div>
        <button onClick={() => { setModalDate(format(new Date(), 'yyyy-MM-dd')); setShowModal(true); }}
          style={{ background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Ders Ekle
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', borderRight: '1px solid var(--border)' }} />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} style={{ padding: '0.75rem', textAlign: 'center', borderRight: i < 6 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{dayNames[i]}</div>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0.25rem auto 0',
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? 'white' : 'var(--text-primary)',
                  fontWeight: isToday ? '700' : '500', fontSize: '0.9rem',
                }}>{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div style={{ maxHeight: 'calc(100vh - 230px)', overflowY: 'auto' }}>
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border)', minHeight: '60px' }}>
              <div style={{ padding: '0.4rem 0.5rem', borderRight: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem', paddingTop: '0.5rem', textAlign: 'right' }}>
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDays.map((day, di) => {
                const dayLessons = getLessonsForSlot(day, hour);
                return (
                  <div key={di} style={{ borderRight: di < 6 ? '1px solid var(--border)' : 'none', padding: '0.2rem', minHeight: '60px', cursor: 'pointer', position: 'relative' }}
                    onClick={() => { setModalDate(format(day, 'yyyy-MM-dd')); setShowModal(true); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {dayLessons.map(lesson => (
                      <div key={lesson.id} style={{
                        background: lesson.type === 'online' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)',
                        border: `1px solid ${lesson.type === 'online' ? 'var(--info)' : 'var(--danger)'}`,
                        borderRadius: '6px', padding: '0.25rem 0.4rem',
                        fontSize: '0.72rem', color: 'var(--text-primary)',
                        marginBottom: '0.2rem', cursor: 'pointer',
                      }}>
                        <div style={{ fontWeight: '600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{lesson.studentName}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{lesson.startTime} – {lesson.endTime}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <LessonModal students={students} defaultDate={modalDate} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}