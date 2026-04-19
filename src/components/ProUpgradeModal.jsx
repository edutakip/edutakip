import React, { useState } from 'react';
import { X, CheckCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const PER_STUDENT_PRICE = 50;

export default function ProUpgradeModal({ onClose, onUpgraded, reason = 'limit' }) {
  const { t } = useTranslation();
  const [studentCount, setStudentCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = studentCount * PER_STUDENT_PRICE;
  const sliderPct = ((studentCount - 1) / (60 - 1)) * 100;

  const handleStartCheckout = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('paddleCheckout', {
        studentCount,
      });

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        alert('Ödeme sayfasına yönlendirilirken hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ödeme sayfasına yönlendirilirken hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const reasonKey = ['limit','ai','finance','whatsapp','assistant'].includes(reason) ? reason : 'limit';
  const msg = { title: t(`proModal.${reasonKey}.title`), desc: t(`proModal.${reasonKey}.desc`) };

  return (
    <>
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInModal {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .pro-modal-backdrop {
          animation: fadeInBackdrop 0.35s cubic-bezier(0.32, 0.72, 0.36, 1) forwards;
        }
        .pro-modal-content {
          animation: slideInModal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="pro-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(6px)' }}>
      <div className="pro-modal-content" style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
          <X size={16} color='#6b7280' />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={32} color='#10b981' />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>{t('proModal.trialStarted')}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('proModal.trialDesc')}</p>
          </div>
        ) : (
          <>
            {/* Başlık */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} color='white' fill='white' />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{msg.title}</h2>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.1rem' }}>{msg.desc}</p>
              </div>
            </div>

            {/* Fiyat hesaplayıcı */}
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', border: '1.5px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>{t('proModal.activeStudents')}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f97316' }}>{studentCount}</span>
              </div>

              {/* Slider */}
              <div style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 999, background: '#e5e7eb' }} />
                <div style={{ position: 'absolute', left: 0, width: `${sliderPct}%`, height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #f59e0b, #f97316)', transition: 'width 0.15s ease' }} />
                <input type='range' min={1} max={60} value={studentCount}
                  onChange={e => setStudentCount(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', opacity: 0, position: 'relative', zIndex: 3 }} />
                <div style={{ position: 'absolute', left: `calc(${sliderPct}% - 12px)`, width: 24, height: 24, borderRadius: '50%', background: 'white', border: '3px solid #f97316', transition: 'left 0.15s ease', pointerEvents: 'none', zIndex: 2 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{t('proModal.perStudent', { price: PER_STUDENT_PRICE })}</span>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500, display: 'block', marginBottom: '0.1rem' }}>{t('proModal.monthlyTotal')}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>{total.toLocaleString('tr-TR')}₺</span>
                </div>
              </div>
            </div>

            {/* Pro özellikler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {t('proModal.features', { returnObjects: true }).map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} color='#10b981' />
                  <span style={{ fontSize: '0.85rem', color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={handleStartCheckout} disabled={loading}
              style={{ width: '100%', padding: '0.95rem', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 8px 20px rgba(249,115,22,0.3)', transition: 'all 0.15s' }}>
              {loading ? t('proModal.loading') : t('proModal.cta')}
            </button>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.6rem' }}>{t('proModal.secureNote')}</p>
          </>
        )}
      </div>
      </div>
    </>
  );
}