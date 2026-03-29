import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Users, CreditCard, BarChart2, Shield, Search, CheckCircle,
  Clock, XCircle, RefreshCw, ChevronDown, ChevronUp, TrendingUp,
  Activity, Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Filter, Download, Bell, Settings, LogOut, Star, AlertCircle
} from 'lucide-react';
import { getPlanLabel, getDaysLeft } from '@/lib/subscription';
import { format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

// ── Design tokens ─────────────────────────────────────────────
const T = {
  violet:   '#5b21b6',
  indigo:   '#4f46e5',
  indigoBg: '#eef2ff',
  emerald:  '#059669',
  amber:    '#d97706',
  rose:     '#dc2626',
  slate50:  '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate900: '#0f172a',
};

// ── Plan config ───────────────────────────────────────────────
const PLAN = {
  free:     { label: 'Ücretsiz', dot: '#94a3b8', bg: '#f8fafc', text: '#475569', ring: '#e2e8f0' },
  trialing: { label: 'Deneme',   dot: '#f59e0b', bg: '#fffbeb', text: '#92400e', ring: '#fde68a' },
  pro:      { label: 'Pro',      dot: '#10b981', bg: '#ecfdf5', text: '#065f46', ring: '#6ee7b7' },
  expired:  { label: 'Süresi Doldu', dot: '#ef4444', bg: '#fef2f2', text: '#991b1b', ring: '#fca5a5' },
};

function PlanBadge({ plan }) {
  const p = PLAN[plan] || PLAN.free;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
      padding: '3px 9px', borderRadius: 20,
      background: p.bg, color: p.text,
      border: `1px solid ${p.ring}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
      {p.label}
    </span>
  );
}

// ── Sparkline (fake mini chart) ───────────────────────────────
function Sparkline({ values, color, height = 32 }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} 100,${height}`} fill={`url(#g${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, trend, trendUp, sublabel, color, sparkData, icon: Icon }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '18px 20px',
      border: `1px solid ${T.slate200}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.slate400, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: trendUp ? T.emerald : T.rose }}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.slate900, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sublabel && <div style={{ fontSize: 11, color: T.slate400, marginTop: 4, fontWeight: 500 }}>{sublabel}</div>}
      {sparkData && (
        <div style={{ marginTop: 12, opacity: 0.8 }}>
          <Sparkline values={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────
function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      width: '100%', padding: '8px 12px', borderRadius: 9,
      border: 'none', cursor: 'pointer', textAlign: 'left',
      background: active ? T.indigoBg : 'transparent',
      color: active ? T.indigo : T.slate500,
      fontWeight: active ? 700 : 500, fontSize: 13,
      transition: 'all 0.12s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.slate100; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Icon size={15} strokeWidth={active ? 2.5 : 2} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 10, fontWeight: 800, background: T.indigo, color: 'white', borderRadius: 10, padding: '1px 6px' }}>{badge}</span>
      )}
    </button>
  );
}

// ── Activity feed item ────────────────────────────────────────
function ActivityItem({ type, name, detail, time }) {
  const cfg = {
    signup:    { icon: Users,       color: T.indigo,   bg: T.indigoBg,  label: 'Yeni kayıt' },
    upgrade:   { icon: TrendingUp,  color: T.emerald,  bg: '#ecfdf5',   label: 'Pro\'ya geçti' },
    downgrade: { icon: ArrowDownRight, color: T.amber,  bg: '#fffbeb',   label: 'Düşürüldü' },
    expire:    { icon: XCircle,     color: T.rose,     bg: '#fef2f2',   label: 'Süresi doldu' },
    trial:     { icon: Zap,         color: '#7c3aed',  bg: '#f5f3ff',   label: 'Deneme başladı' },
  }[type] || { icon: Activity, color: T.slate400, bg: T.slate100, label: type };
  const Icon = cfg.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.slate100}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={13} color={cfg.color} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{name}</div>
        <div style={{ fontSize: 11, color: T.slate400, marginTop: 1 }}>{cfg.label} · {detail}</div>
      </div>
      <div style={{ fontSize: 11, color: T.slate400, flexShrink: 0, whiteSpace: 'nowrap' }}>{time}</div>
    </div>
  );
}

// ── Mini bar chart ─────────────────────────────────────────────
function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: '100%', background: i === data.length - 1 ? color : color + '40', borderRadius: '3px 3px 0 0', height: `${(d.value / max) * 44}px`, minHeight: 4, transition: 'height 0.6s ease' }} />
          <div style={{ fontSize: 8, color: T.slate400, fontWeight: 600, letterSpacing: 0.3 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminPanel() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState('overview');
  const [expandedUser, setExpandedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      if (user?.role !== 'admin') { setLoading(false); return; }
      const [u, s] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Student.list(),
      ]);
      setUsers(u); setStudents(s); setLoading(false);
    })();
  }, []);

  const reload = async () => {
    setLoading(true);
    const [u, s] = await Promise.all([base44.entities.User.list(), base44.entities.Student.list()]);
    setUsers(u); setStudents(s); setLoading(false);
  };

  const updateUserPlan = async (userId, updates) => {
    setUpdatingId(userId);
    await base44.entities.User.update(userId, updates);
    await reload();
    setUpdatingId(null);
  };

  // ── Guards ──
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.slate50, fontFamily: "'Geist','DM Sans',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${T.slate200}`, borderTopColor: T.indigo, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 13, color: T.slate400, fontWeight: 500 }}>Yükleniyor…</div>
      </div>
    </div>
  );

  if (me?.role !== 'admin') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.slate50, fontFamily: "'Geist','DM Sans',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Shield size={24} color={T.rose} strokeWidth={2} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.slate900, marginBottom: 8 }}>Erişim Reddedildi</h2>
        <p style={{ fontSize: 13, color: T.slate400, lineHeight: 1.6 }}>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
      </div>
    </div>
  );

  // ── Computed stats ──
  const teachers = users.filter(u => u.role !== 'admin');
  const stats = {
    total:        teachers.length,
    free:         teachers.filter(u => !u.plan || u.plan === 'free').length,
    trialing:     teachers.filter(u => u.plan === 'trialing').length,
    pro:          teachers.filter(u => u.plan === 'pro').length,
    expired:      teachers.filter(u => u.plan === 'expired').length,
    totalStudents:students.filter(s => s.status === 'active').length,
    mrr:          teachers.filter(u => u.plan === 'pro').reduce((a, u) => a + (u.trialStudentCount || 0) * 50, 0),
  };

  // ── Filtered/sorted teachers ──
  let filtered = teachers.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || (u.plan || 'free') === planFilter;
    return matchSearch && matchPlan;
  });
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  if (sortBy === 'students') filtered = [...filtered].sort((a, b) => {
    const aS = students.filter(s => s.teacherEmail === a.email && s.status === 'active').length;
    const bS = students.filter(s => s.teacherEmail === b.email && s.status === 'active').length;
    return bS - aS;
  });

  // ── Fake activity feed ──
  const activity = [
    { type: 'signup',    name: 'Elif Yılmaz',    detail: 'İstanbul',   time: '2 dk' },
    { type: 'upgrade',   name: 'Mehmet Kara',    detail: 'Pro plan',   time: '18 dk' },
    { type: 'trial',     name: 'Ayşe Demir',     detail: '14 gün deneme', time: '1 sa' },
    { type: 'downgrade', name: 'Ahmet Çelik',    detail: 'Ücretsiz',   time: '3 sa' },
    { type: 'expire',    name: 'Fatma Şahin',    detail: 'Trial sona erdi', time: '5 sa' },
    { type: 'signup',    name: 'Can Öztürk',     detail: 'Ankara',     time: '8 sa' },
    { type: 'upgrade',   name: 'Zeynep Arslan',  detail: 'Pro plan',   time: '1 gün' },
  ];

  // Fake weekly signup data
  const weeklyData = [
    { label: 'Pzt', value: 4 }, { label: 'Sal', value: 7 }, { label: 'Çar', value: 5 },
    { label: 'Per', value: 9 }, { label: 'Cum', value: 12 }, { label: 'Cmt', value: 6 },
    { label: 'Paz', value: 8 },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.slate50, fontFamily: "'Geist','DM Sans',system-ui,sans-serif", overflow: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.slate200}; border-radius: 10px; }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .row-hover:hover { background: ${T.slate50} !important; }
        .action-btn:hover { filter: brightness(0.94); }
      `}</style>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <div style={{
        width: 220, background: 'white', borderRight: `1px solid ${T.slate200}`,
        display: 'flex', flexDirection: 'column', padding: '0', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${T.slate100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${T.indigo},${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${T.indigo}40` }}>
              <Shield size={15} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.slate900, letterSpacing: -0.3 }}>EduTakip</div>
              <div style={{ fontSize: 10, color: T.slate400, fontWeight: 600, letterSpacing: 0.3 }}>ADMIN</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: 'uppercase', padding: '4px 12px 6px' }}>Platform</div>
          <NavItem icon={BarChart2} label="Genel Bakış" active={activeNav === 'overview'} onClick={() => setActiveNav('overview')} />
          <NavItem icon={TrendingUp} label="Büyüme" active={activeNav === 'growth'} onClick={() => setActiveNav('growth')} />
          <NavItem icon={Activity} label="Aktivite" active={activeNav === 'activity'} badge={activity.length} onClick={() => setActiveNav('activity')} />

          <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: 'uppercase', padding: '12px 12px 6px' }}>Yönetim</div>
          <NavItem icon={Users} label="Öğretmenler" active={activeNav === 'teachers'} badge={teachers.length} onClick={() => setActiveNav('teachers')} />
          <NavItem icon={CreditCard} label="Abonelikler" active={activeNav === 'subscriptions'} onClick={() => setActiveNav('subscriptions')} />
          <NavItem icon={Star} label="Pro Kullanıcılar" active={activeNav === 'pro'} onClick={() => setActiveNav('pro')} />

          <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: 'uppercase', padding: '12px 12px 6px' }}>Sistem</div>
          <NavItem icon={Settings} label="Ayarlar" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
        </div>

        {/* User bottom */}
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${T.slate100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${T.indigo},${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 800 }}>{(me?.full_name || 'A')[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.slate700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.full_name || 'Admin'}</div>
              <div style={{ fontSize: 10, color: T.slate400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.email}</div>
            </div>
            <LogOut size={13} color={T.slate400} style={{ cursor: 'pointer', flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* ══ MAIN ════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: `1px solid ${T.slate200}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: T.slate900, margin: 0, letterSpacing: -0.2 }}>
              {{
                overview: 'Genel Bakış',
                teachers: 'Öğretmenler',
                subscriptions: 'Abonelik Yönetimi',
                activity: 'Aktivite Akışı',
                growth: 'Büyüme Analizi',
                pro: 'Pro Kullanıcılar',
                settings: 'Ayarlar',
              }[activeNav] || 'Genel Bakış'}
            </h1>
            <p style={{ fontSize: 11, color: T.slate400, margin: 0, fontWeight: 500 }}>
              {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={reload} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.slate200}`, background: 'white', color: T.slate500, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={12} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} /> Yenile
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.slate200}`, background: 'white', color: T.slate500, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={12} /> Dışa Aktar
            </button>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.slate100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={14} color={T.slate500} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', animation: 'fadeIn 0.2s ease' }}>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {activeNav === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                <StatCard label="Toplam Öğretmen" value={stats.total} trend={12} trendUp icon={Users} color={T.indigo} sparkData={[2,5,4,8,6,11,9,stats.total]} sublabel={`+3 bu hafta`} />
                <StatCard label="Aylık Gelir (MRR)" value={`₺${stats.mrr.toLocaleString('tr-TR')}`} trend={8} trendUp icon={CreditCard} color={T.emerald} sparkData={[3,5,4,7,8,9,12,stats.mrr/1000].map(x=>x*100)} sublabel={`${stats.pro} pro kullanıcı`} />
                <StatCard label="Pro Kullanıcı" value={stats.pro} trend={5} trendUp icon={Star} color="#7c3aed" sparkData={[1,2,2,3,4,5,4,stats.pro]} sublabel={`%${stats.total ? Math.round(stats.pro/stats.total*100) : 0} dönüşüm`} />
                <StatCard label="Süresi Dolmuş" value={stats.expired} trend={2} trendUp={false} icon={AlertCircle} color={T.rose} sparkData={[0,1,0,1,2,1,2,stats.expired]} sublabel="Yenileme bekleniyor" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                <StatCard label="Deneme Dönemi" value={stats.trialing} icon={Clock} color={T.amber} sublabel={`${stats.trialing * 14} gün kaldı (ort.)`} />
                <StatCard label="Ücretsiz Plan" value={stats.free} icon={Shield} color={T.slate400} sublabel="Upgrade potansiyeli" />
                <StatCard label="Aktif Öğrenci" value={stats.totalStudents} trend={18} trendUp icon={Users} color="#0891b2" sublabel="Tüm platformda" />
                <StatCard label="Ort. Öğrenci/Öğr." value={stats.total ? (stats.totalStudents / stats.total).toFixed(1) : '0'} icon={BarChart2} color="#0d9488" sublabel="Platform ortalaması" />
              </div>

              {/* Two column lower */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Plan dağılımı */}
                <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.slate900 }}>Plan Dağılımı</div>
                    <div style={{ fontSize: 11, color: T.slate400 }}>Toplam: {stats.total}</div>
                  </div>
                  {[
                    { label: 'Pro', value: stats.pro, color: T.emerald },
                    { label: 'Deneme', value: stats.trialing, color: T.amber },
                    { label: 'Ücretsiz', value: stats.free, color: T.slate400 },
                    { label: 'Süresi Doldu', value: stats.expired, color: T.rose },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.slate700 }}>{label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.slate500 }}>{value} <span style={{ color: T.slate300 }}>/ {stats.total}</span></span>
                      </div>
                      <div style={{ height: 6, background: T.slate100, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.total ? (value / stats.total) * 100 : 0}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Haftalık kayıt */}
                <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.slate900 }}>Bu Hafta Kayıtlar</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.emerald, fontWeight: 700 }}>
                      <ArrowUpRight size={12} /> 23%
                    </div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: T.slate900, marginBottom: 4, letterSpacing: -0.5 }}>51</div>
                  <div style={{ fontSize: 11, color: T.slate400, marginBottom: 14, fontWeight: 500 }}>Yeni öğretmen kaydı</div>
                  <MiniBarChart data={weeklyData} color={T.indigo} />
                </div>
              </div>

              {/* Recent teachers + activity side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                {/* Recent */}
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.slate100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.slate900 }}>Son Öğretmenler</div>
                    <button onClick={() => setActiveNav('teachers')} style={{ fontSize: 11, color: T.indigo, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 5 }}>Tümü →</button>
                  </div>
                  <div>
                    {teachers.slice(0, 5).map((u, i) => {
                      const uSt = students.filter(s => s.teacherEmail === u.email && s.status === 'active').length;
                      return (
                        <div key={u.id} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < 4 ? `1px solid ${T.slate100}` : 'none', transition: 'background 0.1s' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${T.indigo},${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontSize: 12, fontWeight: 800 }}>{(u.full_name || u.email || '?')[0].toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.slate700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || 'İsimsiz'}</div>
                            <div style={{ fontSize: 11, color: T.slate400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: T.slate400 }}>{uSt} öğr.</span>
                            <PlanBadge plan={u.plan || 'free'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity feed */}
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.slate100}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.slate900 }}>Aktivite</div>
                  </div>
                  <div style={{ padding: '0 20px', maxHeight: 280, overflowY: 'auto' }}>
                    {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TEACHERS ─────────────────────────────────────── */}
          {(activeNav === 'teachers' || activeNav === 'subscriptions' || activeNav === 'pro') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                  <Search size={13} color={T.slate400} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input placeholder="Ad veya e-posta ara…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1.5px solid ${T.slate200}`, background: 'white', fontSize: 12, color: T.slate700, outline: 'none' }} />
                </div>

                {/* Plan filter */}
                <div style={{ display: 'flex', gap: 4, background: 'white', border: `1.5px solid ${T.slate200}`, borderRadius: 9, padding: 3 }}>
                  {[['all','Tümü'],['free','Ücretsiz'],['trialing','Deneme'],['pro','Pro'],['expired','Dolmuş']].map(([k, l]) => (
                    <button key={k} onClick={() => setPlanFilter(k)} style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      background: planFilter === k ? T.indigo : 'transparent',
                      color: planFilter === k ? 'white' : T.slate500,
                      transition: 'all 0.12s',
                    }}>{l}</button>
                  ))}
                </div>

                {/* Sort */}
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '7px 10px', borderRadius: 9, border: `1.5px solid ${T.slate200}`, background: 'white', fontSize: 12, color: T.slate500, outline: 'none', fontWeight: 600 }}>
                  <option value="name">Ada göre</option>
                  <option value="students">Öğrenciye göre</option>
                </select>

                <div style={{ fontSize: 12, color: T.slate400, fontWeight: 500, marginLeft: 'auto' }}>{filtered.length} sonuç</div>
              </div>

              {/* Table */}
              <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px 100px 40px', gap: 0, padding: '10px 20px', background: T.slate50, borderBottom: `1px solid ${T.slate200}` }}>
                  {['ÖĞRETMEN','E-POSTA','PLAN','ÖĞR.','DURUM',''].map((h, i) => (
                    <div key={i} style={{ fontSize: 10, fontWeight: 800, color: T.slate400, letterSpacing: 0.7, textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>

                {filtered.map((user, idx) => {
                  const userStudents = students.filter(s => s.teacherEmail === user.email && s.status === 'active');
                  const daysLeft = getDaysLeft(user);
                  const isExpanded = expandedUser === user.id;
                  const isUpdating = updatingId === user.id;

                  return (
                    <div key={user.id} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${T.slate100}` : 'none', animation: 'fadeIn 0.15s ease' }}>
                      {/* Main row */}
                      <div className="row-hover" onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px 100px 40px', gap: 0, padding: '12px 20px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}>

                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${T.indigo},${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontSize: 12, fontWeight: 800 }}>{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.slate900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || 'İsimsiz'}</div>
                            {user.plan === 'trialing' && daysLeft !== null && (
                              <div style={{ fontSize: 10, color: daysLeft < 7 ? T.rose : T.amber, fontWeight: 700 }}>{daysLeft > 0 ? `${daysLeft}g kaldı` : 'Süresi doldu'}</div>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div style={{ fontSize: 12, color: T.slate400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{user.email}</div>

                        {/* Plan */}
                        <div><PlanBadge plan={user.plan || 'free'} /></div>

                        {/* Students */}
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.slate700 }}>{userStudents.length}</div>

                        {/* Status */}
                        <div>
                          {user.plan === 'pro' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.emerald, fontWeight: 700 }}>
                              <CheckCircle size={11} strokeWidth={2.5} /> Aktif
                            </div>
                          )}
                          {user.plan === 'trialing' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.amber, fontWeight: 700 }}>
                              <Clock size={11} strokeWidth={2.5} /> Deneme
                            </div>
                          )}
                          {(!user.plan || user.plan === 'free') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.slate400, fontWeight: 600 }}>
                              <Shield size={11} strokeWidth={2} /> Ücretsiz
                            </div>
                          )}
                          {user.plan === 'expired' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.rose, fontWeight: 700 }}>
                              <XCircle size={11} strokeWidth={2.5} /> Süresi Doldu
                            </div>
                          )}
                        </div>

                        {/* Expand */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          {isExpanded ? <ChevronUp size={14} color={T.slate400} /> : <ChevronDown size={14} color={T.slate400} />}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ background: T.slate50, borderTop: `1px solid ${T.slate100}`, padding: '14px 20px 14px 62px', animation: 'fadeIn 0.15s ease' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 14 }}>
                            {[
                              { l: 'Deneme Bitiş', v: user.trialEndDate ? format(parseISO(user.trialEndDate), 'd MMM yyyy', { locale: tr }) : '—' },
                              { l: 'Öğrenci Limiti', v: user.studentLimit || 3 },
                              { l: 'Tahmini MRR', v: `₺${((user.trialStudentCount || 0) * 50).toLocaleString('tr-TR')}` },
                              { l: 'Stripe ID', v: user.stripeCustomerId || '—' },
                            ].map(({ l, v }) => (
                              <div key={l}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: T.slate700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button disabled={isUpdating} className="action-btn" onClick={() => updateUserPlan(user.id, { plan: 'pro', aiReportsEnabled: true, detailedFinanceEnabled: true, whatsappEnabled: true })}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'filter 0.12s' }}>
                              <CheckCircle size={11} /> Pro Yap
                            </button>
                            <button disabled={isUpdating} className="action-btn" onClick={() => updateUserPlan(user.id, { plan: 'trialing' })}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#fef9c3', color: '#713f12', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'filter 0.12s' }}>
                              <Clock size={11} /> Deneme Ver
                            </button>
                            <button disabled={isUpdating} className="action-btn" onClick={() => updateUserPlan(user.id, { plan: 'free', studentLimit: 3, aiReportsEnabled: false, detailedFinanceEnabled: false })}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: T.slate100, color: T.slate600, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'filter 0.12s' }}>
                              <ArrowDownRight size={11} /> Ücretsiz'e Düşür
                            </button>
                            <button disabled={isUpdating} className="action-btn" onClick={() => updateUserPlan(user.id, { plan: 'expired', aiReportsEnabled: false, detailedFinanceEnabled: false })}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'filter 0.12s' }}>
                              <XCircle size={11} /> Süresi Doldur
                            </button>
                            {isUpdating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.slate400 }}>
                                <RefreshCw size={10} style={{ animation: 'spin 0.7s linear infinite' }} /> Güncelleniyor…
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.slate100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Search size={18} color={T.slate300} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.slate500, marginBottom: 4 }}>Sonuç bulunamadı</div>
                    <div style={{ fontSize: 12, color: T.slate400 }}>Farklı bir arama veya filtre deneyin.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACTIVITY ─────────────────────────────────────── */}
          {activeNav === 'activity' && (
            <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', maxWidth: 720 }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.slate100}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.slate900 }}>Aktivite Akışı</div>
                <div style={{ fontSize: 11, color: T.slate400, marginTop: 2 }}>Platforma ait son hareketler</div>
              </div>
              <div style={{ padding: '0 20px' }}>
                {[...activity, ...activity].map((a, i) => <ActivityItem key={i} {...a} />)}
              </div>
            </div>
          )}

          {/* ── GROWTH ─────────────────────────────────────── */}
          {activeNav === 'growth' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.slate900, marginBottom: 4 }}>Haftalık Kayıtlar</div>
                <div style={{ fontSize: 11, color: T.slate400, marginBottom: 16 }}>Son 7 günlük öğretmen kayıtları</div>
                <MiniBarChart data={weeklyData} color={T.indigo} />
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.slate200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.slate900, marginBottom: 4 }}>Plan Dönüşümleri</div>
                <div style={{ fontSize: 11, color: T.slate400, marginBottom: 16 }}>Ücretsiz → Pro dönüşüm oranı</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.emerald, letterSpacing: -1 }}>
                  %{stats.total ? Math.round(stats.pro / stats.total * 100) : 0}
                </div>
                <div style={{ fontSize: 12, color: T.slate400, marginTop: 4 }}>{stats.pro} pro / {stats.total} toplam öğretmen</div>
              </div>
            </div>
          )}

          {/* ── SETTINGS placeholder ─────────────────────── */}
          {activeNav === 'settings' && (
            <div style={{ background: 'white', borderRadius: 14, padding: '32px', border: `1px solid ${T.slate200}`, maxWidth: 500, textAlign: 'center' }}>
              <Settings size={32} color={T.slate300} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: T.slate500 }}>Sistem Ayarları</div>
              <div style={{ fontSize: 12, color: T.slate400, marginTop: 6 }}>Bu bölüm yakında aktif olacak.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}