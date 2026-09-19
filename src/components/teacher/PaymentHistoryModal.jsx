import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, TrendingDown, TrendingUp, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import PaymentReceiptModal from './PaymentReceiptModal';

export default function PaymentHistoryModal({ student, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    base44.entities.Payment.filter({ studentId: student.id }, '-date').then(p => {
      setPayments(p);
      setLoading(false);
    });
  }, [student.id]);

  // Borç: sadece bekliyor/gecikmiş, Tahsilat: alındı
  const realDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const realCollected = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  // balance > 0 → fazla ödeme, balance < 0 → borçlu
  const balance = realCollected - realDebt;

  const formatDate = (dateStr) => {
    try { return format(parseISO(dateStr), 'd MMM yyyy', { locale: tr }); } catch { return dateStr; }
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
        maxHeight: '90vh', overflowY: 'auto',
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
            <h2 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800' }}>Ödeme Geçmişi</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{student.name}</p>
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
        <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>Yükleniyor...</div>
          ) : (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: 'rgba(252,165,165,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Toplam Borç</div>
                  <div style={{ color: '#f87171', fontWeight: '900', fontSize: '1.05rem' }}>₺{realDebt.toLocaleString('tr-TR')}</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: 'rgba(34,197,94,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Alınan Ödeme</div>
                  <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '1.05rem' }}>₺{realCollected.toLocaleString('tr-TR')}</div>
                </div>
                <div style={{
                  background: balance < 0 ? 'rgba(249,115,22,0.12)' : 'rgba(34,197,94,0.12)',
                  border: `1px solid ${balance < 0 ? 'rgba(249,115,22,0.25)' : 'rgba(34,197,94,0.25)'}`,
                  borderRadius: '12px', padding: '0.85rem', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: balance < 0 ? 'rgba(249,115,22,0.6)' : 'rgba(34,197,94,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Bakiye</div>
                  <div style={{ color: balance < 0 ? '#fb923c' : '#22c55e', fontWeight: '900', fontSize: '1.05rem' }}>
                    {balance < 0 ? `-₺${Math.abs(balance).toLocaleString('tr-TR')}` : '✓ Kapalı'}
                  </div>
                </div>
              </div>

              {/* Log Title */}
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                İşlem Geçmişi
              </div>

              {/* Log */}
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                  Henüz kayıt yok
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {payments.map(payment => {
                    const isReceived = payment.status === 'alındı';
                    const iconBg = isReceived ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
                    const iconColor = isReceived ? '#22c55e' : '#f87171';
                    const borderColor = isReceived ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
                    const label = isReceived ? 'Ödeme Alındı' : 'Borç Eklendi';
                    const amountPrefix = isReceived ? '+' : '-';

                    return (
                      <div key={payment.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '12px', padding: '0.85rem 1rem',
                        display: 'flex', alignItems: 'center', gap: '0.9rem'
                      }}>
                        {/* Icon */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: iconBg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0
                        }}>
                          {isReceived
                            ? <TrendingUp size={16} color={iconColor} />
                            : <TrendingDown size={16} color={iconColor} />
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '0.88rem' }}>{label}</div>
                          {payment.description && (
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', marginTop: '0.15rem' }}>{payment.description}</div>
                          )}
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '0.2rem' }}>{formatDate(payment.date)}</div>
                        </div>

                        {/* Amount + Receipt */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ color: iconColor, fontWeight: '800', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                            {amountPrefix}₺{(payment.amount || 0).toLocaleString('tr-TR')}
                          </div>
                          {isReceived && (
                            <button onClick={() => setSelectedReceipt(payment)} title="Makbuz Göster"
                              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}>
                              <Receipt size={13} color='#a5b4fc' />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedReceipt && (
        <PaymentReceiptModal
          payment={selectedReceipt}
          student={student}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}