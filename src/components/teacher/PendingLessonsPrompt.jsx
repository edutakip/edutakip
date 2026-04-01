import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, ClipboardList, Clock } from 'lucide-react';
import LessonReportModal from './LessonReportModal';
import { useTranslation } from 'react-i18next';

export default function PendingLessonsPrompt({ onDone }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const lessons = await base44.entities.Lesson.filter({ teacherEmail: me.email, status: 'planlandı' });
      const now = new Date();
      const overdue = lessons.filter(l => {
        if (!l.date || !l.endTime) return false;
        const end = new Date(`${l.date}T${l.endTime}`);
        return end < now;
      });
      if (overdue.length > 0) {
        setPending(overdue);
        setCurrent(overdue[0]);
      }
    })();
  }, []);

  if (!current || dismissed) return null;

  const markDone = async () => {
    await base44.entities.Lesson.update(current.id, { status: 'tamamlandı' });

    // Ders ücretini hesapla
    let fee = current.lessonFee || 0;
    if (!fee) {
      try {
        const student = await base44.entities.Student.filter({ id: current.studentId });
        fee = student?.[0]?.feePerLesson || 0;
      } catch {}
    }

    // Bekliyor ödeme kaydı oluştur (yoksa)
    if (fee > 0) {
      const existing = await base44.entities.Payment.filter({ studentId: current.studentId, date: current.date });
      const alreadyExists = existing.some(p => p.description?.includes('Ders') || p.date === current.date);
      if (!alreadyExists) {
        await base44.entities.Payment.create({
          studentId: current.studentId,
          studentName: current.studentName,
          teacherEmail: current.teacherEmail,
          amount: fee,
          date: current.date,
          status: 'bekliyor',
          description: `${current.subject || 'Ders'} - ${current.date}`,
          month: current.date?.slice(0, 7),
        });
      }
    }

    setShowReport(true);
  };

  const markCancel = async () => {
    await base44.entities.Lesson.update(current.id, { status: 'iptal' });
    nextLesson();
  };

  const nextLesson = () => {
    const remaining = pending.filter(l => l.id !== current.id);
    setPending(remaining);
    if (remaining.length > 0) {
      setCurrent(remaining[0]);
    } else {
      setDismissed(true);
      onDone?.();
    }
  };

  const handleReportClose = () => {
    setShowReport(false);
    nextLesson();
  };

  const formatDate = (d, time) => {
    if (!d) return '';
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const date = new Date(d);
    return `${days[date.getDay()]} ${d.split('-').reverse().join('.')} ${time ? time.slice(0,5) : ''}`;
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}>
        <div style={{
          background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '440px', width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Clock size={26} color='#f59e0b' />
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', marginBottom: '0.4rem' }}>
            {t('teacher.pendingPrompt.title')}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {t('teacher.pendingPrompt.question')}
          </p>

          {/* Lesson Card */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{current.studentName}</div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {current.subject && `${current.subject} · `}{formatDate(current.date, current.startTime)}
            </div>
            {pending.length > 1 && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                +{pending.length - 1} {t('teacher.pendingPrompt.moreWaiting')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={markCancel}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #fee2e2', background: 'white', color: '#dc2626', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <XCircle size={16} /> {t('teacher.pendingPrompt.didNotHappen')}
            </button>
            <button onClick={markDone}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              <CheckCircle size={16} /> {t('teacher.pendingPrompt.happened')}
            </button>
          </div>

          <button onClick={() => setDismissed(true)}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer' }}>
            {t('teacher.pendingPrompt.remindLater')}
          </button>
        </div>
      </div>

      {showReport && (
        <LessonReportModal
          lesson={{ ...current, status: 'tamamlandı' }}
          onClose={handleReportClose}
          onSaved={handleReportClose}
        />
      )}
    </>
  );
}