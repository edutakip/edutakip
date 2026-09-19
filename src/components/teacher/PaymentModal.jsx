import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import PaymentReceiptModal from './PaymentReceiptModal';

export default function PaymentModal({ student, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    amount: student?.monthlyFee || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'alındı', method: 'nakit', description: '', month: format(new Date(), 'yyyy-MM'),
  });
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptStudent, setReceiptStudent] = useState(null);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    const paidAmount = Number(form.amount);

    const freshStudents = await base44.entities.Student.filter({ id: student.id });
    const freshStudent = freshStudents[0] || student;

    const [allLessons, allPayments] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email, studentId: student.id }),
      base44.entities.Payment.filter({ teacherEmail: me.email, studentId: student.id }),
    ]);

    // Sadece lessonId ile eşleştir — tarih bazlı eşleştirme kaldırıldı
    const paidLessonIds = new Set(
      allPayments
        .filter(p => p.status === 'alındı' && p.lessonId)
        .map(p => p.lessonId)
    );

    // lessonId'si olmayan eski ödemeler için: tarih + tutar kombinasyonu ile eşleştir
    const paidDateAmounts = new Set(
      allPayments
        .filter(p => p.status === 'alındı' && !p.lessonId)
        .map(p => `${p.date}_${p.amount}`)
    );

    // En eski ödenmemiş tamamlanmış dersi bul
    const oldestUnpaid = allLessons
      .filter(l =>
        l.status === 'tamamlandı' &&
        !paidLessonIds.has(l.id) &&
        !paidDateAmounts.has(`${l.date}_${l.lessonFee}`)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    const paymentDate = oldestUnpaid ? oldestUnpaid.date : form.date;

    const createdPayment = await base44.entities.Payment.create({
      ...form,
      amount: paidAmount,
      date: paymentDate,
      month: paymentDate.slice(0, 7),
      lessonId: oldestUnpaid ? oldestUnpaid.id : null,
      studentId: student.id,
      studentName: student.name,
      teacherEmail: me.email,
      parentPhone: freshStudent.parentPhone || '',
      parentName: freshStudent.parentName || '',
    });

    setLoading(false);
    onSaved();

    if (form.status === 'alındı') {
      setReceiptStudent(freshStudent);
      setReceiptData({
        ...createdPayment,
        ...form,
        amount: paidAmount,
        date: paymentDate,
        studentName: student.name,
        studentId: student.id,
      });
    } else {
      onClose();
    }
  };

  const inputStyle = { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', color: '#6b7280', fontWeight: '700', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  if (receiptData) {
    return <PaymentReceiptModal payment={receiptData} student={receiptStudent || student} onClose={onClose} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', border: '1px solid #e5e7eb', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '1.15rem', fontWeight: '800' }}>{t('teacher.paymentModal.title')}</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.15rem' }}>{student?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {student?.parentPhone && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '0.55rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.paymentModal.parentPhone')}:</span>
              <a href={`tel:${student.parentPhone}`} style={{ color: '#15803d', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none' }}>{student.parentPhone}</a>
              {student.parentName && <span style={{ color: '#86efac', fontSize: '0.78rem' }}>({student.parentName})</span>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>{t('teacher.paymentModal.amount')}</label>
              <input style={inputStyle} type='number' placeholder='0' value={form.amount} onChange={e => u('amount', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t('teacher.paymentModal.date')}</label>
              <input style={inputStyle} type='date' value={form.date} onChange={e => u('date', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>{t('teacher.paymentModal.status')}</label>
              <select style={inputStyle} value={form.status} onChange={e => u('status', e.target.value)}>
                <option value='alındı'>{t('teacher.paymentModal.received')}</option>
                <option value='bekliyor'>{t('teacher.paymentModal.pending')}</option>
                <option value='gecikmiş'>{t('teacher.paymentModal.overdue')}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('teacher.paymentModal.method')}</label>
              <select style={inputStyle} value={form.method} onChange={e => u('method', e.target.value)}>
                <option value='nakit'>{t('teacher.paymentModal.cash')}</option>
                <option value='havale'>{t('teacher.paymentModal.transfer')}</option>
                <option value='diger'>{t('teacher.paymentModal.other')}</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('teacher.paymentModal.description')}</label>
            <input style={inputStyle} placeholder={t('teacher.paymentModal.descriptionPlaceholder')} value={form.description} onChange={e => u('description', e.target.value)} />
          </div>
          <button onClick={save} disabled={loading || !form.amount}
            style={{ padding: '0.85rem', borderRadius: '12px', border: 'none', background: loading || !form.amount ? '#86efac' : 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: loading || !form.amount ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(34,197,94,0.4)', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!loading && form.amount) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {loading ? <><Loader2 size={16} /> {t('teacher.paymentModal.saving')}</> : t('teacher.paymentModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
}