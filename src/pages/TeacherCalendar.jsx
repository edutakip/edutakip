import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  format, startOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, parseISO, isToday
} from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Video, MapPin,
  Edit2, X, Check, Clock, DollarSign, Trash2, ExternalLink, Copy
} from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const STATUS_CFG = {
  planlandı:  { bg: '#4f46e5', label: 'Planlandı',   dot: '#818cf8' },
  tamamlandı: { bg: '#10b981', label: 'Tamamlandı',  dot: '#34d399' },
  iptal:      { bg: '#ef4444', label: 'İptal',        dot: '#f87171' },
};

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07–21
const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── Ders Detay Paneli ─────────────────────────────────────────
function LessonDetailPanel({ lesson, students, onClose, onEdit, onDeleted, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const sc = STATUS_CFG[lesson.status] || STATUS_CFG['planlandı'];
  const student = students.find(s => s.id === lesson.studentId);

  const handleDelete = async () => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    await base44.entities.Lesson.delete(lesson.id);
    setLoading(false);
    onDeleted();
  };

  const handleStatus = async (status) => {
    setLoading(true);
    await base44.entities.Lesson.update(lesson.id, { status });
    setLoading(false);
    onStatusChange(lesson.id, status);
  };

  const copyLink = () => {
    if (lesson.meetingLink) {
      navigator.clipboard.writeText(lesson.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const dateObj = lesson.date ? parseISO(lesson.date) : null;
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dateLabel = dateObj
    ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} ${dayNames[dateObj.getDay()]}`
    : lesson.date;

  return (
    <div style={{
      background: '#1a1f35',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
            <span style={{ color: sc.dot, fontSize: '0.7rem', fontWeight: 700 }}>
              {lesson.startTime?.slice(0, 5)} - {lesson.endTime?.slice(0, 5)} · {sc.label}
            </span>
          </div>
          <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.studentName}
          </h3>
          {lesson.subject && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{lesson.subject}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, marginLeft: '0.5rem' }}>
          <button onClick={onEdit}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit2 size={13} />
          </button>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Status Buttons */}
      <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'tamamlandı', label: 'Tamamlandı', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
          { key: 'planlandı',  label: 'Planlandı',  color: '#818cf8', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)' },
          { key: 'iptal',      label: 'İptal',       color: '#f87171', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)' },
        ].map(s => (
          <button key={s.key} onClick={() => handleStatus(s.key)} disabled={loading}
            style={{
              flex: 1, padding: '0.45rem 0.5rem', borderRadius: 10, border: `1.5px solid ${lesson.status === s.key ? s.border : 'rgba(255,255,255,0.1)'}`,
              background: lesson.status === s.key ? s.bg : 'transparent',
              color: lesson.status === s.key ? s.color : 'rgba(255,255,255,0.4)',
              fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Details */}
      <div style={{ padding: '0.85rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>

        {/* Tarih */}
        <div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Tarih</div>
          <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>{dateLabel}</div>
        </div>

        {/* Saat */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Başlangıç</div>
            <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>{lesson.startTime?.slice(0,5)}</div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Bitiş</div>
            <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>{lesson.endTime?.slice(0,5)}</div>
          </div>
          {lesson.duration && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Süre</div>
              <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>{lesson.duration} dk</div>
            </div>
          )}
        </div>

        {/* Ücret */}
        {(lesson.lessonFee || student?.feePerLesson) && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Ücret</div>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={13} color='#34d399' />
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.88rem' }}>
                {lesson.lessonFee || student?.feePerLesson} ₺
              </span>
            </div>
          </div>
        )}

        {/* Tür */}
        <div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Ders Türü</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {lesson.type === 'online'
              ? <><Video size={13} color='#818cf8' /><span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>Online Ders</span></>
              : <><MapPin size={13} color='#fb923c' /><span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>Yüz Yüze</span></>
            }
          </div>
        </div>

        {/* Online link */}
        {lesson.type === 'online' && lesson.meetingLink && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Toplantı Linki</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <a href={lesson.meetingLink} target='_blank' rel='noreferrer'
                style={{ flex: 1, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '0.45rem 0.75rem', color: '#a5b4fc', fontSize: '0.75rem', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ExternalLink size={11} /> {lesson.meetingLink.replace('https://', '')}
              </a>
              <button onClick={copyLink}
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '0.45rem 0.6rem', color: '#a5b4fc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600 }}>
                {copied ? <Check size={11} color='#34d399' /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        )}

        {/* Konum */}
        {lesson.type !== 'online' && lesson.location && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Konum</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{lesson.location}</div>
          </div>
        )}

        {/* Notlar */}
        {lesson.notes && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Notlar</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.55 }}>{lesson.notes}</div>
          </div>
        )}

        {/* Veli */}
        {(lesson.parentName || lesson.parentPhone || student?.parentName) && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Veli Bilgisi</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              {(lesson.parentName || student?.parentName) && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600 }}>{lesson.parentName || student?.parentName}</div>
              )}
              {(lesson.parentPhone || student?.parentPhone) && (
                <a href={`tel:${lesson.parentPhone || student?.parentPhone}`}
                  style={{ color: '#818cf8', fontSize: '0.75rem', textDecoration: 'none', marginTop: '0.15rem', display: 'block' }}>
                  {lesson.parentPhone || student?.parentPhone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div style={{ padding: '0.75rem 1.1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleDelete} disabled={loading}
          style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 10, padding: '0.55rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Trash2 size={13} /> Dersi Sil
        </button>
      </div>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────
export default function TeacherCalendar() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [view, setView] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const scrollRef = useRef(null);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 1024;

  // Mobilde haftalık view zor, günlük göster
  useEffect(() => {
    if (isMobile) setView('daily');
  }, [isMobile]);

  useEffect(() => {
    loadData();
    // Scroll to 8:00
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 60 * (8 - 7);
    }, 100);
  }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    ]);
    setLessons(l);
    setStudents(s);
  };

  const getLessonsForDay = (day) =>
    lessons
      .filter(l => { try { return isSameDay(parseISO(l.date), day); } catch { return false; } })
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const openAdd = (date) => {
    setEditingLesson(null);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setShowModal(true);
    setSelectedLesson(null);
  };

  const openEdit = (lesson) => {
    setEditingLesson(lesson);
    setSelectedDate(lesson.date);
    setShowModal(true);
    setSelectedLesson(null);
  };

  const handleLessonClick = (lesson, e) => {
    e.stopPropagation();
    setSelectedLesson(prev => prev?.id === lesson.id ? null : lesson);
  };

  const handleStatusChange = (lessonId, newStatus) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, status: newStatus } : l));
    setSelectedLesson(prev => prev?.id === lessonId ? { ...prev, status: newStatus } : prev);
  };

  const navigate = (dir) => {
    if (view === 'daily') setCurrentDate(d => addDays(d, dir));
    else setCurrentDate(d => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navLabel = () => {
    if (view === 'daily') return format(currentDate, 'd MMMM yyyy', { locale: tr });
    const ws = weekStart;
    const we = addDays(weekStart, 6);
    return `${format(ws, 'd MMM', { locale: tr })} – ${format(we, 'd MMM', { locale: tr })}`;
  };

  // ── Lesson Block (time-grid) ─────────────────────────────────
  const SLOT_H = 60; // px per hour

  const LessonBlock = ({ lesson, cellWidth }) => {
    const sc = STATUS_CFG[lesson.status] || STATUS_CFG['planlandı'];
    const [sh, sm] = (lesson.startTime || '08:00').split(':').map(Number);
    const [eh, em] = (lesson.endTime || '09:00').split(':').map(Number);
    const topOffset = (sh - 7) * SLOT_H + (sm / 60) * SLOT_H;
    const duration = Math.max(((eh * 60 + em) - (sh * 60 + sm)), 30);
    const height = (duration / 60) * SLOT_H - 2;
    const isSelected = selectedLesson?.id === lesson.id;

    return (
      <div
        onClick={(e) => handleLessonClick(lesson, e)}
        style={{
          position: 'absolute', left: 2, right: 2,
          top: topOffset, height,
          background: isSelected
            ? `linear-gradient(135deg, ${sc.bg}ee, ${sc.bg}cc)`
            : `linear-gradient(135deg, ${sc.bg}bb, ${sc.bg}88)`,
          border: `1.5px solid ${isSelected ? sc.dot : sc.bg + '66'}`,
          borderRadius: 8,
          padding: '0.25rem 0.4rem',
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: isSelected ? `0 0 0 2px ${sc.dot}55, 0 4px 12px rgba(0,0,0,0.25)` : '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'all 0.15s',
          zIndex: isSelected ? 5 : 2,
        }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: height > 40 ? '0.72rem' : '0.62rem', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lesson.studentName}
        </div>
        {height > 38 && (
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.startTime?.slice(0,5)} – {lesson.endTime?.slice(0,5)}
          </div>
        )}
      </div>
    );
  };

  // ── Time Grid ─────────────────────────────────────────────────
  const TimeGrid = ({ days }) => {
    const totalGridH = SLOT_H * HOURS.length;
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
        {/* Day headers */}
        <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 48, flexShrink: 0 }} />
          {days.map((day, i) => {
            const today = isToday(day);
            const dayIdx = (day.getDay() + 6) % 7;
            return (
              <div key={i}
                onClick={() => openAdd(day)}
                style={{
                  flex: 1, minWidth: 0, textAlign: 'center', padding: '0.65rem 0.25rem',
                  cursor: 'pointer', borderRight: i < days.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
                  {DAYS_SHORT[dayIdx]}
                </div>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', margin: '0 auto',
                  background: today ? '#4f46e5' : 'transparent',
                  color: today ? 'white' : 'rgba(255,255,255,0.7)',
                  fontWeight: today ? 800 : 600, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable time body */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', position: 'relative', height: totalGridH }}>
            {/* Hour labels */}
            <div style={{ width: 48, flexShrink: 0, position: 'relative' }}>
              {HOURS.map((h, i) => (
                <div key={h} style={{ position: 'absolute', top: i * SLOT_H, left: 0, right: 0, height: SLOT_H }}>
                  <span style={{ position: 'absolute', top: -7, right: 6, color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Columns */}
            {days.map((day, di) => {
              const dayLessons = getLessonsForDay(day);
              const today = isToday(day);
              return (
                <div key={di}
                  onClick={() => openAdd(day)}
                  style={{
                    flex: 1, minWidth: 0, position: 'relative',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    background: today ? 'rgba(79,70,229,0.03)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                  {/* Hour grid lines */}
                  {HOURS.map((_, i) => (
                    <div key={i} style={{ position: 'absolute', top: i * SLOT_H, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.04)', height: SLOT_H }} />
                  ))}
                  {/* Lesson blocks */}
                  {dayLessons.map(l => (
                    <LessonBlock key={l.id} lesson={l} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const showDetailPanel = !!selectedLesson && !isMobile;
  const showMobileDetail = !!selectedLesson && isMobile;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: '#0f1117',
      color: 'white',
      padding: isMobile ? '0.5rem' : '1rem',
      gap: '0.75rem',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: isMobile ? '0.78rem' : '0.88rem', minWidth: isMobile ? 90 : 160, textAlign: 'center' }}>
            {navLabel()}
          </span>
          <button onClick={() => navigate(1)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* View toggle + Bugün + Ders Ekle */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, overflow: 'hidden' }}>
            {(isMobile ? [['daily', 'Gün']] : [['daily', 'Günlük'], ['weekly', 'Haftalık']]).map(([v, lbl]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '0.4rem 0.8rem', border: 'none', background: view === v ? 'rgba(79,70,229,0.6)' : 'transparent', color: view === v ? 'white' : 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                {lbl}
              </button>
            ))}
          </div>
          {!isMobile && (
            <button onClick={() => { setCurrentDate(new Date()); }}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: 9, padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
              Bugün
            </button>
          )}
          <button onClick={() => openAdd(currentDate)}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 9, padding: '0.45rem 0.9rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}>
            <Plus size={14} /> Ders Ekle
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: '0.75rem' }}>
        {/* Calendar grid */}
        <div style={{
          flex: 1, minWidth: 0,
          background: '#1a1f35',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <TimeGrid days={view === 'daily' ? [currentDate] : weekDays} />
        </div>

        {/* Detail panel — desktop */}
        {showDetailPanel && (
          <div style={{ width: 280, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <LessonDetailPanel
              lesson={selectedLesson}
              students={students}
              onClose={() => setSelectedLesson(null)}
              onEdit={() => openEdit(selectedLesson)}
              onDeleted={() => { setSelectedLesson(null); loadData(); }}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>

      {/* Mobile detail panel — bottom sheet */}
      {showMobileDetail && (
        <>
          <div
            onClick={() => setSelectedLesson(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, backdropFilter: 'blur(3px)' }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            maxHeight: '75vh', overflowY: 'auto',
            borderRadius: '20px 20px 0 0',
          }}>
            <LessonDetailPanel
              lesson={selectedLesson}
              students={students}
              onClose={() => setSelectedLesson(null)}
              onEdit={() => openEdit(selectedLesson)}
              onDeleted={() => { setSelectedLesson(null); loadData(); }}
              onStatusChange={handleStatusChange}
            />
          </div>
        </>
      )}

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