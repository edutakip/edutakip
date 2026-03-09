import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PaymentHistoryModal({ student, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);

  useEffect(() => {
    base44.entities.Payment.filter({ studentId: student.id }, '-date').then(p => {
      setPayments(p);
      setLoading(false);
    });
  }, [student.id]);

  const totalEarned = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalCollected = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const pending = totalEarned - totalCollected;

  const statusConfig = {
    'alındı': { label: 'Alındı', icon: '✓' },
    'bekliyor': { label: 'Bekleniyor', icon: '⏱' },
    'gecikmiş': { label: 'Gecikmişi', icon: '⚠' },
  };

  const methodLabel = (method) => {
    const methods = { 'nakit': 'Nakit', 'havale': 'Havale', 'diğer': 'Diğer' };
    return methods[method] || method;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1535, #1e1b4b)',
        borderRadius: '20px', width: '100%', maxWidth: '540px',
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
        <div style={{ padding: '1.75rem', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
              Yükleniyor...
            </div>
          ) : (
            <>
              {/* Summary Section */}
              <div style={{ marginBottom: '1.75rem' }}>
                {/* Top Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div style={{
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '12px', padding: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(165,180,252,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Kazanç
                    </div>
                    <div style={{ color: '#818cf8', fontWeight: '900', fontSize: '1.2rem' }}>
                      -₺{totalEarned.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '12px', padding: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(34,197,94,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Alınan Ödeme
                    </div>
                    <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '1.2rem' }}>
                      ₺{totalCollected.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>

                {/* Pending Payment */}
                {pending > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.1))',
                    border: '1px solid rgba(249,115,22,0.3)',
                    borderRadius: '12px', padding: '0.85rem', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(249,115,22,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Beklemede
                    </div>
                    <div style={{ color: '#fb923c', fontWeight: '900', fontSize: '1.15rem' }}>
                      ₺{pending.toLocaleString('tr-TR')}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

              {/* Payments List Title */}
              <div style={{
                fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.85rem'
              }}>
                Ödeme Detayları
              </div>

              {/* Payments List */}
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                  Henüz ödeme kaydı yok
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {payments.map(payment => {
                    const cfg = statusConfig[payment.status] || { label: payment.status, icon: '•' };
                    let dateStr = '';
                    try {
                      dateStr = format(parseISO(payment.date), 'd MMM yyyy', { locale: tr });
                    } catch { }
                    const isExpanded = expandedId === payment.id;

                    return (
                      <div key={payment.id}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px', padding: '0.9rem 1rem', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', flex: 1 }}>
                            {/* Icon + Amount */}
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '10px',
                              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#818cf8', fontWeight: '800', fontSize: '0.85rem'
                            }}>
                              💰
                            </div>
                            {/* Text */}
                            <div>
                              <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '0.9rem' }}>
                                ₺{(payment.amount || 0).toLocaleString('tr-TR')}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                {dateStr}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{
                              fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.75rem',
                              borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                              whiteSpace: 'nowrap'
                            }}>
                              {cfg.label}
                            </span>
                            <ChevronDown size={16} color='rgba(255,255,255,0.3)' style={{
                              transition: 'transform 0.2s',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                            }} />
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderTop: 'none', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px',
                            padding: '0.85rem 1rem'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                              <div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginBottom: '0.3rem', fontWeight: '600' }}>Yöntem</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{methodLabel(payment.method)}</div>
                              </div>
                              <div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginBottom: '0.3rem', fontWeight: '600' }}>Durum</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{cfg.label}</div>
                              </div>
                            </div>
                            {payment.description && (
                              <div style={{ marginTop: '0.6rem' }}>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginBottom: '0.3rem', fontWeight: '600' }}>Not</div>
                                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{payment.description}</div>
                              </div>
                            )}
                            {payment.status !== 'alındı' && (
                              <button
                                onClick={() => {
                                  base44.entities.Payment.update(payment.id, { status: 'alındı' });
                                  setPayments(payments.map(p => p.id === payment.id ? { ...p, status: 'alındı' } : p));
                                  setExpandedId(null);
                                }}
                                style={{
                                  marginTop: '0.85rem', width: '100%', background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                  border: 'none', color: 'white', borderRadius: '10px', padding: '0.6rem',
                                  fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                ✓ Tahsil Et
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}