import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { ArrowLeft, TrendingUp, Users, BookOpen, AlertTriangle, CheckCircle, Zap, Trophy, Target, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentDetailPanel from '@/components/analytics/StudentDetailPanel';
import ReportDownloadModal from '@/components/analytics/ReportDownloadModal';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const avatarColors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, gradient }) {
  return (
    <div style={{ background: gradient || 'white', borderRadius: 18, padding: '1.25rem 1.5rem', border: gradient ? 'none' : '1.5px solid #f1f5f9', boxShadow: gradient ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: gradient ? 'rgba(255,255,255,0.2)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={gradient ? 'white' : iconColor} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: gradient ? 'rgba(255,255,255,0.8)' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: gradient ? 'white' : '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <p style={{ fontSize: '0.78rem', color: gradient ? 'rgba(255,255,255,0.65)' : '#9ca3af', marginTop: '0.35rem', fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{children}</h2>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.9rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      {label && <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.82rem', color: p.color || '#6366f1', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('%') ? p.value.toFixed(1) + '%' : p.value}
        </p>
      ))}
    </div>
  );
};

export default function HomeworkAnalytics() {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // all | month | week
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const [hws, stds] = await Promise.all([
        base44.entities.Homework.filter({ teacherEmail: me.email }, '-created_date', 500),
        base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
      ]);
      setHomeworks(hws);
      setStudents(stds);
      setLoading(false);
    })();
  }, []);

  // ── Filter by period ──────────────────────────────────────
  const filteredHws = homeworks.filter(hw => {
    if (period === 'all') return true;
    const d = new Date(hw.created_date);
    const now = new Date();
    if (period === 'month') {
      const cutoff = new Date(now); cutoff.setDate(now.getDate() - 30);
      return d >= cutoff;
    }
    if (period === 'week') {
      const cutoff = new Date(now); cutoff.setDate(now.getDate() - 7);
      return d >= cutoff;
    }
    return true;
  });

  // ── Overall stats ─────────────────────────────────────────
  const total = filteredHws.length;
  const completed = filteredHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi').length;
  const late = filteredHws.filter(h => h.status === 'gecikmiş').length;
  const pending = filteredHws.filter(h => h.status === 'verildi' || h.status === 'goruldu').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Avg game score (for homeworks with gameResult) ────────
  const withScore = filteredHws.filter(h => h.gameResult?.percentage != null);
  const avgScore = withScore.length > 0
    ? Math.round(withScore.reduce((s, h) => s + h.gameResult.percentage, 0) / withScore.length)
    : null;

  // ── Status breakdown pie ──────────────────────────────────
  const statusData = [
    { name: 'Tamamlandı', value: completed, color: '#10b981' },
    { name: 'Bekliyor', value: pending, color: '#6366f1' },
    { name: 'Gecikmiş', value: late, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── Per-student stats ─────────────────────────────────────
  const studentStats = students.map(s => {
    const sHws = filteredHws.filter(h => h.studentId === s.id);
    const sCompleted = sHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi').length;
    const sLate = sHws.filter(h => h.status === 'gecikmiş').length;
    const sPending = sHws.filter(h => h.status === 'verildi' || h.status === 'goruldu').length;
    const sTotal = sHws.length;
    const sRate = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
    const sWithScore = sHws.filter(h => h.gameResult?.percentage != null);
    const sAvgScore = sWithScore.length > 0
      ? Math.round(sWithScore.reduce((acc, h) => acc + h.gameResult.percentage, 0) / sWithScore.length)
      : null;
    return { ...s, total: sTotal, completed: sCompleted, late: sLate, pending: sPending, rate: sRate, avgScore: sAvgScore };
  }).filter(s => s.total > 0).sort((a, b) => b.total - a.total);

  // ── Bar chart: completion per student ─────────────────────
  const barData = studentStats.map(s => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    Tamamlandı: s.completed,
    Gecikmiş: s.late,
    Bekliyor: s.pending,
  }));

  // ── Game score per student ────────────────────────────────
  const scoreBarData = studentStats
    .filter(s => s.avgScore != null)
    .map(s => ({ name: s.name.split(' ')[0], fullName: s.name, 'Ort. Puan (%)': s.avgScore }))
    .sort((a, b) => b['Ort. Puan (%)'] - a['Ort. Puan (%)']);

  // ── Weekly trend (last 8 weeks) ───────────────────────────
  const weeklyTrend = (() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i * 7 - 6);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const label = `H${8 - i}`;
      const weekHws = homeworks.filter(h => {
        const d = new Date(h.created_date);
        return d >= start && d <= end;
      });
      const wCompleted = weekHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi').length;
      weeks.push({ label, Ödev: weekHws.length, Tamamlanan: wCompleted });
    }
    return weeks;
  })();

  // ── Struggling students (rate < 50% and >= 2 hw) ─────────
  const struggling = studentStats.filter(s => s.total >= 2 && s.rate < 50);
  // ── Star students (rate >= 80%) ───────────────────────────
  const stars = studentStats.filter(s => s.total >= 2 && s.rate >= 80);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Geri
            </button>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(99,102,241,0.35)' }}>
              <TrendingUp size={22} color='white' />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111827', margin: 0 }}>Ödev Analizi & İstatistikler</h1>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Öğrenci performansı ve başarı oranları</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Period selector */}
            <div style={{ display: 'flex', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.3rem', gap: '0.25rem' }}>
              {[{ key: 'week', label: 'Bu Hafta' }, { key: 'month', label: 'Bu Ay' }, { key: 'all', label: 'Tümü' }].map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none', background: period === p.key ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : 'transparent', color: period === p.key ? 'white' : '#6b7280', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Report download */}
            <button onClick={() => setShowReportModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <FileDown size={15} /> Rapor İndir
            </button>
          </div>
        </div>

        {/* ── Top Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={BookOpen} label='Toplam Ödev' value={total} sub={`${period === 'week' ? 'Bu hafta' : period === 'month' ? 'Bu ay' : 'Tüm zamanlar'}`} iconColor='#6366f1' iconBg='#eef2ff' />
          <StatCard icon={Target} label='Tamamlanma Oranı' value={`${completionRate}%`} sub={`${completed} / ${total} tamamlandı`} gradient={completionRate >= 70 ? 'linear-gradient(135deg,#10b981,#059669)' : completionRate >= 40 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ef4444,#dc2626)'} />
          <StatCard icon={AlertTriangle} label='Geciken Ödev' value={late} sub={total > 0 ? `%${Math.round(late / total * 100)} oran` : '—'} iconColor='#ef4444' iconBg='#fef2f2' />
          {avgScore != null
            ? <StatCard icon={Zap} label='Ort. Quiz Puanı' value={`${avgScore}%`} sub={`${withScore.length} tamamlanan quiz`} gradient='linear-gradient(135deg,#6366f1,#7c3aed)' />
            : <StatCard icon={Users} label='Aktif Öğrenci' value={studentStats.length} sub='ödev atanan' iconColor='#8b5cf6' iconBg='#f5f3ff' />
          }
        </div>

        {/* ── Alerts: struggling & stars ── */}
        {(struggling.length > 0 || stars.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {struggling.length > 0 && (
              <div style={{ background: '#fef2f2', borderRadius: 18, padding: '1.25rem', border: '1.5px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <AlertTriangle size={16} color='#ef4444' />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#dc2626' }}>Zorlanıyor ({struggling.length} öğrenci)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {struggling.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'white', borderRadius: 10, padding: '0.6rem 0.85rem', border: '1px solid #fecaca' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white' }}>{getInitials(s.name)}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{s.total} ödev • {s.late} gecikmiş</p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ef4444' }}>{s.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stars.length > 0 && (
              <div style={{ background: '#f0fdf4', borderRadius: 18, padding: '1.25rem', border: '1.5px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Trophy size={16} color='#10b981' />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#059669' }}>Başarılı Öğrenciler ({stars.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stars.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'white', borderRadius: 10, padding: '0.6rem 0.85rem', border: '1px solid #bbf7d0' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white' }}>{getInitials(s.name)}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{s.completed}/{s.total} tamamlandı</p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>{s.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Charts Row 1 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Ödev durumu dağılımı (Pie) */}
          <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle>🥧 Ödev Durumu Dağılımı</SectionTitle>
            {statusData.length > 0 ? (
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie data={statusData} cx='50%' cy='50%' innerRadius={55} outerRadius={85} paddingAngle={4} dataKey='value'>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>}
          </div>

          {/* Haftalık trend */}
          <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle>📈 Haftalık Trend (8 Hafta)</SectionTitle>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                <XAxis dataKey='label' tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type='monotone' dataKey='Ödev' stroke='#6366f1' strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} />
                <Line type='monotone' dataKey='Tamamlanan' stroke='#10b981' strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
                <Legend formatter={(v) => <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{v}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Öğrenci bazlı ödev durumu (Stacked Bar) ── */}
        {barData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
            <SectionTitle>📊 Öğrenci Başına Ödev Durumu</SectionTitle>
            <ResponsiveContainer width='100%' height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f8fafc' />
                <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{v}</span>} />
                <Bar dataKey='Tamamlandı' stackId='a' fill='#10b981' radius={[0, 0, 0, 0]} />
                <Bar dataKey='Bekliyor' stackId='a' fill='#6366f1' />
                <Bar dataKey='Gecikmiş' stackId='a' fill='#ef4444' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Quiz / Oyun Puan Analizi ── */}
        {scoreBarData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
            <SectionTitle>🎮 Öğrenci Quiz Başarı Oranları (Ortalama %)</SectionTitle>
            <ResponsiveContainer width='100%' height={240}>
              <BarChart data={scoreBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f8fafc' />
                <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit='%' />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='Ort. Puan (%)' radius={[6, 6, 0, 0]}>
                  {scoreBarData.map((entry, i) => (
                    <Cell key={i} fill={entry['Ort. Puan (%)'] >= 80 ? '#10b981' : entry['Ort. Puan (%)'] >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {[{ color: '#10b981', label: '≥80% Başarılı' }, { color: '#f59e0b', label: '50-79% Orta' }, { color: '#ef4444', label: '<50% Zayıf' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Detaylı Öğrenci Tablosu ── */}
        {studentStats.length > 0 && (
          <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle>📋 Öğrenci Detay Tablosu</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Öğrenci', 'Toplam', 'Tamamlandı', 'Gecikmiş', 'Bekliyor', 'Tamamlanma Oranı', 'Quiz Ortalaması'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.65rem 0.85rem', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((s, i) => (
                    <tr key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'white' }}>{getInitials(s.name)}</span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4f46e5', whiteSpace: 'nowrap', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, fontSize: '0.88rem', color: '#374151', textAlign: 'center' }}>{s.total}</td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>{s.completed}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.late > 0 ? '#ef4444' : '#9ca3af' }}>{s.late}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6366f1' }}>{s.pending}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ flex: 1, height: 7, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${s.rate}%`, background: s.rate >= 80 ? '#10b981' : s.rate >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 999, transition: 'width 0.4s' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.rate >= 80 ? '#10b981' : s.rate >= 50 ? '#d97706' : '#ef4444', minWidth: 32 }}>{s.rate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        {s.avgScore != null
                          ? <span style={{ fontWeight: 800, fontSize: '0.88rem', color: s.avgScore >= 80 ? '#10b981' : s.avgScore >= 50 ? '#f59e0b' : '#ef4444' }}>{s.avgScore}%</span>
                          : <span style={{ color: '#d1d5db', fontSize: '0.82rem' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {studentStats.length === 0 && (
          <div style={{ background: 'white', borderRadius: 18, padding: '4rem 2rem', textAlign: 'center', border: '1.5px solid #f1f5f9' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#374151', marginBottom: '0.4rem' }}>Henüz veri yok</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Öğrencilere ödev atadıkça burada istatistikler görünecek.</p>
          </div>
        )}

      </div>
    </div>

    {selectedStudent && (
      <StudentDetailPanel
        student={selectedStudent}
        homeworks={filteredHws}
        onClose={() => setSelectedStudent(null)}
      />
    )}

    {showReportModal && (
      <ReportDownloadModal
        students={studentStats}
        homeworks={homeworks}
        onClose={() => setShowReportModal(false)}
      />
    )}
  );
}