import React, { useEffect, useState, useCallback } from 'react';
import { Phone, Clock, DollarSign, BookOpen, Plus, Copy, Check } from 'lucide-react';

export default function StudentCard({ student, onAddPayment, onCardClick }) {
  const [payments, setPayments] = useState([]);
  const [copied, setCopied] = useState(false);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(student.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchPayments = useCallback(() => {
    import('@/api/base44Client').then(({ base44 }) => {
      base44.entities.Payment.filter({ studentId: student.id }).then(setPayments);
    });
  }, [student.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAddPayment = async (e) => {
    e.stopPropagation();
    await onAddPayment();
    fetchPayments();
  };

  const monthlyFee = student.monthlyFee || 0;
  const weeklyLessons = student.weeklyLessons || 1;
  const lessonFee = student.feePerLesson || 0;

  const earned = payments.filter(p => p.status === 'bekliyor').reduce((s, p) => s + (p.amount || 0), 0);
  const collected = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const balance = collected - earned; // negative = owes

  return (
    <div onClick={onCardClick} style={{
      background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '1.25rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      cursor: 'pointer',
      transition: 'border-color 0.15s, transform 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      {/* Name + badges */}
      <div>
        <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{student.name}</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {student.grade && (
            <span style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: '600', padding: '0.18rem 0.55rem', borderRadius: '6px' }}>
              {student.grade}
            </span>
          )}
          <span style={{ background: 'transparent', border: `1px solid ${student.status === 'active' ? '#22c55e' : '#9ca3af'}`, color: student.status === 'active' ? '#22c55e' : '#9ca3af', fontSize: '0.68rem', fontWeight: '700', padding: '0.18rem 0.55rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: student.status === 'active' ? '#22c55e' : '#9ca3af', display: 'inline-block' }} />
            {student.status === 'active' ? 'Aktif' : 'Arşiv'}
          </span>
        </div>
      </div>

      {/* Invite Code */}
      {student.inviteCode && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99,102,241,0.12)', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: '10px', padding: '0.5rem 0.75rem' }}>
          <div>
            <div style={{ color: 'rgba(165,180,252,0.7)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '0.15rem' }}>DAVETİYE KODU</div>
            <span style={{ color: '#a5b4fc', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '2px' }}>{student.inviteCode}</span>
          </div>
          <button onClick={copyCode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : 'rgba(165,180,252,0.7)', padding: '0.25rem', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      )}

      {/* Phone */}
      {student.phone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
          <Phone size={13} />
          <span>{student.phone}</span>
        </div>
      )}

      {/* Haftalık + Saatlik boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(99,102,241,0.2))', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '12px', padding: '0.75rem' }}>
          <div style={{ color: 'rgba(165,180,252,0.8)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '0.4rem' }}>HAFTALIK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>
            <Clock size={14} color='#818cf8' />
            {weeklyLessons} Ders
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(139,92,246,0.2))', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '12px', padding: '0.75rem' }}>
          <div style={{ color: 'rgba(196,181,253,0.8)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '0.4rem' }}>SAATLİK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>
            <DollarSign size={14} color='#a78bfa' />
            ₺{lessonFee.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Subject badge */}
      {student.subject && (
        <div>
          <span style={{ border: '1px solid #f97316', color: '#fb923c', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={11} />
            {student.subject}
          </span>
        </div>
      )}

      {/* Finance table */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.85rem' }}>
        {[
          { label: 'Aylık Gelir (MRR)', value: `₺${monthlyFee.toLocaleString('tr-TR')}`, color: 'white' },
          { label: 'Hak Edilen', value: `₺${earned.toLocaleString('tr-TR')}`, color: 'rgba(255,255,255,0.7)' },
          { label: 'Tahsil Edilen', value: `₺${collected.toLocaleString('tr-TR')}`, color: '#22c55e' },
        ].map(({ label, value, color }, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{label}</span>
            <span style={{ color, fontWeight: '700', fontSize: '0.82rem' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Footer: balance + payment button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', gap: '0.75rem' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>▤</span> BAKİYE
          </div>
          <div style={{ color: balance < 0 ? '#f87171' : '#22c55e', fontWeight: '800', fontSize: '1.15rem' }}>
            {balance < 0 ? '-' : '+'}₺{Math.abs(balance).toLocaleString('tr-TR')}
          </div>
        </div>
        <button
          onClick={handleAddPayment}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            border: 'none', color: 'white', borderRadius: '10px',
            padding: '0.6rem 1.1rem', fontWeight: '700', fontSize: '0.82rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={14} /> Ödeme
        </button>
      </div>
    </div>
  );
}