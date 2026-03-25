import React, { useState } from 'react';
import { Zap, Crown, CheckCircle, Clock } from 'lucide-react';
import { getPlanLabel, getDaysLeft } from '@/lib/subscription';
import ProUpgradeModal from './ProUpgradeModal';

const FREE_PERKS = [
  { text: '3 öğrenci limiti', locked: false },
  { text: 'AI ders raporları', locked: true },
  { text: 'WhatsApp bildirimleri', locked: true },
  { text: 'Detaylı finans analizi', locked: true },
];

export default function SubscriptionWidget({ user, collapsed }) {
  const [showModal, setShowModal] = useState(false);

  if (!user || collapsed) return null;

  const plan = user.plan || 'free';
  const daysLeft = getDaysLeft(user);
  const isFree = plan === 'free';
  const isTrialing = plan === 'trialing';
  const isPro = plan === 'pro';
  const isExpired = plan === 'expired';

  const trialProgress = isTrialing && daysLeft !== null
    ? Math.max(0, Math.min(100, (daysLeft / 30) * 100))
    : 0;

  return (
    <>
      {/* ── Trialing / Pro / Expired ── */}
      {!isFree && (
        <div style={{
          margin: '0 0.75rem 0.75rem',
          padding: '0.85rem 0.9rem',
          background: isPro ? 'rgba(16,185,129,0.12)' : isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.13)',
          border: `1px solid ${isPro ? 'rgba(16,185,129,0.3)' : isExpired ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.3)'}`,
          borderRadius: '12px',
        }}>
          {/* Plan başlığı */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isTrialing ? '0.65rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isPro && <Crown size={13} color='#10b981' fill='#10b981' />}
              {isTrialing && <Clock size={13} color='#a5b4fc' />}
              {isExpired && <CheckCircle size={13} color='#fca5a5' />}
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isPro ? '#6ee7b7' : isExpired ? '#fca5a5' : '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isPro ? 'Pro Hesap' : isExpired ? 'Süresi Doldu' : 'Deneme Süresi'}
              </span>
            </div>
            {isTrialing && daysLeft !== null && (
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: daysLeft < 5 ? '#fca5a5' : '#fbbf24' }}>
                {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Bugün bitiyor!'}
              </span>
            )}
          </div>

          {/* Trialing: progress bar + abone ol */}
          {isTrialing && (
            <>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.65rem' }}>
                <div style={{
                  height: '100%',
                  width: `${trialProgress}%`,
                  borderRadius: 999,
                  background: daysLeft < 5 ? 'linear-gradient(90deg,#f97316,#ef4444)' : 'linear-gradient(90deg,#6366f1,#a78bfa)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <button onClick={() => setShowModal(true)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
                <Crown size={13} fill='white' /> Abone Ol
              </button>
            </>
          )}

          {/* Expired: yenile butonu */}
          {isExpired && (
            <button onClick={() => setShowModal(true)}
              style={{ width: '100%', marginTop: '0.65rem', padding: '0.55rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
              Yenile
            </button>
          )}
        </div>
      )}

      {/* ── Free: teşvik kutusu ── */}
      {isFree && (
        <div style={{
          margin: '0 0.75rem 0.75rem',
          padding: '0.9rem',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Zap size={13} color='#a5b4fc' fill='#a5b4fc' />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ücretsiz Hesap</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.7rem' }}>
            <style>{`
              @keyframes lockedGlow {
                0%, 100% { color: rgba(255,255,255,0.5); }
                50% { color: rgba(255,255,255,0.75); }
              }
              .locked-feature {
                animation: lockedGlow 3s ease-in-out infinite;
              }
            `}</style>
            {FREE_PERKS.map(p => (
              <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', flexShrink: 0 }}>{p.locked ? '🔒' : '✓'}</span>
                <span className={p.locked ? 'locked-feature' : ''} style={{ fontSize: '0.75rem', color: p.locked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.65)', lineHeight: 1.4, fontWeight: p.locked ? 500 : 400 }}>{p.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(79,70,229,0.4)', animation: 'heartbeatGlow 2.8s ease-in-out infinite' }}>
            <style>{`
              @keyframes heartbeatGlow {
                0%, 100% { box-shadow: 0 4px 12px rgba(79,70,229,0.4); }
                25% { box-shadow: 0 8px 24px rgba(79,70,229,0.7); }
                50% { box-shadow: 0 4px 12px rgba(79,70,229,0.4); }
              }
            `}</style>
            <Crown size={13} fill='white' /> Pro Paket'e Geç
          </button>
        </div>
      )}

      {showModal && (
        <ProUpgradeModal
          reason='limit'
          onClose={() => setShowModal(false)}
          onUpgraded={() => setShowModal(false)}
        />
      )}
    </>
  );
}