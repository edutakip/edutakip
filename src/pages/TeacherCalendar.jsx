import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  format, startOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, parseISO, isToday
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, Plus, Video, MapPin,
  Edit2, X, Check, DollarSign, Trash2, ExternalLink, Copy,
  Clock, BookOpen, ChevronRight as ChevRight
} from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const STATUS_CFG_BASE = {
  planlandı:  { bg: '#4f46e5', dot: '#818cf8', chipBg: '#eef2ff', chipColor: '#4f46e5' },
  tamamlandı: { bg: '#10b981', dot: '#10b981', chipBg: '#ecfdf5', chipColor: '#065f46' },
  iptal:      { bg: '#ef4444', dot: '#ef4444', chipBg: '#fef2f2', chipColor: '#b91c1c' },
};

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
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
  const { t } = useTranslation();
  const STATUS_CFG = {
    planlandı:  { ...STATUS_CFG_BASE.planlandı, label: t('teacher.calendar.planned') },
    tamamlandı: { ...STATUS_CFG_BASE.tamamlandı, label: t('teacher.calendar.completed') },
    iptal:      { ...STATUS_CFG_BASE.iptal, label: t('teacher.calendar.cancelled') },
  };
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const sc = STATUS_CFG[lesson.status] || STATUS_CFG['planlandı'];
  const student = students.find(s => s.id === lesson.studentId);

  useEffect(() => {
    setPaymentLoading(true);
    base44.entities.Payment.filter({ studentId: lesson.studentId }).then(payments => {
      const paid = payments.find(p => p.status === 'alındı' && p.lessonId === lesson.id);
      setPayment(paid || null);
      setPaymentLoading(false);
    }).catch(() => setPaymentLoading(false));
  }, [lesson.id, lesson.studentId]);

  const handleDelete = async () => {
    if (!confirm(t('teacher.calendar.confirmDelete'))) return;
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
  const dayNames = t('teacher.calendar.completed') === 'Completed'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = t('teacher.calendar.completed') === 'Completed'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dateLabel = dateObj
    ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} ${dayNames[dateObj.getDay()]}`
    : lesson.date;

  const fee = lesson.lessonFee || student?.feePerLesson;

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: '100%',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.1rem 0.85rem', borderBottom: '1px solid #f3f4f6' }}>
        {/* Status chip + time + edit/close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              background: sc.chipBg, color: sc.chipColor,
              fontSize: '0.68rem', fontWeight: 700,
              padding: '0.2rem 0.6rem', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <Check size={10} /> {sc.label}
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>
              {lesson.startTime?.slice(0,5)} – {lesson.endTime?.slice(0,5)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button onClick={onEdit}
              style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={onClose}
              style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={12} />
            </button>
          </div>
        </div>
        {/* Student name */}
        <h3 style={{ color: '#111827', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{lesson.studentName}</h3>
        {lesson.subject && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f3f4f6', borderRadius: 6, padding: '0.15rem 0.5rem', marginTop: '0.35rem' }}>
            <BookOpen size={10} color='#9ca3af' />
            <span style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: 600 }}>{lesson.subject}</span>
          </div>
        )}
      </div>

      {/* Status Buttons */}
      <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'tamamlandı', label: 'Tamamlandı', activeColor: '#fff', activeBg: '#10b981', activeBorder: '#10b981', icon: <Check size={12}/> },
          { key: 'planlandı',  label: 'Gelmedi',    activeColor: '#fff', activeBg: '#6366f1', activeBorder: '#6366f1', icon: <X size={12}/> },
          { key: 'iptal',      label: 'İptal',       activeColor: '#fff', activeBg: '#ef4444', activeBorder: '#ef4444', icon: <X size={12}/> },
        ].map(s => {
          const isActive = lesson.status === s.key;
          return (
            <button key={s.key} onClick={() => handleStatus(s.key)} disabled={loading}
              style={{
                flex: 1, padding: '0.5rem 0.25rem', borderRadius: 10,
                border: `1.5px solid ${isActive ? s.activeBorder : '#e5e7eb'}`,
                background: isActive ? s.activeBg : 'white',
                color: isActive ? s.activeColor : '#9ca3af',
                fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: '1rem' }}>
                {s.key === 'tamamlandı' ? '✓' : s.key === 'planlandı' ? '👤' : '✗'}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Ücret */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{t('teacher.calendar.fee')}</div>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>₺</span>
            <span style={{ color: '#111827', fontWeight: 700, fontSize: '0.95rem' }}>{fee || '—'}</span>
          </div>
        </div>

        {/* Ödeme */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{t('teacher.calendar.payment')}</div>
          {paymentLoading ? (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{t('teacher.calendar.loading')}</span>
            </div>
          ) : payment ? (
            <>
              <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Check size={14} color='#10b981' />
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>{t('teacher.calendar.paid')}</span>
              </div>
              <div style={{ marginTop: '0.4rem', padding: '0.5rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.calendar.paymentDate')}</div>
                  <div style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.1rem' }}>{payment.date}</div>
                </div>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>{payment.amount} ₺</span>
              </div>
            </>
          ) : (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <X size={14} color='#ef4444' />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>{t('teacher.calendar.unpaid')}</span>
            </div>
          )}
        </div>

        {/* Nerede kaldık */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('teacher.calendar.whereWeLeft')}
          </div>
          <textarea
            defaultValue={lesson.notes || ''}
            placeholder='Öğrenci ile paylaşılan bir sonraki ders notu...'
            rows={3}
            style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#374151', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Öğretmen notu */}
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('teacher.calendar.teacherNote')}
          </div>
          <textarea
            placeholder='Veli ile paylaşılacak ders notu...'
            rows={3}
            style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#374151', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Önceki Ders */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.75rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color='#4f46e5' />
            </div>
            <div>
              <div style={{ color: '#111827', fontSize: '0.78rem', fontWeight: 700 }}>{t('teacher.calendar.previousLesson')}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.68rem' }}>{dateLabel}</div>
            </div>
          </div>
          <ChevRight size={14} color='#d1d5db' />
        </div>

        {/* Ders türü + link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {lesson.type === 'online'
              ? <><Video size={14} color='#4f46e5' /><span style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}>{t('teacher.calendar.onlineLesson')}</span></>
              : <><MapPin size={14} color='#f97316' /><span style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}>{t('teacher.calendar.faceToFace')}</span></>
            }
          </div>
          {lesson.type === 'online' && lesson.meetingLink && (
            <button onClick={copyLink}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {copied ? <Check size={12} color='#10b981' /> : <Copy size={12} />}
              {copied ? t('teacher.calendar.copied') : t('teacher.calendar.copy')}
            </button>
          )}
          {lesson.type === 'online' && lesson.meetingLink && (
            <a href={lesson.meetingLink} target='_blank' rel='noreferrer'
              style={{ color: '#4f46e5', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ExternalLink size={12} /> {t('teacher.calendar.open')}
            </a>
          )}
        </div>
      </div>

      {/* Delete */}
      <div style={{ padding: '0.75rem 1.1rem', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={handleDelete} disabled={loading}
          style={{ width: '100%', background: 'white', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: 10, padding: '0.55rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
          <Trash2 size={13} /> {t('teacher.calendar.deleteLesson')}
        </button>
      </div>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────
export default function TeacherCalendar() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : enUS;
  const DAYS_SHORT_LOC = i18n.language?.startsWith('tr') ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const STATUS_CFG = {
    planlandı:  { ...STATUS_CFG_BASE.planlandı, label: t('teacher.calendar.planned') },
    tamamlandı: { ...STATUS_CFG_BASE.tamamlandı, label: t('teacher.calendar.completed') },
    iptal:      { ...STATUS_CFG_BASE.iptal, label: t('teacher.calendar.cancelled') },
  };
  const [view, setView] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const scrollRef = useRef(null);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  useEffect(() => {
    if (isMobile) setView('daily');
  }, [isMobile]);

  useEffect(() => {
    loadData();
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 60 * (8 - 7);
    }, 150);
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
    if (view === 'daily') return format(currentDate, 'd MMMM yyyy', { locale: dateLocale });
    const ws = weekStart;
    const we = addDays(weekStart, 6);
    return `${format(ws, 'd MMM', { locale: dateLocale })} – ${format(we, 'd MMM', { locale: dateLocale })}`;
  };

  const SLOT_H = 80;

  // ── Drag state ────────────────────────────────────────────────
  const dragRef = useRef(null); // { lessonId, offsetMinutes }
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver, setDragOver] = useState(null); // { date, hour, minute }
  const [syncing, setSyncing] = useState(null); // lessonId being synced

  const handleDragStart = (e, lesson) => {
    const [sh, sm] = (lesson.startTime || '08:00').split(':').map(Number);
    const [eh, em] = (lesson.endTime || '09:00').split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    dragRef.current = { lessonId: lesson.id, duration, offsetMinutes: 0 };
    setDraggingId(lesson.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lesson.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
    dragRef.current = null;
  };

  const getDropTime = (e, dayDate, colEl) => {
    const rect = colEl.getBoundingClientRect();
    const scrollTop = scrollRef.current?.scrollTop || 0;
    const relY = e.clientY - rect.top + scrollTop;
    const totalMinutes = Math.round((relY / SLOT_H) * 60) + 7 * 60;
    const snapped = Math.round(totalMinutes / 15) * 15;
    return snapped; // minutes since midnight
  };

  const handleDropOnColumn = async (e, dayDate) => {
    e.preventDefault();
    if (!dragRef.current) return;
    const { lessonId, duration } = dragRef.current;
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const colEl = e.currentTarget;
    const startMinutes = getDropTime(e, dayDate, colEl);
    const endMinutes = startMinutes + Math.max(duration, 30);

    const toTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const newDate = format(dayDate, 'yyyy-MM-dd');
    const newStart = toTime(startMinutes);
    const newEnd = toTime(endMinutes);

    // Optimistic update
    setLessons(prev => prev.map(l => l.id === lessonId
      ? { ...l, date: newDate, startTime: newStart, endTime: newEnd }
      : l
    ));
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson(prev => ({ ...prev, date: newDate, startTime: newStart, endTime: newEnd }));
    }

    setDraggingId(null);
    setDragOver(null);
    dragRef.current = null;

    // Persist
    await base44.entities.Lesson.update(lessonId, { date: newDate, startTime: newStart, endTime: newEnd });

    // Sync to Google Calendar
    setSyncing(lessonId);
    base44.functions.invoke('syncLessonToCalendar', { lessonId, action: 'update' })
      .catch(() => {})
      .finally(() => setSyncing(null));
  };

  const handleDragOverColumn = (e, dayDate) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const colEl = e.currentTarget;
    const startMins = getDropTime(e, dayDate, colEl);
    setDragOver({ date: format(dayDate, 'yyyy-MM-dd'), startMins });
  };

  const LessonBlock = ({ lesson }) => {
    const sc = STATUS_CFG[lesson.status] || STATUS_CFG['planlandı'];
    const [sh, sm] = (lesson.startTime || '08:00').split(':').map(Number);
    const [eh, em] = (lesson.endTime || '09:00').split(':').map(Number);
    const topOffset = (sh - 7) * SLOT_H + (sm / 60) * SLOT_H;
    const duration = Math.max(((eh * 60 + em) - (sh * 60 + sm)), 30);
    const height = (duration / 60) * SLOT_H - 2;
    const isSelected = selectedLesson?.id === lesson.id;
    const isDragging = draggingId === lesson.id;
    const isSyncing = syncing === lesson.id;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, lesson)}
        onDragEnd={handleDragEnd}
        onClick={(e) => { e.stopPropagation(); if (!draggingId) handleLessonClick(lesson, e); }}
        title={`${lesson.studentName} — sürükleyerek taşıyın`}
        style={{
          position: 'absolute', left: 2, right: 2,
          top: topOffset, height,
          background: isSelected ? sc.bg : sc.bg + 'cc',
          borderRadius: 7,
          padding: '0.2rem 0.4rem',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          boxShadow: isDragging
            ? `0 8px 24px ${sc.bg}66`
            : isSelected ? `0 0 0 2px ${sc.bg}, 0 4px 12px ${sc.bg}44` : '0 1px 4px rgba(0,0,0,0.1)',
          opacity: isDragging ? 0.45 : 1,
          transition: isDragging ? 'none' : 'all 0.15s',
          zIndex: isSelected ? 5 : 2,
          borderLeft: `3px solid ${sc.dot}`,
        }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: height > 40 ? '0.7rem' : '0.6rem', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lesson.startTime?.slice(0,5)}{height > 30 ? ' – ' + lesson.endTime?.slice(0,5) : ''}
          {isSyncing && <span style={{ marginLeft: 4, opacity: 0.8 }}>↻</span>}
        </div>
        {height > 28 && (
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.studentName}
          </div>
        )}
      </div>
    );
  };

  const TimeGrid = ({ days }) => {
    const totalGridH = SLOT_H * HOURS.length;
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
        {/* Day headers */}
        <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid #e5e7eb', background: 'white', overflowY: 'scroll' }}>
          <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid #f3f4f6' }} />
          {days.map((day, i) => {
            const today = isToday(day);
            const dayIdx = (day.getDay() + 6) % 7;
            return (
              <div key={i}
                onClick={() => openAdd(day)}
                style={{
                  flex: 1, minWidth: 0, textAlign: 'center', padding: '0.7rem 0.25rem',
                  cursor: 'pointer', borderRight: i < days.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: today ? '#f5f3ff' : 'white', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!today) e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = today ? '#f5f3ff' : 'white'; }}>
                <div style={{ color: '#9ca3af', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
                  {DAYS_SHORT_LOC[dayIdx]}
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                  background: today ? '#4f46e5' : 'transparent',
                  color: today ? 'white' : '#374151',
                  fontWeight: today ? 800 : 500, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time body */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'scroll', overflowX: 'hidden', background: 'white' }}>
          <div style={{ display: 'flex', position: 'relative', height: totalGridH }}>
            {/* Hour labels */}
            <div style={{ width: 52, flexShrink: 0, position: 'relative', background: 'white', borderRight: '1px solid #f3f4f6' }}>
              {HOURS.map((h, i) => (
                <div key={h} style={{ position: 'absolute', top: i * SLOT_H, left: 0, right: 0, height: SLOT_H }}>
                  <span style={{ position: 'absolute', top: -7, right: 8, color: '#9ca3af', fontSize: '0.62rem', fontWeight: 600 }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const dayLessons = getLessonsForDay(day);
              const today = isToday(day);
              const dayStr = format(day, 'yyyy-MM-dd');
              const isDropTarget = dragOver?.date === dayStr;
              // Ghost block for drag preview
              const ghostTop = isDropTarget
                ? Math.round((dragOver.startMins - 7 * 60) / 60 * SLOT_H)
                : null;
              const ghostHeight = dragRef.current
                ? (dragRef.current.duration / 60) * SLOT_H - 2
                : SLOT_H - 2;

              return (
                <div key={di}
                  onClick={() => !draggingId && openAdd(day)}
                  onDragOver={(e) => handleDragOverColumn(e, day)}
                  onDrop={(e) => handleDropOnColumn(e, day)}
                  onDragLeave={() => setDragOver(null)}
                  style={{
                    flex: 1, minWidth: 0, position: 'relative',
                    borderLeft: '1px solid #f3f4f6',
                    background: isDropTarget ? '#f0f4ff' : today ? '#faf9ff' : 'white',
                    cursor: draggingId ? 'copy' : 'pointer',
                    transition: 'background 0.1s',
                  }}>
                  {HOURS.map((_, i) => (
                    <div key={i} style={{ position: 'absolute', top: i * SLOT_H, left: 0, right: 0, borderTop: '1px solid #f3f4f6', height: SLOT_H }} />
                  ))}
                  {/* Drop ghost */}
                  {isDropTarget && ghostTop !== null && (
                    <div style={{
                      position: 'absolute', left: 2, right: 2,
                      top: ghostTop, height: ghostHeight,
                      background: 'rgba(99,102,241,0.25)',
                      border: '2px dashed #6366f1',
                      borderRadius: 7, zIndex: 10, pointerEvents: 'none',
                    }} />
                  )}
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
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    if (showDetailPanel) {
      setTimeout(() => setPanelVisible(true), 10);
    } else {
      setPanelVisible(false);
    }
  }, [showDetailPanel, selectedLesson?.id]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: '#f1f5f9',
      padding: isMobile ? '0.5rem' : '1rem',
      gap: '0.75rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ color: '#374151', fontWeight: 700, fontSize: isMobile ? '0.78rem' : '0.88rem', minWidth: isMobile ? 90 : 160, textAlign: 'center' }}>
            {navLabel()}
          </span>
          <button onClick={() => navigate(1)}
            style={{ background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <ChevronRight size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'white', border: '1px solid #e5e7eb', borderRadius: 9, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {(isMobile ? [['daily', t('teacher.calendar.daily')]] : [['daily', t('teacher.calendar.daily')], ['weekly', t('teacher.calendar.weekly')]]).map(([v, lbl]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '0.4rem 0.85rem', border: 'none', background: view === v ? '#4f46e5' : 'transparent', color: view === v ? 'white' : '#6b7280', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                {lbl}
              </button>
            ))}
          </div>
          {!isMobile && (
            <button onClick={() => setCurrentDate(new Date())}
              style={{ background: 'white', border: '1px solid #e5e7eb', color: '#4f46e5', borderRadius: 9, padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {t('teacher.calendar.today')}
            </button>
          )}
          <button onClick={() => openAdd(currentDate)}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 9, padding: '0.45rem 0.9rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}>
            <Plus size={14} /> {t('teacher.calendar.addLesson')}
          </button>
        </div>
      </div>

      {/* Haftalık gün scroll — günlük görünümde */}
      {view === 'daily' && (
        <div style={{
          flexShrink: 0,
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: '0.35rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          alignSelf: 'flex-start',
        }}>
          <button onClick={() => setCurrentDate(d => addDays(d, -7))}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <ChevronLeft size={14} />
          </button>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {weekDays.map((day, i) => {
              const isSelected = isSameDay(day, currentDate);
              const today = isToday(day);
              const dayIdx = (day.getDay() + 6) % 7;
              return (
                <button key={i} onClick={() => setCurrentDate(day)}
                 style={{
                   display: 'flex', flexDirection: 'column', alignItems: 'center',
                   padding: '0.25rem 0.4rem', borderRadius: 9, border: 'none',
                   background: isSelected ? '#4f46e5' : 'transparent',
                   cursor: 'pointer', transition: 'all 0.15s', minWidth: 34,
                 }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.5px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#9ca3af', textTransform: 'uppercase' }}>
                    {DAYS_SHORT_LOC[dayIdx]}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isSelected ? 'white' : today ? '#4f46e5' : '#374151', lineHeight: 1.2 }}>
                    {format(day, 'd')}
                  </span>
                  <span style={{ fontSize: '0.45rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af', textTransform: 'uppercase' }}>
                    {format(day, 'MMM', { locale: dateLocale }).toUpperCase()}
                  </span>
                  {today && !isSelected && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4f46e5', marginTop: '0.15rem' }} />
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => setCurrentDate(d => addDays(d, 7))}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: '0.75rem', minHeight: 0 }}>
        <div style={{
          flex: 1, minWidth: 0,
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <TimeGrid days={view === 'daily' ? [currentDate] : weekDays} />
        </div>

        {showDetailPanel && (
          <div style={{
            width: 290, flexShrink: 0, height: '100%', overflow: 'hidden',
            transform: panelVisible ? 'translateX(0)' : 'translateX(320px)',
            opacity: panelVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease',
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
        )}
      </div>

      {/* Mobile bottom sheet */}
      {showMobileDetail && (
        <>
          <div onClick={() => setSelectedLesson(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, maxHeight: '78vh', overflowY: 'auto', borderRadius: '20px 20px 0 0' }}>
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