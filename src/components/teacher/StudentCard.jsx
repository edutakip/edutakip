import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Clock, DollarSign, AlertCircle, Plus, User } from 'lucide-react';

export default function StudentCard({ student, onAddPayment }) {
  const [debt, setDebt] = useState(null);
  const [editingFee, setEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState('');

  useEffect(() => {
    base44.entities.Payment.filter({ studentId: student.id }).then(payments => {
      const pending = payments
        .filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş')
        .reduce((s, p) => s + (p.amount || 0), 0);
      setDebt(pending);
    });
  }, [student.id]);

  const initials = student.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const lessonFee = student.monthlyFee && student.weeklyLessons
    ? Math.round(student.monthlyFee / (student.weeklyLessons * 4.3))
    : null;

  const startEditFee = () => {
    setFeeValue(lessonFee || '');
    setEditingFee(true);
  };

  const saveFee = async () => {
    const newFee = parseInt(feeValue);
    if (!isNaN(newFee) && newFee > 0) {
      const newMonthlyFee = Math.round(newFee * (student.weeklyLessons || 1) * 4.3);
      await base44.entities.Student.update(student.id, { monthlyFee: newMonthlyFee });
      student.monthlyFee = newMonthlyFee;
    }
    setEditingFee(false);
  };

  const hasDebt = debt && debt > 0;

  return (
    <div
      style={{
        background: 'white', borderRadius: '16px',
        border: `1.5px solid ${hasDebt ? '#fde68a' : '#e5e7eb'}`,
        padding: '1.25rem', transition: 'all 0.2s', cursor: 'default',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
    >
      {/* Top: avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: '0.9rem',
          boxShadow: '0 4px 10px rgba(79,70,229,0.25)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '0.95rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{student.name}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {student.grade && (
              <span style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '0.68rem', fontWeight: '600', padding: '0.1rem 0.5rem', borderRadius: '20px' }}>
                {student.grade}
              </span>
            )}
            {student.subject && (
              <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.68rem', fontWeight: '600', padding: '0.1rem 0.5rem', borderRadius: '20px' }}>
                {student.subject}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {/* Weekly lessons */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.65rem 0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
            <BookOpen size={14} color='#4f46e5' />
          </div>
          <div style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', lineHeight: 1 }}>
            {student.weeklyLessons || 1}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '0.2rem', fontWeight: '500' }}>Haftalık ders</div>
        </div>

        {/* Lesson fee */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.65rem 0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
            <Clock size={14} color='#10b981' />
          </div>
          <div style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', lineHeight: 1 }}>
            {lessonFee ? `₺${lessonFee}` : '—'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '0.2rem', fontWeight: '500' }}>Ders/saati</div>
        </div>

        {/* Debt */}
        <div style={{ background: hasDebt ? '#fef9c3' : '#f8fafc', borderRadius: '10px', padding: '0.65rem 0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
            <AlertCircle size={14} color={hasDebt ? '#d97706' : '#94a3b8'} />
          </div>
          <div style={{ color: hasDebt ? '#b45309' : '#111827', fontWeight: '700', fontSize: '1rem', lineHeight: 1 }}>
            {debt === null ? '...' : debt > 0 ? `₺${debt.toLocaleString('tr-TR')}` : '₺0'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '0.2rem', fontWeight: '500' }}>Borç</div>
        </div>
      </div>

      {/* Invite code */}
      {student.inviteCode && !student.inviteAccepted && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.45rem 0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: '600' }}>Davet Kodu:</span>
          <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px' }}>{student.inviteCode}</span>
        </div>
      )}

      {/* Add payment button */}
      <button
        onClick={() => onAddPayment(student)}
        style={{
          width: '100%', padding: '0.55rem', borderRadius: '10px',
          border: '1.5px solid #e5e7eb', background: 'white',
          color: '#374151', fontWeight: '600', fontSize: '0.8rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.background = '#eef2ff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'white'; }}
      >
        <Plus size={14} /> Ödeme Ekle
      </button>
    </div>
  );
}