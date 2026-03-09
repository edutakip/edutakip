import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, CheckCircle, XCircle, MessageCircle, Filter, BookOpen, Pencil, ClipboardList } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';
import LessonEvaluationModal from '../components/teacher/LessonEvaluationModal';

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [evalLesson, setEvalLesson] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s, p] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }, '-date'),
      base44.entities.Student.filter({ teacherEmail: me.email }),
      base44.entities.Payment.filter({ teacherEmail: me.email }),
    ]);
    setLessons(l); setStudents(s); setPayments(p);
  };

  const markDone = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'tamamlandı' });
    // Otomatik olarak hak edilen (bekliyor) kaydı oluştur
    const fee = getLessonFee(lesson);
    const existing = payments.find(p => p.studentId === lesson.studentId && p.date === lesson.date && p.description?.includes('Ders'));
    if (!existing && fee > 0) {
      await base44.entities.Payment.create({
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        teacherEmail: lesson.teacherEmail,
        amount: fee,
        date: lesson.date,
        status: 'bekliyor',
        description: `${lesson.subject || 'Ders'} - ${lesson.date}`,
        month: lesson.date?.slice(0, 7),
      });
    }
    loadData();
  };

  const markUndone = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'planlandı' });
    // Otomatik eklenen bekliyor kaydını sil
    const autoPayment = payments.find(p => p.studentId === lesson.studentId && p.date === lesson.date && p.status === 'bekliyor');
    if (autoPayment) await base44.entities.Payment.delete(autoPayment.id);
    loadData();
  };

  const markCancel = async (lesson) => {
    await base44.entities.Lesson.update(lesson.id, { status: 'iptal' });
    loadData();
  };

  const markPaid = async (lesson) => {
    // bekliyor kaydını alındı'ya güncelle, yoksa yeni oluştur
    const pending = payments.find(p => p.studentId === lesson.studentId && p.date === lesson.date && p.status === 'bekliyor');
    if (pending) {
      await base44.entities.Payment.update(pending.id, { status: 'alındı' });
    } else {
      const fee = getLessonFee(lesson);
      await base44.entities.Payment.create({
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        teacherEmail: lesson.teacherEmail,
        amount: fee,
        date: lesson.date,
        status: 'alındı',
        description: `${lesson.subject || 'Ders'} - ${lesson.date}`,
        month: lesson.date?.slice(0, 7),
      });
    }
    loadData();
  };

  const markUnpaid = async (lesson) => {
    const paid = payments.find(p => p.studentId === lesson.studentId && p.date === lesson.date && p.status === 'alındı');
    if (paid) {
      // Geri al: bekliyor'a döndür
      await base44.entities.Payment.update(paid.id, { status: 'bekliyor' });
      loadData();
    }
  };

  const getLessonFee = (lesson) => {
    const student = students.find(s => s.id === lesson.studentId);
    if (!student?.monthlyFee || !student?.weeklyLessons) return 0;
    return Math.round(student.monthlyFee / (student.weeklyLessons * 4.3));
  };

  const isLessonPaid = (lesson) => {
    return payments.some(p =>
      p.studentId === lesson.studentId &&
      p.date === lesson.date &&
      p.status === 'alındı'
    );
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

  const filtered = lessons.filter(l => {
    const statusOk = statusFilter === 'all' || l.status === statusFilter;
    const studentOk = studentFilter === 'all' || l.studentId === studentFilter;
    return statusOk && studentOk;
  });

  const selStyle = { padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '0.82rem', fontWeight: '500', cursor: 'pointer', outline: 'none', appearance: 'none', paddingRight: '2rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center' };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Dersler</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{filtered.length} ders toplam</p>
        </div>
        <button onClick={() => { setEditLesson(null); setShowModal(true); }}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ders Planla
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.82rem', fontWeight: '600' }}>
          <Filter size={14} /> Filtre:
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selStyle}>
          <option value="all">Tüm Durumlar</option>
          <option value="planlandı">Planlandı</option>
          <option value="tamamlandı">Tamamlandı</option>
          <option value="iptal">İptal</option>
        </select>
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)} style={selStyle}>
          <option value="all">Tüm Öğrenciler</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Lesson List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <BookOpen size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Ders kaydı bulunamadı</p>
          </div>
        )}
        {filtered.map(lesson => {
          const isPaid = isLessonPaid(lesson);
          const fee = getLessonFee(lesson);
          const duration = getDuration(lesson.startTime, lesson.endTime);
          const isScheduled = lesson.status === 'planlandı';
          const isCompleted = lesson.status === 'tamamlandı';
          const isCancelled = lesson.status === 'iptal';

          let dateStr = '';
          try { dateStr = format(parseISO(lesson.date), 'd MMM', { locale: tr }); } catch {}

          return (
            <div key={lesson.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexWrap: 'wrap' }}>
              {/* Date/Time */}
              <div style={{ minWidth: '52px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '500', textTransform: 'capitalize' }}>{dateStr}</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e1b4b', marginTop: '0.1rem' }}>{lesson.startTime?.slice(0, 5)}</div>
              </div>

              {/* Student + info */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{lesson.studentName}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                  {[lesson.subject, duration && `${duration}`, fee > 0 && `₺${fee}`].filter(Boolean).join(' · ')}
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {/* Status badge */}
                <span style={{
                  fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.65rem', borderRadius: '8px',
                  background: isScheduled ? '#e0e7ff' : isCompleted ? '#d1fae5' : '#fee2e2',
                  color: isScheduled ? '#4338ca' : isCompleted ? '#065f46' : '#b91c1c',
                }}>
                  {isScheduled ? 'planlandı' : isCompleted ? 'tamamlandı' : 'iptal'}
                </span>
                {/* Payment badge */}
                {!isCancelled && (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.65rem', borderRadius: '8px',
                    background: isPaid ? '#d1fae5' : '#fef3c7',
                    color: isPaid ? '#065f46' : '#92400e',
                  }}>
                    {isPaid ? 'ödendi' : 'ödenmedi'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
                {isScheduled && (
                  <>
                    <ActionBtn icon={<CheckCircle size={13} />} label="Tamamlandı" color="#059669" onClick={() => markDone(lesson)} />
                    <ActionBtn icon={<XCircle size={13} />} label="İptal" color="#dc2626" onClick={() => markCancel(lesson)} />
                  </>
                )}
                {isCompleted && (
                  <ActionBtn label="Tamamlanmadı" color="#6b7280" onClick={() => markUndone(lesson)} />
                )}
                {!isPaid && !isCancelled && (
                  <ActionBtn label="Ödendi İşaretle" color="#4f46e5" onClick={() => markPaid(lesson)} />
                )}
                {isPaid && !isCancelled && (
                  <ActionBtn label="Ödenmedi" color="#dc2626" onClick={() => markUnpaid(lesson)} />
                )}
                {isCompleted && (
                  <ActionBtn icon={<ClipboardList size={13} />} label={lesson.evaluationRating ? 'Değerlendirmeyi Düzenle' : 'Değerlendir'} color="#7c3aed" onClick={() => setEvalLesson(lesson)} />
                )}
                <ActionBtn icon={<Pencil size={12} />} label="Düzenle" color="#6b7280" onClick={() => { setEditLesson(lesson); setShowModal(true); }} />
              </div>
            </div>
          );
        })}
      </div>

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

function ActionBtn({ icon, label, color, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `${color}15` : 'none',
        border: 'none', color, cursor: 'pointer',
        padding: '0.3rem 0.55rem', borderRadius: '8px',
        fontSize: '0.78rem', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        transition: 'background 0.15s', whiteSpace: 'nowrap',
      }}>
      {icon}{label}
    </button>
  );
}