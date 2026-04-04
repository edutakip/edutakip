import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  User, Mail, Phone, Lock, Bell, Crown, Users, CreditCard,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Save, ChevronRight,
  Zap, Clock, Calendar, TrendingUp, LogOut, Trash2, ExternalLink, Link2
} from 'lucide-react';
import ProUpgradeModal from '@/components/ProUpgradeModal';
import { isPro, getPlanLabel, getDaysLeft } from '@/lib/subscription';
import { showToast } from '@/lib/toast';
import GoogleCalendarConnect from '@/components/teacher/GoogleCalendarConnect';
import ZoomConnect from '@/components/teacher/ZoomConnect';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'subscription', label: 'Abonelik', icon: Crown },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'integrations', label: 'Entegrasyonlar', icon: Link2 },
];

const PLAN_STYLE = {
  free:     { gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)', icon: '🆓', label: 'Ücretsiz' },
  trialing: { gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', icon: '⏳', label: 'Pro (Deneme)' },
  pro:      { gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed)', icon: '👑', label: 'Pro' },
  expired:  { gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: '❌', label: 'Süresi Doldu' },
};

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 18, padding: '1.5rem',
      border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '1.25rem',
    }}>
      {(title || Icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
          {Icon && (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={17} color='#4f46e5' />
            </div>
          )}
          <div>
            {title && <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem', margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.1rem 0 0' }}>{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: '0.84rem', color: '#6b7280', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.84rem', color: highlight || '#111827', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────
function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone: form.phone });
      onUpdate({ ...user, phone: form.phone });
      showToast({ message: 'Profil güncellendi' });
    } catch (e) {
      showToast({ message: 'Hata oluştu', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard title="Kişisel Bilgiler" icon={User} subtitle="Temel hesap bilgileriniz">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Ad Soyad - readonly */}
          <div>
            <label style={labelStyle}>Ad Soyad</label>
            <div style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} color='#d1d5db' />
              <span>{user?.full_name || '—'}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#c4c9d4', marginTop: '0.3rem' }}>Ad soyad değiştirilemez.</p>
          </div>
          {/* Email - readonly */}
          <div>
            <label style={labelStyle}>E-posta</label>
            <div style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color='#d1d5db' />
              <span>{user?.email || '—'}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#c4c9d4', marginTop: '0.3rem' }}>E-posta adresi değiştirilemez.</p>
          </div>
          {/* Telefon */}
          <div>
            <label style={labelStyle}>Telefon (isteğe bağlı)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color='#9ca3af' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                placeholder="+90 5xx xxx xx xx"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={primaryBtn}>
            {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Şifre Değişikliği" icon={Lock} subtitle="Şifre sıfırlama e-postası alın">
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lock size={18} color='#6366f1' />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', margin: 0 }}>Şifre sıfırlama bağlantısı</p>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.15rem 0 0' }}>Butona tıkladığınızda çıkış yapılır ve e-postanıza şifre sıfırlama bağlantısı gönderilir.</p>
          </div>
          <button onClick={() => base44.auth.logout('/forgot-password')} style={{ padding: '0.5rem 0.85rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Şifremi Sıfırla
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Hesap" icon={LogOut} subtitle="Hesap işlemleri">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', margin: 0 }}>Oturumu Kapat</p>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.15rem 0 0' }}>Tüm cihazlardan güvenli çıkış yapın.</p>
          </div>
          <button onClick={() => base44.auth.logout()} style={{ padding: '0.55rem 1rem', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={14} /> Çıkış
          </button>
        </div>
      </SectionCard>
    </>
  );
}

// ── Subscription Tab ───────────────────────────────────────────
function SubscriptionTab({ user, students, onRefresh }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plan = user?.plan || 'free';
  const planStyle = PLAN_STYLE[plan] || PLAN_STYLE.free;
  const daysLeft = getDaysLeft(user);
  const studentLimit = user?.studentLimit ?? 3;
  const activeCount = students.length;
  const usagePct = Math.min(100, Math.round((activeCount / studentLimit) * 100));

  const nextBillingDate = user?.nextBillingDate
    ? new Date(user.nextBillingDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const subscriptionStartDate = user?.subscriptionStartDate
    ? new Date(user.subscriptionStartDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const trialEndDate = user?.trialEndDate
    ? new Date(user.trialEndDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const monthlyPrice = user?.studentLimit ? user.studentLimit * 50 : null;

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await base44.functions.invoke('cancelSubscription', {});
      if (res.data?.success) {
        showToast({ message: 'Abonelik iptal isteği alındı. Dönem sonunda sona erecek.' });
        setShowCancelConfirm(false);
        onRefresh();
      } else {
        showToast({ message: res.data?.error || 'İptal işlemi başarısız', type: 'error' });
      }
    } catch (e) {
      showToast({ message: 'Bir hata oluştu', type: 'error' });
    } finally {
      setCancelLoading(false);
    }
  };

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
    <>
      {/* Plan Banner */}
      <div style={{ background: planStyle.gradient, borderRadius: 18, padding: '1.5rem 1.75rem', marginBottom: '1.25rem', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{planStyle.icon}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>{planStyle.label}</span>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.85rem', margin: 0 }}>
              {plan === 'pro' && nextBillingDate && `Sonraki ödeme: ${nextBillingDate}`}
              {plan === 'trialing' && daysLeft !== null && `${daysLeft} gün deneme süresi kaldı`}
              {plan === 'free' && 'Temel özellikler aktif — Pro\'ya geçerek daha fazlasını keşfedin'}
              {plan === 'expired' && 'Aboneliğiniz sona erdi, yenileyin'}
            </p>
          </div>
          {plan !== 'pro' && (
            <button onClick={() => setShowUpgradeModal(true)} style={{ background: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', fontWeight: 800, cursor: 'pointer', color: '#4f46e5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Crown size={15} /> {plan === 'expired' ? 'Yenile' : "Pro'ya Geç"}
            </button>
          )}
        </div>
      </div>

      {/* Trial bar */}
      {plan === 'trialing' && daysLeft !== null && (
        <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem', border: '1.5px solid #fed7aa', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} /> Deneme Süresi
            </span>
            <span style={{ fontWeight: 800, color: daysLeft < 5 ? '#ef4444' : '#f97316', fontSize: '0.85rem' }}>{daysLeft} gün</span>
          </div>
          <div style={{ height: 8, background: '#fde68a', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`, background: daysLeft < 5 ? '#ef4444' : 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
          </div>
          {trialEndDate && <p style={{ fontSize: '0.78rem', color: '#78350f', marginTop: '0.5rem', marginBottom: 0 }}>Deneme bitiş: {trialEndDate}</p>}
        </div>
      )}

      {/* Abonelik Detayları - Pro ise */}
      {(plan === 'pro') && (
        <SectionCard title="Abonelik Detayları" icon={CreditCard} subtitle="Ödeme ve fatura bilgileri">
          <InfoRow label="Plan" value={`Pro — ${studentLimit} öğrenci`} />
          {monthlyPrice && <InfoRow label="Aylık ücret" value={`${monthlyPrice.toLocaleString('tr-TR')} ₺`} highlight='#4f46e5' />}
          {nextBillingDate && <InfoRow label="Sonraki ödeme tarihi" value={nextBillingDate} highlight='#059669' />}
          {subscriptionStartDate && <InfoRow label="Abonelik başlangıcı" value={subscriptionStartDate} />}
          {user?.paddleSubscriptionId && <InfoRow label="Abonelik ID" value={`...${user.paddleSubscriptionId.slice(-8)}`} />}
          <InfoRow label="Durum" value="✓ Aktif" highlight='#10b981' />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            <a
              href="https://paddle.com/billing"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid #d1fae5', background: '#ecfdf5', color: '#065f46', fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none' }}
            >
              <ExternalLink size={13} /> Fatura Geçmişi
            </a>
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Aboneliği İptal Et
            </button>
          </div>
        </SectionCard>
      )}

      {/* Kota */}
      <SectionCard title="Öğrenci Kotası" icon={Users} subtitle={`${activeCount} / ${studentLimit} öğrenci kullanılıyor`}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{activeCount} aktif</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: usagePct >= 90 ? '#ef4444' : '#374151' }}>{usagePct}%</span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, width: `${usagePct}%`, background: usagePct >= 90 ? '#ef4444' : usagePct >= 70 ? '#f97316' : 'linear-gradient(90deg,#6366f1,#7c3aed)', transition: 'width 0.4s' }} />
          </div>
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.4rem', marginBottom: 0 }}>
            {Math.max(0, studentLimit - activeCount)} öğrenci slotu boş
          </p>
        </div>
        {usagePct >= 90 && plan !== 'pro' && (
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={14} color='#ef4444' />
            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Limite yaklaşıyorsunuz. Pro'ya geçin.</span>
          </div>
        )}
      </SectionCard>

      {/* Plan Özellikleri */}
      <SectionCard title="Plan Özellikleri" icon={Zap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {features.map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.5rem 0.65rem', borderRadius: 8, background: f.enabled ? '#f0fdf4' : '#f9fafb' }}>
              {f.enabled ? <CheckCircle size={14} color='#10b981' /> : <XCircle size={14} color='#d1d5db' />}
              <span style={{ fontSize: '0.82rem', color: f.enabled ? '#111827' : '#9ca3af', fontWeight: f.enabled ? 600 : 400 }}>{f.label}</span>
              {!f.enabled && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: 4 }}>PRO</span>}
            </div>
          ))}
        </div>
      </SectionCard>

      {plan !== 'pro' && (
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 18, padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Zap size={16} color='#fbbf24' fill='#fbbf24' />
              <span style={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>Pro'ya Geçin</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', margin: 0 }}>Sınırsız öğrenci, AI asistan ve daha fazlası.</p>
          </div>
          <button onClick={() => setShowUpgradeModal(true)} style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', color: 'white', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
            Hemen Başla <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 400, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={24} color='#ef4444' />
            </div>
            <h3 style={{ textAlign: 'center', fontWeight: 800, color: '#111827', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Aboneliği İptal Et</h3>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Aboneliğiniz mevcut ödeme döneminin sonuna kadar aktif kalacak. İptal sonrasında ücretsiz plana geçileceksiniz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleCancel} disabled={cancelLoading} style={{ padding: '0.8rem', borderRadius: 12, border: 'none', background: '#ef4444', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {cancelLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                Evet, İptal Et
              </button>
              <button onClick={() => setShowCancelConfirm(false)} style={{ padding: '0.75rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && <ProUpgradeModal reason="limit" onClose={() => setShowUpgradeModal(false)} onUpgraded={() => { setShowUpgradeModal(false); onRefresh(); }} />}
    </>
  );
}

// ── Notifications Tab ──────────────────────────────────────────
function NotificationsTab({ user, onUpdate }) {
  const defaults = {
    notif_lesson_reminder: true,
    notif_payment_reminder: true,
    notif_homework_due: false,
    notif_weekly_summary: true,
    notif_whatsapp: false,
  };
  const [prefs, setPrefs] = useState({ ...defaults, ...user });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        notif_lesson_reminder: prefs.notif_lesson_reminder,
        notif_payment_reminder: prefs.notif_payment_reminder,
        notif_homework_due: prefs.notif_homework_due,
        notif_weekly_summary: prefs.notif_weekly_summary,
        notif_whatsapp: prefs.notif_whatsapp,
      };
      await base44.auth.updateMe(updates);
      onUpdate({ ...user, ...updates });
      showToast({ message: 'Bildirim tercihleri kaydedildi' });
    } catch (e) {
      showToast({ message: 'Hata oluştu', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const notifItems = [
    { key: 'notif_lesson_reminder', label: 'Ders Hatırlatıcısı', desc: 'Ders başlamadan önce bildirim al', icon: Calendar },
    { key: 'notif_payment_reminder', label: 'Ödeme Hatırlatıcısı', desc: 'Geciken veya bekleyen ödemeler için uyarı', icon: CreditCard },
    { key: 'notif_homework_due', label: 'Ödev Teslim Tarihi', desc: 'Yaklaşan ödev teslim tarihleri için bildirim', icon: TrendingUp },
    { key: 'notif_weekly_summary', label: 'Haftalık Özet', desc: 'Her Pazartesi haftalık ders ve ödeme özeti', icon: Calendar },
  ];

  return (
    <>
      <SectionCard title="Uygulama Bildirimleri" icon={Bell} subtitle="Hangi bildirimleri almak istediğinizi seçin">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {notifItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: i < notifItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: prefs[item.key] ? '#eef2ff' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={prefs[item.key] ? '#4f46e5' : '#d1d5db'} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  style={{
                    width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: prefs[item.key] ? '#4f46e5' : '#e5e7eb',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, left: prefs[item.key] ? 23 : 3,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>



      <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, width: '100%' }}>
        {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
        {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
      </button>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const labelStyle = {
  fontSize: '0.72rem', color: '#6b7280', fontWeight: 700,
  display: 'block', marginBottom: '0.4rem',
  textTransform: 'uppercase', letterSpacing: '0.4px',
};
const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10,
  border: '1.5px solid #e5e7eb', color: '#111827', fontSize: '0.875rem',
  outline: 'none', background: 'white', boxSizing: 'border-box',
};
const primaryBtn = {
  padding: '0.75rem 1.25rem', borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white',
  fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
};

// ── Main Page ──────────────────────────────────────────────────
export default function TeacherAccount() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

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

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={28} color='#6366f1' style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1.5rem' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>Hesap Yönetimi</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.3rem' }}>Profil, abonelik ve bildirim tercihlerinizi yönetin.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', borderRadius: 14, padding: '0.4rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '0.6rem 0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                fontWeight: isActive ? 800 : 600, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
              }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'profile' && <ProfileTab user={user} onUpdate={setUser} />}
        {activeTab === 'subscription' && <SubscriptionTab user={user} students={students} onRefresh={load} />}
        {activeTab === 'notifications' && <NotificationsTab user={user} onUpdate={setUser} />}
        {activeTab === 'integrations' && (
          <div>
            <GoogleCalendarConnect user={user} />
            <ZoomConnect />
          </div>
        )}
      </div>
    </div>
  );
}