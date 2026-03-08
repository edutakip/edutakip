import React from 'react';
import { Phone, BookOpen, TrendingUp, Plus } from 'lucide-react';

export default function StudentCard({ student, onAddPayment }) {
  const statusColor = student.status === 'active' ? 'var(--success)' : 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '16px',
      border: '1px solid var(--border)', padding: '1.25rem',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>{student.name}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
              {student.grade || 'Sınıf ?'}
            </span>
            <span style={{ background: statusColor + '20', color: statusColor, fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
              {student.status === 'active' ? 'Aktif' : 'Arşiv'}
            </span>
          </div>
        </div>
      </div>

      {student.phone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          <Phone size={13} />{student.phone}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ background: 'var(--bg-hover)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Haftalık</div>
          <div style={{ color: 'var(--info)', fontWeight: '700', fontSize: '0.95rem' }}>
            <BookOpen size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
            {student.weeklyLessons || 1} Ders
          </div>
        </div>
        <div style={{ background: 'var(--bg-hover)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Aylık</div>
          <div style={{ color: 'var(--purple)', fontWeight: '700', fontSize: '0.95rem' }}>
            ₺{student.monthlyFee?.toLocaleString('tr-TR') || '0'}
          </div>
        </div>
      </div>

      {/* Subject */}
      {student.subject && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          <TrendingUp size={13} />{student.subject}
        </div>
      )}

      {/* Invite code */}
      {student.inviteCode && !student.inviteAccepted && (
        <div style={{ background: 'var(--warning)' + '15', border: '1px solid var(--warning)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ color: 'var(--warning)', fontSize: '0.72rem', fontWeight: '600' }}>Veli Davet Kodu</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '2px' }}>{student.inviteCode}</div>
        </div>
      )}

      {/* Add payment */}
      <button onClick={() => onAddPayment(student)}
        style={{
          width: '100%', padding: '0.5rem', borderRadius: '10px',
          border: '1px solid var(--accent)', background: 'transparent',
          color: 'var(--accent)', fontWeight: '600', fontSize: '0.8rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
        <Plus size={14} /> Ödeme Ekle
      </button>
    </div>
  );
}