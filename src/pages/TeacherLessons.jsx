import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInMinutes, isToday, isPast } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle, XCircle, Filter, BookOpen, Pencil, ClipboardList, Clock, Phone, ChevronDown } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';
import LessonReportModal from '../components/teacher/LessonReportModal';

const STATUS_CONFIG_TR = {
  planlandı:  { bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1' },
  tamamlandı: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  iptal:      { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

export default function TeacherLessons() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : enUS;
  const STATUS_CONFIG = {
    planlandı:  { ...STATUS_CONFIG_TR.planlandı, label: t('teacher.lessons.planned') },
    tamamlandı: { ...STATUS_CONFIG_TR.tamamlandı, label: t('teacher.lessons.completed') },
    iptal:      { ...STATUS_CONFIG_TR.iptal, label: t('teacher.lessons.cancelled') },
  };
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [reportLesson, setReportLesson] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadData(); }, []);

  // Modal açıkken body scroll'u kilitle
  useEffect(() => {
    if (showModal || reportLesson) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showModal, reportLesson]);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s, p] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }, 'date'),
      base44.entities.Student.filter({ teacherEmail: me.email }),
      base44.entities.Payment.filter({ teacherEmail: me.email }),
    ]);
    setLessons(l); setStudents(s); setPayments(p);
  };

  const markDone = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'tamamlandı' });
    const fee = getLessonFee(lesson);
    const existing = payments.find(p => p.lessonId === lesson.id || (p.studentId === lesson.studentId && p.date === lesson.date && p.description?.includes(lesson.startTime?.slice(0,5) || '__')));
    if (!existing && fee > 0) {
      await base44.entities.Payment.create({
        studentId: lesson.studentId, studentName: lesson.studentName,
        teacherEmail: lesson.teacherEmail, amount: fee, date: lesson.date,
        status: 'bekliyor', description: `${lesson.subject || 'Ders'} - ${lesson.date} ${lesson.startTime?.slice(0,5) || ''}`,
        month: lesson.date?.slice(0, 7), lessonId: lesson.id,
      });
    }
    loadData();
  };

  const markUndone = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'planlandı' });
    const autoPayment = payments.find(p => p.lessonId === lesson.id || (p.studentId === lesson.studentId && p.date === lesson.date && p.status === 'bekliyor' && p.description?.includes(lesson.startTime?.slice(0,5) || '__')));
    if (autoPayment) await base44.entities.Payment.delete(autoPayment.id);
    loadData();
  };

  const markCancel = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'iptal' });
    loadData();
  };

  const findPaymentForLesson = (lesson, status) =>
    payments.find(p =>
      p.studentId === lesson.studentId &&
      p.status === status &&
      (p.lessonId ? p.lessonId === lesson.id : (p.date === lesson.date && p.description?.includes(lesson.startTime?.slice(0,5) || '__')))
    );

  const markPaid = async (lesson) => {
    const pending = findPaymentForLesson(lesson, 'bekliyor');
    if (pending) {
      await base44.entities.Payment.update(pending.id, { status: 'alındı', lessonId: lesson.id });
    } else {
      const fee = getLessonFee(lesson);
      await base44.entities.Payment.create({
        studentId: lesson.studentId, studentName: lesson.studentName,
        teacherEmail: lesson.teacherEmail, amount: fee, date: lesson.date,
        status: 'alındı', description: `${lesson.subject || 'Ders'} - ${lesson.date} ${lesson.startTime?.slice(0,5) || ''}`,
        month: lesson.date?.slice(0, 7), lessonId: lesson.id,
      });
    }
    loadData();
  };

  const markUnpaid = async (lesson) => {
    const paid = findPaymentForLesson(lesson, 'alındı');
    if (paid) { await base44.entities.Payment.update(paid.id, { status: 'bekliyor' }); loadData(); }
  };

  const getLessonFee = (lesson) => {
    if (lesson.lessonFee) return lesson.lessonFee;
    const student = students.find(s => s.id === lesson.studentId);
    return student?.feePerLesson || 0;
  };

  const isLessonPaid = (lesson) =>
    payments.some(p =>
      p.studentId === lesson.studentId &&
      p.status === 'alındı' &&
      (p.lessonId ? p.lessonId === lesson.id : (p.date === lesson.date && p.description?.includes(lesson.startTime?.slice(0,5) || '__')))
    );

  const getDuration = (start, end) => {
    if (!start || !end) return null;
    try {
      const s = new Date(`2000-01-01T${start}`);
      const e = new Date(`2000-01-01T${end}`);
      const mins = differenceInMinutes(e, s);
      return mins > 0 ? `${mins}dk` : null;
    } catch { return null; }
  };

  const filtered = lessons.filter(l => {
    const statusOk = statusFilter === 'all' || l.status === statusFilter;
    const studentOk = studentFilter === 'all' || l.studentId === studentFilter;
    const fromOk = !dateFrom || l.date >= dateFrom;
    const toOk = !dateTo || l.date <= dateTo;
    return statusOk && studentOk && fromOk && toOk;
  }).sort((a, b) => new Date(`${a.date}T${a.startTime||'00:00'}`) - new Date(`${b.date}T${b.startTime||'00:00'}`));

  // Tarihe göre grupla
  const grouped = filtered.reduce((acc, lesson) => {
    const key = lesson.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lesson);
    return acc;
  }, {});

  const selStyle = {
    padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#374151', fontSize: '0.83rem', fontWeight: '500',
    cursor: 'pointer', outline: 'none',
  };

  const hasFilter = statusFilter !== 'all' || studentFilter !== 'all' || dateFrom || dateTo;

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', height: '100vh', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.2rem' }}>{t('teacher.lessons.title')}</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{filtered.length} {t('teacher.lessons.title').toLowerCase()} · {lessons.filter(l => l.status === 'tamamlandı').length} {t('teacher.lessons.completed').toLowerCase()}</p>
        </div>
        <button onClick={() => { setEditLesson(null); setShowModal(true); }}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> {t('teacher.lessons.planLesson')}
        </button>
      </div>

      {/* Özet kutucuklar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: t('teacher.lessons.total'), value: lessons.length, color: '#6366f1', bg: '#eef2ff' },
          { label: t('teacher.lessons.planned'), value: lessons.filter(l => l.status === 'planlandı').length, color: '#4338ca', bg: '#e0e7ff' },
          { label: t('teacher.lessons.completed'), value: lessons.filter(l => l.status === 'tamamlandı').length, color: '#059669', bg: '#d1fae5' },
          { label: t('teacher.lessons.cancelled'), value: lessons.filter(l => l.status === 'iptal').length, color: '#dc2626', bg: '#fee2e2' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, padding: '1rem 1.25rem', border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>{label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '0.85rem 1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.82rem', fontWeight: '600' }}>
          <Filter size={14} /> {t('teacher.lessons.filter')}:
        </div>
        {/* Status toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: '0.2rem', gap: '0.1rem' }}>
          {[['all', t('teacher.lessons.all')],['planlandı', t('teacher.lessons.planned')],['tamamlandı', t('teacher.lessons.completed')],['iptal', t('teacher.lessons.cancelled')]].map(([v,l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              style={{ padding: '0.35rem 0.75rem', borderRadius: 8, border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', background: statusFilter === v ? 'white' : 'transparent', color: statusFilter === v ? '#111827' : '#9ca3af', boxShadow: statusFilter === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)} style={selStyle}>
          <option value="all">{t('teacher.lessons.allStudents')}</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={selStyle} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={selStyle} />
        {hasFilter && (
          <button onClick={() => { setStatusFilter('all'); setStudentFilter('all'); setDateFrom(''); setDateTo(''); }}
            style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1.5px solid #fca5a5', fontSize: '0.8rem', color: '#ef4444', background: '#fef2f2', cursor: 'pointer', fontWeight: '600' }}>
            ✕ {t('teacher.lessons.clearFilter')}
          </button>
        )}
      </div>

      {/* Ders listesi — tarihe göre gruplu */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
          <p style={{ fontWeight: '600', fontSize: '1rem' }}>{t('teacher.lessons.noLessonsFound')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([date, dayLessons]) => {
            let dayLabel = '';
            try {
              const d = parseISO(date);
              dayLabel = isToday(d) ? t('teacher.lessons.today') : format(d, 'd MMMM yyyy, EEEE', { locale: dateLocale });
            } catch {}

            return (
              <div key={date}>
                {/* Tarih başlığı */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ color: isToday(parseISO(date)) ? '#4f46e5' : '#374151', fontWeight: '700', fontSize: '0.9rem', textTransform: 'capitalize' }}>{dayLabel}</div>
                  <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{dayLessons.length} {t('teacher.lessons.title').toLowerCase()}</div>
                </div>

                {/* O güne ait dersler */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {dayLessons.map(lesson => {
                    const isPaid = isLessonPaid(lesson);
                    const fee = getLessonFee(lesson);
                    const duration = getDuration(lesson.startTime, lesson.endTime);
                    const student = students.find(s => s.id === lesson.studentId);
                    const isScheduled = lesson.status === 'planlandı';
                    const isCompleted = lesson.status === 'tamamlandı';
                    const isCancelled = lesson.status === 'iptal';
                    const sc = STATUS_CONFIG[lesson.status] || STATUS_CONFIG['planlandı'];
                    const isExpanded = expandedId === lesson.id;

                    return (
                      <div key={lesson.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isExpanded ? '#c7d2fe' : '#f1f5f9'}`, boxShadow: isExpanded ? '0 4px 16px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s', overflow: 'hidden' }}>
                        {/* Ana satır */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}
                          onClick={() => setExpandedId(isExpanded ? null : lesson.id)}>

                          {/* Sol renk çizgisi */}
                          <div style={{ width: 4, height: 44, borderRadius: 4, background: sc.dot, flexShrink: 0 }} />

                          {/* Saat */}
                          <div style={{ textAlign: 'center', minWidth: 44 }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e1b4b', lineHeight: 1 }}>{lesson.startTime?.slice(0, 5)}</div>
                            {duration && <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.15rem' }}>{duration}</div>}
                          </div>

                          {/* Öğrenci + konu */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.studentName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                              {[lesson.subject, fee > 0 && `₺${fee.toLocaleString('tr-TR')}`].filter(Boolean).join(' · ')}
                            </div>
                          </div>

                          {/* Badge'ler */}
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: 20, background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                            {!isCancelled && (
                              <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: 20, background: isPaid ? '#d1fae5' : '#fef9c3', color: isPaid ? '#065f46' : '#854d0e' }}>
                                {isPaid ? t('teacher.lessons.paid') : t('teacher.lessons.pending')}
                              </span>
                            )}
                          </div>

                          {/* Expand ikonu */}
                          <ChevronDown size={16} color="#9ca3af" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </div>

                        {/* Genişletilmiş aksiyonlar */}
                        {isExpanded && (
                          <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {student?.parentPhone && (
                              <a href={`tel:${student.parentPhone}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                                <Phone size={13} /> {student.parentPhone}
                              </a>
                            )}
                            <div style={{ flex: 1 }} />
                            {isScheduled && (
                              <>
                                <ActionBtn icon={<CheckCircle size={13} />} label={t('teacher.lessons.done')} color="#059669" bg="#d1fae5" onClick={() => markDone(lesson)} />
                                <ActionBtn icon={<XCircle size={13} />} label={t('teacher.lessons.cancel')} color="#dc2626" bg="#fee2e2" onClick={() => markCancel(lesson)} />
                              </>
                            )}
                            {isCompleted && (
                              <>
                                <ActionBtn label={t('teacher.lessons.undo')} color="#6b7280" bg="#f3f4f6" onClick={() => markUndone(lesson)} />
                                <ActionBtn icon={<ClipboardList size={13} />} label={t('teacher.lessons.evaluate')} color="#7c3aed" bg="#ede9fe" onClick={() => setReportLesson(lesson)} />
                              </>
                            
                            )}
                            <ActionBtn icon={<Pencil size={12} />} label={t('teacher.lessons.edit')} color="#374151" bg="#f3f4f6" onClick={() => { setEditLesson(lesson); setShowModal(true); }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reportLesson && <LessonReportModal lesson={reportLesson} onClose={() => setReportLesson(null)} onSaved={loadData} />}
      {showModal && (
        <LessonModal
          students={students}
          defaultDate={editLesson?.date || format(new Date(), 'yyyy-MM-dd')}
          existingLesson={editLesson}
          onClose={() => { setShowModal(false); setEditLesson(null); }}
          onSaved={loadData}
        />
      )}
    </div>
  );
}

function ActionBtn({ icon, label, color, bg, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? color : bg,
        border: 'none', color: hover ? 'white' : color,
        cursor: 'pointer', padding: '0.45rem 0.9rem',
        borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700',
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}>
      {icon}{label}
    </button>
  );
}