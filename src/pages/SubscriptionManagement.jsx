import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle, XCircle, Crown, Zap, Calendar, Users, RefreshCw,
  AlertTriangle, ArrowRight, CreditCard, Clock, TrendingUp
} from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';

const PADDLE_BILLING_URL = 'https://paddle.com/billing';

function StatCard({ icon: Icon, label, value, color = '#6366f1', bg = '#eef2ff' }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem',
      border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111827', margin: '0.15rem 0 0' }}>{value}</p>
      </div>
    </div>
  );
}

const PLAN_CONFIG = {
  free: { label: 'Ücretsiz', color: '#6b7280', bg: '#f3f4f6', icon: '🆓' },
  trialing: { label: 'Deneme', color: '#f97316', bg: '#fff7ed', icon: '⏳' },
  pro: { label: 'Pro', color: '#7c3aed', bg: '#f5f3ff', icon: '👑' },
  expired: { label: 'Süresi Doldu', color: '#ef4444', bg: '#fef2f2', icon: '❌' },
};

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const s = await base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' });
        setStudents(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={28} color='#6366f1' style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const plan = user?.plan || 'free';
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const studentLimit = user?.studentLimit ?? 3;
  const activeStudents = students.length;
  const usagePercent = Math.min(100, Math.round((activeStudents / studentLimit) * 100));

  const daysLeft = (() => {
    if (plan !== 'trialing') return null;
    const end = user?.trialEndDate;
    if (!end) return null;
    return Math.max(0, Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24)));
  })();

  const paddleSubId = user?.paddleSubscriptionId;

  const features = [
    { label: 'Aktif öğrenci yönetimi', enabled: true },
    { label: 'Ders planlama ve takvim', enabled: true },
    { label: 'Ödeme takibi', enabled: true },
    { label: 'WhatsApp bildirimleri', enabled: plan === 'pro' || plan === 'trialing' },
    { label: 'AI destekli ders raporları', enabled: plan === 'pro' || plan === 'trialing' },
    { label: 'Detaylı finans analizi', enabled: plan === 'pro' || plan === 'trialing' },
    { label: 'AI Asistan (sınırsız)', enabled: plan === 'pro' || plan === 'trialing' },
    { label: 'Akıllı ücret artışı önerileri', enabled: plan === 'pro' || plan === 'trialing' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>Abonelik Yönetimi</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>Plan detaylarınızı ve özelliklerinizi buradan yönetebilirsiniz.</p>
        </div>

        {/* Current Plan Banner */}
        <div style={{
          background: plan === 'pro'
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : plan === 'trialing'
            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
            : plan === 'expired'
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #6b7280, #9ca3af)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          color: 'white',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{planCfg.icon}</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{planCfg.label} Plan</span>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.9rem', margin: 0 }}>
              {plan === 'pro' && paddleSubId && `Abonelik ID: ${paddleSubId.slice(0, 20)}...`}
              {plan === 'trialing' && daysLeft !== null && `Deneme süresi: ${daysLeft} gün kaldı`}
              {plan === 'free' && 'Temel özellikler aktif'}
              {plan === 'expired' && 'Aboneliğinizin süresi doldu. Yenileyin.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {plan !== 'pro' && (
              <button onClick={() => setShowUpgradeModal(true)} style={{
                background: 'white', border: 'none', borderRadius: 10,
                padding: '0.6rem 1.2rem', fontWeight: 800, cursor: 'pointer',
                color: plan === 'trialing' ? '#f97316' : plan === 'expired' ? '#ef4444' : '#4f46e5',
                fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <Crown size={15} />
                {plan === 'expired' ? 'Yenile' : 'Pro\'ya Geç'}
              </button>
            )}
            {plan === 'pro' && paddleSubId && (
              <a href={PADDLE_BILLING_URL} target="_blank" rel="noreferrer" style={{
                background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer',
                color: 'white', fontSize: '0.88rem', display: 'flex', alignItems: 'center',
                gap: '0.4rem', textDecoration: 'none',
              }}>
                <CreditCard size={15} />
                Fatura Yönetimi
              </a>
            )}
          </div>
        </div>

        {/* Trial countdown bar */}
        {plan === 'trialing' && daysLeft !== null && (
          <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1.5px solid #fed7aa', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} /> Deneme Süresi
              </span>
              <span style={{ fontWeight: 800, color: daysLeft < 5 ? '#ef4444' : '#f97316', fontSize: '0.9rem' }}>
                {daysLeft} gün kaldı
              </span>
            </div>
            <div style={{ height: 8, background: '#fde68a', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`,
                background: daysLeft < 5 ? '#ef4444' : 'linear-gradient(90deg,#f59e0b,#f97316)',
                transition: 'width 0.3s',
              }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '0.6rem', margin: '0.6rem 0 0' }}>
              {user?.trialEndDate && `Deneme bitiş tarihi: ${new Date(user.trialEndDate).toLocaleDateString('tr-TR')}`}
            </p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={Users} label="Aktif Öğrenci" value={`${activeStudents} / ${studentLimit}`} color='#6366f1' bg='#eef2ff' />
          <StatCard icon={Crown} label="Plan" value={planCfg.label} color={planCfg.color} bg={planCfg.bg} />
          {plan === 'trialing' && daysLeft !== null && (
            <StatCard icon={Clock} label="Kalan Gün" value={`${daysLeft} gün`} color='#f97316' bg='#fff7ed' />
          )}
          {plan === 'pro' && (
            <StatCard icon={TrendingUp} label="Öğrenci Limiti" value={studentLimit} color='#10b981' bg='#ecfdf5' />
          )}
        </div>

        {/* Öğrenci Kullanımı */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #e5e7eb', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', margin: 0 }}>Öğrenci Kullanımı</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: usagePercent >= 90 ? '#ef4444' : '#6b7280' }}>
              {usagePercent}%
            </span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${usagePercent}%`,
              background: usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f97316' : 'linear-gradient(90deg, #6366f1, #7c3aed)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: 0 }}>
            {activeStudents} aktif öğrenci kullanılıyor, {Math.max(0, studentLimit - activeStudents)} slot boş
          </p>
          {usagePercent >= 90 && plan !== 'pro' && (
            <div style={{ marginTop: '0.75rem', background: '#fef2f2', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={15} color='#ef4444' />
              <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>Limite yaklaşıyorsunuz. Pro'ya geçerek limiti artırın.</span>
            </div>
          )}
        </div>

        {/* Özellik Listesi */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #e5e7eb', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', marginBottom: '1.25rem' }}>Plan Özellikleri</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {features.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 8, background: f.enabled ? '#f0fdf4' : '#f9fafb' }}>
                {f.enabled
                  ? <CheckCircle size={15} color='#10b981' />
                  : <XCircle size={15} color='#d1d5db' />
                }
                <span style={{ fontSize: '0.85rem', color: f.enabled ? '#111827' : '#9ca3af', fontWeight: f.enabled ? 600 : 400 }}>{f.label}</span>
                {!f.enabled && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 4 }}>PRO</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {plan !== 'pro' && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 20, padding: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Zap size={18} color='#fbbf24' fill='#fbbf24' />
                <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>Pro'ya Geçin</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0, maxWidth: 380 }}>
                Sınırsız öğrenci, AI raporları, detaylı finans ve WhatsApp entegrasyonu ile öğretmenliğinizi bir üst seviyeye taşıyın.
              </p>
            </div>
            <button onClick={() => setShowUpgradeModal(true)} style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              border: 'none', borderRadius: 12, padding: '0.85rem 1.75rem',
              color: 'white', fontWeight: 900, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(249,115,22,0.3)',
              whiteSpace: 'nowrap',
            }}>
              Hemen Başla <ArrowRight size={17} />
            </button>
          </div>
        )}

        {plan === 'pro' && paddleSubId && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #d1fae5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', marginBottom: '1rem' }}>Abonelik Bilgileri</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Paddle Abonelik ID', value: paddleSubId },
                { label: 'Paddle Müşteri ID', value: user?.paddleCustomerId || '—' },
                { label: 'Öğrenci Limiti', value: `${studentLimit} öğrenci` },
                { label: 'Plan Durumu', value: 'Aktif ✓' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700, wordBreak: 'break-all', maxWidth: '55%', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <a href={PADDLE_BILLING_URL} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem',
              padding: '0.7rem 1.2rem', borderRadius: 10, border: '1.5px solid #d1fae5',
              background: '#ecfdf5', color: '#065f46', fontWeight: 700, fontSize: '0.85rem',
              textDecoration: 'none',
            }}>
              <CreditCard size={15} /> Fatura ve Ödeme Yönetimi
            </a>
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <ProUpgradeModal
          reason='limit'
          onClose={() => setShowUpgradeModal(false)}
          onUpgraded={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}