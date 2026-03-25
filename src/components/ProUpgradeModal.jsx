import React, { useState } from 'react';
import { X, CheckCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, addDays } from 'date-fns';

const PER_STUDENT_PRICE = 50;

export default function ProUpgradeModal({ onClose, onUpgraded, reason = 'limit' }) {
  const [studentCount, setStudentCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = studentCount * PER_STUDENT_PRICE;
  const sliderPct = ((studentCount - 1) / (60 - 1)) * 100;

  const handleStartTrial = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    const trialEndDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
    await base44.auth.updateMe({
      plan: 'trialing',
      studentLimit: studentCount,
      trialStudentCount: studentCount,
      trialEndDate,
      aiReportsEnabled: true,
      detailedFinanceEnabled: true,
      whatsappEnabled: true,
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onUpgraded?.();
      onClose();
    }, 1800);
  };

  const reasonMessages = {
    limit: { title: 'Öğrenci Limitine Ulaştınız', desc: 'Ücretsiz planda en fazla 3 aktif öğrenci ekleyebilirsiniz.' },
    ai: { title: 'Pro Özellik: AI Ders Raporu', desc: 'Yapay zeka destekli ders raporları Pro plana özeldir.' },
    finance: { title: 'Pro Özellik: Detaylı Finans', desc: 'Gelişmiş finans analizi ve raporları Pro plana özeldir.' },
    whatsapp: { title: 'Pro Özellik: WhatsApp', desc: 'Otomatik WhatsApp bildirimleri Pro plana özeldir.' },
  };
  const msg = reasonMessages[reason] || reasonMessages.limit;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
          <X size={16} color='#6b7280' />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={32} color='#10b981' />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>30 Günlük Deneme Başladı!</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tüm Pro özellikler aktif. İyi dersler!</p>
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
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Aktif öğrenci sayısı</span>
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
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{PER_STUDENT_PRICE}₺ / öğrenci / ay</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>{total.toLocaleString('tr-TR')}₺<span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>/ay</span></span>
              </div>
            </div>

            {/* Pro özellikler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['30 gün ücretsiz deneme', 'Sınırsız AI ders raporu', 'Detaylı finans analizi', 'WhatsApp entegrasyonu', 'Pasif öğrenciler ücretsiz', 'İstediğiniz zaman iptal'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} color='#10b981' />
                  <span style={{ fontSize: '0.85rem', color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={handleStartTrial} disabled={loading}
              style={{ width: '100%', padding: '0.95rem', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 900, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 8px 20px rgba(249,115,22,0.3)', transition: 'all 0.15s' }}>
              {loading ? 'Başlatılıyor...' : '30 Gün Ücretsiz Başla'}
            </button>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.6rem' }}>Kredi kartı gerekmez · 30 gün sonra ödeme</p>
          </>
        )}
      </div>
    </div>
  );
}