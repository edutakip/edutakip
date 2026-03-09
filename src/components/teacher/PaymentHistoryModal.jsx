import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PaymentHistoryModal({ student, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Payment.filter({ studentId: student.id }, '-date').then(p => {
      setPayments(p);
      setLoading(false);
    });
  }, [student.id]);

  const totalEarned = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalCollected = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);

  const statusConfig = {
    'alındı': { bg: '#d1fae5', color: '#065f46', label: 'Alındı' },
    'bekliyor': { bg: '#fef3c7', color: '#92400e', label: 'Bekleniyor' },
    'gecikmiş': { bg: '#fee2e2', color: '#b91c1c', label: 'Gecikmişi' },
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1535, #1e1b4b)',
        borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '85vh', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'linear-gradient(145deg, #1a1535, #1e1b4b)',
          zIndex: 10, borderRadius: '20px 20px 0 0'
        }}>
          <div>
            <h2 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800' }}>
              Ödeme Geçmişi
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              {student.name}
            </p>
          </div>
          <button onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              borderRadius: '8px', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px', padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <TrendingUp size={14} color='#818cf8' />
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(165,180,252,0.7)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Toplam Hak Edilen
                </span>
              </div>
              <div style={{ color: '#818cf8', fontWeight: '900', fontSize: '1.3rem' }}>
                ₺{totalEarned.toLocaleString('tr-TR')}
              </div>
            </div>

            <div style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px', padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <DollarSign size={14} color='#22c55e' />
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(34,197,94,0.7)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Tahsil Edilen
                </span>
              </div>
              <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '1.3rem' }}>
                ₺{totalCollected.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          {/* Payments List */}
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
              Yükleniyor...
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
              Henüz ödeme kaydı yok
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {payments.map(payment => {
                const cfg = statusConfig[payment.status] || { bg: '#f3f4f6', color: '#6b7280', label: payment.status };
                let dateStr = '';
                try {
                  dateStr = format(parseISO(payment.date), 'd MMMM yyyy', { locale: tr });
                } catch { }

                return (
                  <div key={payment.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '1rem', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                        ₺{(payment.amount || 0).toLocaleString('tr-TR')}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', display: 'flex', gap: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} /> {dateStr}
                        </span>
                        {payment.method && <span>{payment.method}</span>}
                      </div>
                      {payment.description && (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                          {payment.description}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.8rem',
                      borderRadius: '8px', background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap'
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}