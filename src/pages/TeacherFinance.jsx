import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, DollarSign, Clock, TrendingUp, AlertCircle, Plus, RefreshCw, ChevronDown, X } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import PaymentModal from '../components/teacher/PaymentModal';
import { dataCache } from '@/lib/dataCache';

const COLORS = ['#f97316', '#6366f1', '#10b981', '#8b5cf6', '#3b82f6'];

// ── Detail Modal ──────────────────────────────────────────────
function DetailModal({ type, students, payments, lessons, onClose }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  requestAnimationFrame(() => setVisible(true));
  return () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };
  const now = new Date();

  const content = () => {
    if (type === 'students') {
      return (
        <>
          <h2 style={mTitle}>Aktif Öğrenciler</h2>
          <p style={mSub}>{students.length} öğrenci kayıtlı</p>
          <div style={mList}>
            {students.map((s, i) => (
              <div key={s.id} style={mRow(i)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS[i % COLORS.length] + '22', border: `2px solid ${COLORS[i % COLORS.length]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS[i % COLORS.length], fontWeight: 800, fontSize: '0.85rem' }}>
                    {s.name[0]}
                  </div>
                  <div>
                    <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{s.subject || '—'} · {s.grade || '—'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#111827', fontWeight: 800, fontSize: '0.9rem' }}>₺{(s.monthlyFee || 0).toLocaleString('tr-TR')}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>aylık</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (type === 'income') {
      const received = payments.filter(p => p.status === 'alındı').sort((a, b) => new Date(b.date) - new Date(a.date));
      const total = received.reduce((s, p) => s + (p.amount || 0), 0);
      return (
        <>
          <h2 style={mTitle}>Toplam Gelir Detayı</h2>
          <p style={mSub}>Toplam tahsil edilen: <strong>₺{total.toLocaleString('tr-TR')}</strong></p>
          <div style={mList}>
            {received.length === 0 && <p style={mEmpty}>Henüz ödeme alınmamış</p>}
            {received.map((p, i) => (
              <div key={p.id} style={mRow(i)}>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{p.studentName}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.date} · {p.method}</div>
                </div>
                <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem' }}>+₺{(p.amount || 0).toLocaleString('tr-TR')}</div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (type === 'hours') {
      const completedLessons = lessons.filter(l => l.status === 'tamamlandı');
      const totalMins = completedLessons.reduce((s, l) => s + (l.duration || 60), 0);
      const byStudent = students.map(s => ({
        name: s.name,
        lessons: completedLessons.filter(l => l.studentId === s.id).length,
        hours: Math.round(completedLessons.filter(l => l.studentId === s.id).reduce((sum, l) => sum + (l.duration || 60), 0) / 60 * 10) / 10,
        weekly: (s.weeklyLessons || 1),
      })).filter(x => x.lessons > 0).sort((a, b) => b.hours - a.hours);

      return (
        <>
          <h2 style={mTitle}>Ders Saatleri Detayı</h2>
          <p style={mSub}>Toplam tamamlanan: <strong>{Math.round(totalMins / 60 * 10) / 10} saat</strong> ({completedLessons.length} ders)</p>
          <div style={mList}>
            {byStudent.length === 0 && <p style={mEmpty}>Henüz tamamlanan ders yok</p>}
            {byStudent.map((s, i) => (
              <div key={i} style={mRow(i)}>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{s.lessons} ders · Haftalık plan: {s.weekly} ders</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.9rem' }}>{s.hours} saat</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (type === 'mrr') {
      const sorted = [...students].sort((a, b) => (b.monthlyFee || 0) - (a.monthlyFee || 0));
      const total = sorted.reduce((s, st) => s + (st.monthlyFee || 0), 0);
      return (
        <>
          <h2 style={mTitle}>Düzenli Gelir (MRR) Detayı</h2>
          <p style={mSub}>Aylık toplam: <strong>₺{total.toLocaleString('tr-TR')}</strong></p>
          <div style={mList}>
            {sorted.map((s, i) => (
              <div key={s.id} style={mRow(i)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: COLORS[i % COLORS.length], width: `${total > 0 ? (s.monthlyFee || 0) / total * 100 : 0}%`, borderRadius: 3 }} />
                  </div>
                  <div style={{ color: '#111827', fontWeight: 800, fontSize: '0.9rem', minWidth: 70, textAlign: 'right' }}>₺{(s.monthlyFee || 0).toLocaleString('tr-TR')}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (type === 'thismonth') {
      const thisMonthPayments = payments.filter(p => {
        if (p.status !== 'alındı' || !p.date) return false;
        const d = new Date(p.date);
        return d >= startOfMonth(now) && d <= endOfMonth(now);
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      const thisMonthDebts = payments.filter(p => {
        if ((p.status !== 'bekliyor' && p.status !== 'gecikmiş') || !p.date) return false;
        const d = new Date(p.date);
        return d >= startOfMonth(now) && d <= endOfMonth(now);
      });

      const collected = thisMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);
      const pending = thisMonthDebts.reduce((s, p) => s + (p.amount || 0), 0);

      return (
        <>
          <h2 style={mTitle}>Bu Ay — {format(now, 'MMMM yyyy', { locale: tr })}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '0.85rem' }}>
              <div style={{ color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4 }}>TAHSİL EDİLEN</div>
              <div style={{ color: '#15803d', fontSize: '1.3rem', fontWeight: 800 }}>₺{collected.toLocaleString('tr-TR')}</div>
            </div>
            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '0.85rem' }}>
              <div style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4 }}>BEKLEYEN</div>
              <div style={{ color: '#b45309', fontSize: '1.3rem', fontWeight: 800 }}>₺{pending.toLocaleString('tr-TR')}</div>
            </div>
          </div>
          <div style={mList}>
            {thisMonthPayments.length === 0 && <p style={mEmpty}>Bu ay henüz ödeme alınmamış</p>}
            {thisMonthPayments.map((p, i) => (
              <div key={p.id} style={mRow(i)}>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '0.88rem' }}>{p.studentName}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.date} · {p.method}</div>
                </div>
                <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem' }}>+₺{(p.amount || 0).toLocaleString('tr-TR')}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: visible ? 'rgba(17,24,39,0.55)' : 'rgba(17,24,39,0)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: visible ? 'blur(4px)' : 'blur(0px)', transition: 'background 0.22s ease, backdrop-filter 0.22s ease' }} onClick={handleClose}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.18)', overflow: 'hidden', transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)', opacity: visible ? 1 : 0, transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1rem 0' }}>
          <button onClick={handleClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem', overflowY: 'auto' }}>
          {content()}
        </div>
      </div>
    </div>,
    document.body
  );
}

const mTitle = { color: '#111827', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' };
const mSub = { color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1rem' };
const mList = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const mEmpty = { color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.875rem' };
const mRow = (i) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0.85rem', borderRadius: 10, background: i % 2 === 0 ? '#f9fafb' : 'white', border: '1px solid #f3f4f6' });

// ── Main Page ─────────────────────────────────────────────────
export default function TeacherFinance() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payModalStudent, setPayModalStudent] = useState(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [txFilter, setTxFilter] = useState({ type: 'all', studentId: 'all', dateFrom: '', dateTo: '' });
  const [detailType, setDetailType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cp = dataCache.get('payments');
    const cs = dataCache.get('students');
    const cl = dataCache.get('lessons');
    if (cp) setPayments(cp);
    if (cs) setStudents(cs);
    if (cl) setLessons(cl);
    if (cp && cs && cl) setLoading(false);
    loadAll();
  }, []);

  const loadAll = async () => {
    const me = await base44.auth.me();
    const [p, s, l] = await Promise.all([
      base44.entities.Payment.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
    ]);
    setPayments(p); setStudents(s); setLessons(l);
    dataCache.set('payments', p);
    dataCache.set('students', s);
    dataCache.set('lessons', l);
    setLoading(false);
  };

  const totalIncome = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingIncome = Math.max(0, totalDebt - totalIncome);
  const monthlyRecurring = students.reduce((s, st) => s + (st.monthlyFee || 0), 0);

  const now = new Date();
  const thisMonthIncome = payments.filter(p => {
    if (p.status !== 'alındı' || !p.date) return false;
    const d = new Date(p.date);
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }).reduce((s, p) => s + (p.amount || 0), 0);

  const totalWeeklyHours = students.reduce((s, st) => s + ((st.weeklyLessons || 1) * 1), 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(now, 5 - i);
    const income = payments.filter(p => {
      if (!p.date || p.status !== 'alındı') return false;
      const d = new Date(p.date);
      return d >= startOfMonth(m) && d <= endOfMonth(m);
    }).reduce((s, p) => s + (p.amount || 0), 0);
    const earned = payments.filter(p => {
      if (!p.date) return false;
      const d = new Date(p.date);
      return d >= startOfMonth(m) && d <= endOfMonth(m);
    }).reduce((s, p) => s + (p.amount || 0), 0);
    return { month: format(m, 'MMM yy', { locale: tr }), gelir: income, hakedilen: earned };
  });

  const weeklyHoursData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const mins = lessons.filter(l => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d >= weekStart && d <= weekEnd && l.status !== 'iptal';
    }).reduce((s, l) => s + (l.duration || 60), 0);
    return { week: format(weekStart, 'd MMM', { locale: tr }), saat: Math.round(mins / 60 * 10) / 10 };
  });

  const studentIncome = students.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    total: payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0),
  })).sort((a, b) => b.total - a.total);

  const pendingByStudent = students.map(s => {
    const debt = payments.filter(p => p.studentId === s.id && (p.status === 'bekliyor' || p.status === 'gecikmiş')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const collected = payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0);
    return { student: s, amount: Math.max(0, debt - collected) };
  }).filter(x => x.amount > 0);

  const maxStudentIncome = studentIncome[0]?.total || 1;
  const card = { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  if (loading) return (
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ height: '2rem', width: '220px', borderRadius: 8, background: 'rgba(0,0,0,0.08)', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '1rem', width: '300px', borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {Array.from({length: 5}).map((_, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.1rem', border: '1.5px solid #e5e7eb', height: 120, animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.08 }}>
            <div style={{ height: '2rem', width: '2rem', borderRadius: 10, background: '#f3f4f6', marginBottom: '0.75rem' }} />
            <div style={{ height: '0.7rem', width: '80%', borderRadius: 4, background: '#f3f4f6', marginBottom: '0.5rem' }} />
            <div style={{ height: '1.5rem', width: '60%', borderRadius: 6, background: '#f3f4f6' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem' }}>
        {[300, 300].map((h, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e5e7eb', height: h, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  return (
    <>
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.2rem' }}>Finans Yönetimi</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Gelir, ödeme ve öğrenci bazlı istatistikler</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAll} style={{ background: 'white', border: '1.5px solid #e5e7eb', color: '#6b7280', borderRadius: '10px', padding: '0.55rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} />
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowStudentPicker(v => !v)}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
              <Plus size={16} /> Ödeme Ekle <ChevronDown size={14} />
            </button>
            {showStudentPicker && (
              <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '0.5rem', minWidth: '200px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {students.length === 0 && <p style={{ color: '#9ca3af', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>Öğrenci yok</p>}
                {students.map(s => (
                  <button key={s.id} onClick={() => { setPayModalStudent(s); setShowStudentPicker(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', borderRadius: '9px', border: 'none', background: 'transparent', color: '#111827', fontSize: '0.875rem', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <StatCard icon={Users} iconColor='#ec4899' label='Aktif Öğrenci' value={students.length} sub='Detay için tıkla' onClick={() => setDetailType('students')} />
        <StatCard icon={DollarSign} iconColor='#f97316' label='Toplam Gelir' value={`₺${totalIncome.toLocaleString('tr-TR')}`} sub='Detay için tıkla' onClick={() => setDetailType('income')} />
        <StatCard icon={Clock} iconColor='#6366f1' label='Haftalık Planlanan Ders' value={`${totalWeeklyHours} Saat`} sub='Detay için tıkla' onClick={() => setDetailType('hours')} />
        <StatCard icon={TrendingUp} iconColor='#10b981' label='Düzenli Gelir' value={`₺${monthlyRecurring.toLocaleString('tr-TR')}`} sub='Detay için tıkla' badge='Aylık' onClick={() => setDetailType('mrr')} />
        <StatCard icon={TrendingUp} iconColor='#8b5cf6' label='Bu Ay (Hakedilen)' value={`₺${thisMonthIncome.toLocaleString('tr-TR')}`} sub='Detay için tıkla' onClick={() => setDetailType('thismonth')} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <div>
              <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem' }}>Aylık Gelir Grafiği</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                Ort. ₺{monthlyData.length > 0 ? Math.round(monthlyData.reduce((s, d) => s + d.gelir, 0) / 6).toLocaleString('tr-TR') : 0} (Son 6 ay)
              </p>
            </div>
          </div>
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='gradGelir' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='gradHak' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey='month' tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.8rem' }} formatter={v => [`₺${v.toLocaleString('tr-TR')}`, '']} />
              <Area type='monotone' dataKey='hakedilen' stroke='#c7d2fe' fill='url(#gradHak)' strokeWidth={1.5} dot={false} />
              <Area type='monotone' dataKey='gelir' stroke='#f97316' fill='url(#gradGelir)' strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <div>
              <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem' }}>Haftalık Çalışma Saatleri</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.15rem' }}>Son 8 hafta</p>
            </div>
            <div style={{ padding: '0.4rem', background: '#fff7ed', borderRadius: '8px' }}>
              <Clock size={16} color='#f97316' />
            </div>
          </div>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={weeklyHoursData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey='week' tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.8rem' }} formatter={v => [`${v} saat`, '']} />
              <Bar dataKey='saat' fill='#fed7aa' radius={[6, 6, 0, 0]}>
                {weeklyHoursData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyHoursData.length - 1 ? '#f97316' : '#fed7aa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'start' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>Bekleyen Bakiye</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
            Öğrenci dağılımı · {pendingByStudent.length} öğrenci
          </p>

          {pendingByStudent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Bekleyen ödeme yok</p>
            </div>
          ) : (
            <>
              {/* Donut chart */}
              {(() => {
                const R = 70;
                const STROKE = 16;
                const CIRC = 2 * Math.PI * R;
                const SIZE = 200;
                const total = pendingByStudent.reduce((s, x) => s + x.amount, 0);
                let cumulative = 0;
                const slices = pendingByStudent.slice(0, 5).map((x, i) => {
                  const pct = x.amount / total;
                  const dash = pct * CIRC;
                  // offset: başlangıç noktasını ayarlamak için CIRC'den cumulative kadar geri git
                  const offset = CIRC * (1 - cumulative);
                  cumulative += pct;
                  return { ...x, dash, gap: CIRC - dash, offset, color: COLORS[i % COLORS.length] };
                });
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
                      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                        {/* Background circle */}
                        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill='none' stroke='#f3f4f6' strokeWidth={STROKE} />
                        {/* Colored slices */}
                        {slices.map((s, i) => (
                          <circle key={i}
                            cx={SIZE/2} cy={SIZE/2} r={R}
                            fill='none'
                            stroke={s.color}
                            strokeWidth={STROKE}
                            strokeDasharray={`${s.dash - 2} ${s.gap + 2}`}
                            strokeDashoffset={s.offset}
                            strokeLinecap='round'
                            transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                          />
                        ))}
                      </svg>
                      {/* Center text */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOPLAM</div>
                        <div style={{ color: '#111827', fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.2 }}>₺{total.toLocaleString('tr-TR')}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {pendingByStudent.slice(0, 5).map(({ student, amount }, i) => {
                  const total = pendingByStudent.reduce((s, x) => s + x.amount, 0);
                  const pct = total > 0 ? Math.round(amount / total * 100) : 0;
                  return (
                    <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.6rem', borderRadius: 8, background: '#f9fafb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: '#374151', fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100px' }}>{student.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#111827', fontSize: '0.78rem', fontWeight: 700 }}>₺{amount.toLocaleString('tr-TR')}</span>
                        <span style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length], fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 20 }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={card}>
          <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>Öğrenci Bazlı Kazanç</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Tüm öğrenciler · {students.length} öğrenci</p>
          {studentIncome.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>Henüz ödeme kaydı yok</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {studentIncome.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#374151', fontSize: '0.83rem', fontWeight: '500' }}>{s.name}</span>
                    <span style={{ color: '#111827', fontSize: '0.83rem', fontWeight: '700' }}>₺{s.total.toLocaleString('tr-TR')}</span>
                  </div>
                  <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '5px', background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}cc)`, width: `${maxStudentIncome > 0 ? Math.max((s.total / maxStudentIncome) * 100, 2) : 0}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingByStudent.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid #f3f4f6' }}>
              <h4 style={{ color: '#374151', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Bekleyen Ödemeler</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
                {pendingByStudent.map(({ student, amount }) => (
                  <div key={student.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#374151', fontWeight: '600', fontSize: '0.8rem' }}>{student.name.split(' ')[0]}</div>
                      <div style={{ color: '#d97706', fontSize: '0.95rem', fontWeight: '800' }}>₺{amount.toLocaleString('tr-TR')}</div>
                    </div>
                    <button onClick={() => setPayModalStudent(student)}
                      style={{ background: '#f59e0b', border: 'none', color: 'white', borderRadius: '8px', padding: '0.35rem 0.6rem', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                      Tahsil Et
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Geçmiş Ödeme İşlemleri - ayrı kutu */}
      <div style={card}>
        {/* Başlık + Filtreler */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#111827', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Geçmiş Ödeme İşlemleri</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tüm borç ve ödeme kayıtları</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {/* Tip filtresi - toggle buton */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: '0.2rem', gap: '0.1rem' }}>
              {[['all','Tümü'], ['debt','Borç'], ['payment','Ödeme']].map(([v, l]) => (
                <button key={v} onClick={() => setTxFilter(f => ({ ...f, type: v }))}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: 8, border: 'none', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                    background: txFilter.type === v ? 'white' : 'transparent',
                    color: txFilter.type === v ? '#111827' : '#9ca3af',
                    boxShadow: txFilter.type === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}>{l}</button>
              ))}
            </div>
            <select value={txFilter.studentId} onChange={e => setTxFilter(f => ({ ...f, studentId: e.target.value }))}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#374151', background: 'white', cursor: 'pointer', fontWeight: '500' }}>
              <option value="all">Tüm Öğrenciler</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={txFilter.dateFrom} onChange={e => setTxFilter(f => ({ ...f, dateFrom: e.target.value }))}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#374151', background: 'white' }} />
            <input type="date" value={txFilter.dateTo} onChange={e => setTxFilter(f => ({ ...f, dateTo: e.target.value }))}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#374151', background: 'white' }} />
            {(txFilter.type !== 'all' || txFilter.studentId !== 'all' || txFilter.dateFrom || txFilter.dateTo) && (
              <button onClick={() => setTxFilter({ type: 'all', studentId: 'all', dateFrom: '', dateTo: '' })}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #fca5a5', fontSize: '0.85rem', color: '#ef4444', background: '#fef2f2', cursor: 'pointer', fontWeight: '600' }}>
                ✕ Temizle
              </button>
            )}
          </div>
        </div>

        {(() => {
          const debtRows = lessons
            .filter(l => l.status === 'tamamlandı' && (l.lessonFee || 0) > 0)
            .map(l => ({ id: 'lesson-' + l.id, type: 'debt', studentId: l.studentId, amount: l.lessonFee, date: l.date, description: l.subject || 'Ders tamamlandı' }));
          const receivedRows = payments.filter(p => p.status === 'alındı').map(p => ({ ...p, type: 'payment' }));
          const allRows = [...debtRows, ...receivedRows]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .filter(row => {
              if (txFilter.type !== 'all' && row.type !== txFilter.type) return false;
              if (txFilter.studentId !== 'all' && row.studentId !== txFilter.studentId) return false;
              if (txFilter.dateFrom && row.date < txFilter.dateFrom) return false;
              if (txFilter.dateTo && row.date > txFilter.dateTo) return false;
              return true;
            });

          if (allRows.length === 0) return (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <p style={{ fontSize: '1rem', fontWeight: '600' }}>Kayıt bulunamadı</p>
            </div>
          );

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {allRows.map((row, i) => {
                const isDebt = row.type === 'debt';
                const studentName = students.find(s => s.id === row.studentId)?.name || '—';
                const dateStr = row.date ? new Date(row.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
                return (
                  <div key={row.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: 14, background: isDebt ? '#fff8f8' : '#f0fdf4', border: `1.5px solid ${isDebt ? '#fee2e2' : '#bbf7d0'}`, transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${isDebt ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {/* İkon */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isDebt ? '#fee2e2' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {isDebt ? '📚' : '💰'}
                    </div>
                    {/* Bilgi */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {studentName}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        {isDebt ? (row.description || 'Ders tamamlandı') : (row.description || 'Ödeme alındı')} · {row.method ? row.method.charAt(0).toUpperCase() + row.method.slice(1) : ''}
                      </div>
                    </div>
                    {/* Tarih */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: isDebt ? '#dc2626' : '#16a34a', fontWeight: '800', fontSize: '1.15rem', marginBottom: '0.2rem' }}>
                        {isDebt ? '-' : '+'}₺{(row.amount || 0).toLocaleString('tr-TR')}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{dateStr}</div>
                    </div>
                    {/* Badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ background: isDebt ? '#fee2e2' : '#dcfce7', color: isDebt ? '#dc2626' : '#16a34a', fontSize: '0.78rem', fontWeight: '700', padding: '0.3rem 0.75rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        {isDebt ? 'Borç' : 'Ödeme'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {payModalStudent && <PaymentModal student={payModalStudent} onClose={() => setPayModalStudent(null)} onSaved={loadAll} />}
    </div>
    {detailType && <DetailModal type={detailType} students={students} payments={payments} lessons={lessons} onClose={() => setDetailType(null)} />}
    </>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, sub, badge, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: 'white', border: `1.5px solid ${hovered ? iconColor + '55' : '#e5e7eb'}`, borderRadius: '16px', padding: '1.1rem 1.25rem', boxShadow: hovered ? `0 4px 20px ${iconColor}22` : '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', transform: hovered ? 'translateY(-2px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '10px', background: iconColor + '18' }}>
          <Icon size={18} color={iconColor} />
        </div>
        {badge && <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{badge}</span>}
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ color: '#111827', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.3rem' }}>{value}</p>
      {sub && <p style={{ color: hovered ? iconColor : '#9ca3af', fontSize: '0.72rem', lineHeight: 1.4, transition: 'color 0.2s' }}>{sub}</p>}
    </div>
  );
}