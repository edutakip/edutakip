import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CreditCard, BarChart2, Shield, Search, CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getPlanLabel, getDaysLeft } from '@/lib/subscription';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const PLAN_STYLES = {
  free:     { bg: '#f3f4f6', color: '#6b7280', label: 'Ücretsiz' },
  trialing: { bg: '#fef9c3', color: '#92400e', label: 'Pro (Deneme)' },
  pro:      { bg: '#d1fae5', color: '#065f46', label: 'Pro' },
  expired:  { bg: '#fee2e2', color: '#b91c1c', label: 'Süresi Doldu' },
};

function PlanBadge({ plan }) {
  const s = PLAN_STYLES[plan] || PLAN_STYLES.free;
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 20, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function AdminPanel() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [expandedUser, setExpandedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      if (user?.role !== 'admin') { setLoading(false); return; }
      const [u, s] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Student.list(),
      ]);
      setUsers(u);
      setStudents(s);
      setLoading(false);
    })();
  }, []);

  const reload = async () => {
    const [u, s] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.Student.list(),
    ]);
    setUsers(u);
    setStudents(s);
  };

  const updateUserPlan = async (userId, updates) => {
    setUpdatingId(userId);
    await base44.entities.User.update(userId, updates);
    await reload();
    setUpdatingId(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        Yükleniyor...
      </div>
    </div>
  );

  if (me?.role !== 'admin') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Shield size={28} color='#b91c1c' />
        </div>
        <h2 style={{ color: '#111827', fontWeight: 800, marginBottom: '0.5rem' }}>Erişim Reddedildi</h2>
        <p style={{ color: '#9ca3af' }}>Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    </div>
  );

  const teachers = users.filter(u => u.role !== 'admin');
  const filteredTeachers = teachers.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // İstatistikler
  const stats = {
    total: teachers.length,
    free: teachers.filter(u => !u.plan || u.plan === 'free').length,
    trialing: teachers.filter(u => u.plan === 'trialing').length,
    pro: teachers.filter(u => u.plan === 'pro').length,
    expired: teachers.filter(u => u.plan === 'expired').length,
    totalStudents: students.filter(s => s.status === 'active').length,
    mrr: teachers.filter(u => u.plan === 'pro').reduce((acc, u) => acc + (u.trialStudentCount || 0) * 50, 0),
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color='white' />
          </div>
          <div>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', margin: 0 }}>EduTakip Admin</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>Gizli Yönetim Paneli</p>
          </div>
        </div>
        <button onClick={reload} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* İstatistik Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Toplam Öğretmen', value: stats.total, icon: Users, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Ücretsiz', value: stats.free, icon: Shield, color: '#6b7280', bg: '#f3f4f6' },
            { label: 'Denemede', value: stats.trialing, icon: Clock, color: '#d97706', bg: '#fef9c3' },
            { label: 'Pro', value: stats.pro, icon: CheckCircle, color: '#059669', bg: '#d1fae5' },
            { label: 'Süresi Dolmuş', value: stats.expired, icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
            { label: 'Aktif Öğrenci', value: stats.totalStudents, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Tahmini MRR', value: `${stats.mrr.toLocaleString('tr-TR')}₺`, icon: CreditCard, color: '#0369a1', bg: '#e0f2fe' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: 'white', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.35rem', borderRadius: 8, background: bg }}><Icon size={15} color={color} /></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { key: 'users', label: 'Kullanıcılar & Abonelikler', icon: Users },
            { key: 'stats', label: 'Genel İstatistik', icon: BarChart2 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: tab === t.key ? '#4f46e5' : 'white', color: tab === t.key ? 'white' : '#6b7280', boxShadow: tab === t.key ? '0 4px 12px rgba(79,70,229,0.3)' : 'none', transition: 'all 0.15s' }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <>
            {/* Arama */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={15} color='#9ca3af' style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Ad veya e-posta ara..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.4rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', fontSize: '0.875rem', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Kullanıcı Listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {filteredTeachers.map(user => {
                const userStudents = students.filter(s => s.teacherEmail === user.email && s.status === 'active');
                const daysLeft = getDaysLeft(user);
                const isExpanded = expandedUser === user.id;
                const isUpdating = updatingId === user.id;

                return (
                  <div key={user.id} style={{ background: 'white', borderRadius: 14, border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    {/* Ana satır */}
                    <div onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || 'İsimsiz'}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <PlanBadge plan={user.plan || 'free'} />
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{userStudents.length} öğrenci</span>
                        {user.plan === 'trialing' && daysLeft !== null && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: daysLeft < 7 ? '#dc2626' : '#d97706' }}>
                            {daysLeft > 0 ? `${daysLeft}g kaldı` : 'Süresi doldu'}
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={15} color='#9ca3af' /> : <ChevronDown size={15} color='#9ca3af' />}
                      </div>
                    </div>

                    {/* Genişletilmiş detay */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.25rem', background: '#fafafa' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Deneme Bitiş</p>
                            <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                              {user.trialEndDate ? format(parseISO(user.trialEndDate), 'd MMMM yyyy', { locale: tr }) : '—'}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Öğrenci Limiti</p>
                            <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>{user.studentLimit || 3}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Tahmini Aylık Gelir</p>
                            <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>{((user.trialStudentCount || 0) * 50).toLocaleString('tr-TR')}₺</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Stripe ID</p>
                            <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>{user.stripeCustomerId || '—'}</p>
                          </div>
                        </div>

                        {/* Admin Aksiyonlar */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button disabled={isUpdating} onClick={() => updateUserPlan(user.id, { plan: 'pro', aiReportsEnabled: true, detailedFinanceEnabled: true, whatsappEnabled: true })}
                            style={{ padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                            ✓ Pro Yap
                          </button>
                          <button disabled={isUpdating} onClick={() => updateUserPlan(user.id, { plan: 'free', studentLimit: 3, aiReportsEnabled: false, detailedFinanceEnabled: false })}
                            style={{ padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                            ↓ Ücretsiz'e Düşür
                          </button>
                          <button disabled={isUpdating} onClick={() => updateUserPlan(user.id, { plan: 'expired', aiReportsEnabled: false, detailedFinanceEnabled: false })}
                            style={{ padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                            ✕ Süresi Dolt
                          </button>
                          {isUpdating && <span style={{ fontSize: '0.8rem', color: '#9ca3af', alignSelf: 'center' }}>Güncelleniyor...</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTeachers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>Kullanıcı bulunamadı</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Plan Dağılımı */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Plan Dağılımı</h3>
              {[
                { label: 'Ücretsiz', value: stats.free, color: '#6b7280' },
                { label: 'Denemede', value: stats.trialing, color: '#d97706' },
                { label: 'Pro', value: stats.pro, color: '#059669' },
                { label: 'Süresi Dolmuş', value: stats.expired, color: '#dc2626' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{value}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stats.total ? (value / stats.total) * 100 : 0}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Gelir Özeti */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Gelir Özeti</h3>
              {[
                { label: 'Tahmini MRR (Pro)', value: `${stats.mrr.toLocaleString('tr-TR')}₺`, color: '#059669' },
                { label: 'Potansiyel (Trialing)', value: `${(stats.trialing * 10 * 50).toLocaleString('tr-TR')}₺`, color: '#d97706' },
                { label: 'Toplam Öğretmen', value: stats.total, color: '#6366f1' },
                { label: 'Toplam Aktif Öğrenci', value: stats.totalStudents, color: '#7c3aed' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}