import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, DollarSign, Clock, TrendingUp, AlertCircle, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import PaymentModal from '../components/teacher/PaymentModal';

const COLORS = ['#f97316', '#6366f1', '#10b981', '#8b5cf6', '#3b82f6'];

export default function TeacherFinance() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payModalStudent, setPayModalStudent] = useState(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [txFilter, setTxFilter] = useState({ type: 'all', studentId: 'all', dateFrom: '', dateTo: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const me = await base44.auth.me();
    const [p, s, l] = await Promise.all([
      base44.entities.Payment.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
    ]);
    setPayments(p); setStudents(s); setLessons(l);
  };

  // --- Calculations ---
  const totalIncome = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingIncome = Math.max(0, totalDebt - totalIncome);

  const monthlyRecurring = students.reduce((s, st) => s + (st.monthlyFee || 0), 0);

  // This month earned
  const now = new Date();
  const thisMonthIncome = payments.filter(p => {
    if (p.status !== 'alındı' || !p.date) return false;
    const d = new Date(p.date);
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }).reduce((s, p) => s + (p.amount || 0), 0);

  // Weekly planned hours
  const totalWeeklyHours = students.reduce((s, st) => s + ((st.weeklyLessons || 1) * 1), 0);

  // Monthly chart (last 6 months)
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

  // Weekly hours chart (last 8 weeks)
  const weeklyHoursData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const mins = lessons.filter(l => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d >= weekStart && d <= weekEnd && l.status !== 'iptal';
    }).reduce((s, l) => s + (l.duration || 60), 0);
    return {
      week: format(weekStart, 'd MMM', { locale: tr }),
      saat: Math.round(mins / 60 * 10) / 10,
    };
  });

  // Student income (for horizontal bars)
  const studentIncome = students.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    total: payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0),
  })).sort((a, b) => b.total - a.total);

  // Pending by student (for donut) — borç - tahsil = net bekleyen
  const pendingByStudent = students.map(s => {
    const debt = payments.filter(p => p.studentId === s.id && (p.status === 'bekliyor' || p.status === 'gecikmiş')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const collected = payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0);
    return { student: s, amount: Math.max(0, debt - collected) };
  }).filter(x => x.amount > 0);

  const maxStudentIncome = studentIncome[0]?.total || 1;

  const card = { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  return (
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
            <button
              onClick={() => setShowStudentPicker(v => !v)}
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
              <Plus size={16} /> Ödeme Ekle <ChevronDown size={14} />
            </button>
            {showStudentPicker && (
              <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '0.5rem', minWidth: '200px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {students.length === 0 && <p style={{ color: '#9ca3af', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>Öğrenci yok</p>}
                {students.map(s => (
                  <button key={s.id} onClick={() => { setPayModalStudent(s); setShowStudentPicker(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', borderRadius: '9px', border: 'none', background: 'transparent', color: '#111827', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.1s' }}
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
        {/* Aktif Öğrenci */}
        <StatCard icon={Users} iconColor='#ec4899' label='Aktif Öğrenci' value={students.length} sub='Tüm öğrenciler aktif' />
        {/* Toplam Gelir */}
        <StatCard icon={DollarSign} iconColor='#f97316' label='Toplam Gelir' value={`₺${totalIncome.toLocaleString('tr-TR')}`} sub={`Hakedilen: ₺${(totalIncome + pendingIncome).toLocaleString('tr-TR')}`} />
        {/* Haftalık ders */}
        <StatCard icon={Clock} iconColor='#6366f1' label='Haftalık Planlanan Ders' value={`${totalWeeklyHours} Saat`} sub='Aktif öğrencilere göre' />
        {/* Düzenli gelir */}
        <StatCard icon={TrendingUp} iconColor='#10b981' label='Düzenli Gelir' value={`₺${monthlyRecurring.toLocaleString('tr-TR')}`} sub='Aylık yinelenen' badge='Aylık' />
        {/* Bu ay */}
        <StatCard icon={TrendingUp} iconColor='#8b5cf6' label='Bu Ay (Hakedilen)' value={`₺${thisMonthIncome.toLocaleString('tr-TR')}`}
          sub={`Tahsil: ₺${thisMonthIncome.toLocaleString('tr-TR')} | Tahmini: ₺${monthlyRecurring.toLocaleString('tr-TR')}`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Monthly income */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <div>
              <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem' }}>Aylık Gelir Grafiği</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                Ort. ₺{monthlyData.length > 0 ? Math.round(monthlyData.reduce((s, d) => s + d.gelir, 0) / 6).toLocaleString('tr-TR') : 0} (Son 6 ay)
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#6b7280' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#e5e7eb', display: 'inline-block' }} /> Hakedilen
              </span>
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

        {/* Weekly hours */}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        {/* Pending balance donut */}
        <div style={card}>
          <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>Bekleyen Bakiye</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '1rem' }}>
            Öğrenci dağılımı · {pendingByStudent.length} öğrenci
          </p>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {pendingByStudent.slice(0, 4).map(({ student, amount }, i) => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: '#374151', fontSize: '0.8rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '110px' }}>{student.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#111827', fontSize: '0.8rem', fontWeight: '600' }}>₺{amount.toLocaleString('tr-TR')}</span>
                  {pendingIncome > 0 && <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{Math.round(amount / pendingIncome * 100)}%</span>}
                </div>
              </div>
            ))}
            {pendingByStudent.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Bekleyen ödeme yok 🎉</p>}
          </div>
          {/* Circle */}
          {pendingIncome > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width='120' height='120' viewBox='0 0 120 120'>
                  <circle cx='60' cy='60' r='50' fill='none' stroke='#f3f4f6' strokeWidth='12' />
                  <circle cx='60' cy='60' r='50' fill='none' stroke='#f97316' strokeWidth='12'
                    strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset='0'
                    strokeLinecap='round' transform='rotate(-90 60 60)' />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase' }}>TOPLAM</div>
                  <div style={{ color: '#111827', fontSize: '1.1rem', fontWeight: '800' }}>₺{pendingIncome.toLocaleString('tr-TR')}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student earnings horizontal bars */}
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
                    <div style={{
                      height: '100%', borderRadius: '5px',
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}cc)`,
                      width: `${maxStudentIncome > 0 ? Math.max((s.total / maxStudentIncome) * 100, 2) : 0}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending payments quick actions */}
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

          {/* Geçmiş Ödeme İşlemleri */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1.5px solid #f3f4f6' }}>
           <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Geçmiş Ödeme İşlemleri</h3>

           {/* Filtreler */}
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
             <select value={txFilter.type} onChange={e => setTxFilter(f => ({ ...f, type: e.target.value }))}
               style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: 'white', cursor: 'pointer' }}>
               <option value="all">Tüm İşlemler</option>
               <option value="debt">Borç Eklendi</option>
               <option value="payment">Ödeme Alındı</option>
             </select>
             <select value={txFilter.studentId} onChange={e => setTxFilter(f => ({ ...f, studentId: e.target.value }))}
               style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: 'white', cursor: 'pointer' }}>
               <option value="all">Tüm Öğrenciler</option>
               {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
             <input type="date" value={txFilter.dateFrom} onChange={e => setTxFilter(f => ({ ...f, dateFrom: e.target.value }))}
               placeholder="Başlangıç"
               style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: 'white' }} />
             <input type="date" value={txFilter.dateTo} onChange={e => setTxFilter(f => ({ ...f, dateTo: e.target.value }))}
               placeholder="Bitiş"
               style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: 'white' }} />
             {(txFilter.type !== 'all' || txFilter.studentId !== 'all' || txFilter.dateFrom || txFilter.dateTo) && (
               <button onClick={() => setTxFilter({ type: 'all', studentId: 'all', dateFrom: '', dateTo: '' })}
                 style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #fca5a5', fontSize: '0.8rem', color: '#ef4444', background: '#fef2f2', cursor: 'pointer' }}>
                 Temizle
               </button>
             )}
           </div>

           {(() => {
             const debtRows = lessons
               .filter(l => l.status === 'tamamlandı' && (l.lessonFee || 0) > 0)
               .map(l => ({ id: 'lesson-' + l.id, type: 'debt', studentId: l.studentId, amount: l.lessonFee, date: l.date }));
             const receivedRows = payments
               .filter(p => p.status === 'alındı')
               .map(p => ({ ...p, type: 'payment' }));

             const allRows = [...debtRows, ...receivedRows]
               .sort((a, b) => new Date(b.date) - new Date(a.date))
               .filter(row => {
                 if (txFilter.type !== 'all' && row.type !== txFilter.type) return false;
                 if (txFilter.studentId !== 'all' && row.studentId !== txFilter.studentId) return false;
                 if (txFilter.dateFrom && row.date < txFilter.dateFrom) return false;
                 if (txFilter.dateTo && row.date > txFilter.dateTo) return false;
                 return true;
               });

             return (
               <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                       <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Öğrenci</th>
                       <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Tutar</th>
                       <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Tarih</th>
                       <th style={{ textAlign: 'left', padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>İşlem</th>
                     </tr>
                   </thead>
                   <tbody>
                     {allRows.length === 0 ? (
                       <tr>
                         <td colSpan="4" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                           Kayıt bulunamadı
                         </td>
                       </tr>
                     ) : allRows.map(row => (
                       <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                         onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                         <td style={{ padding: '0.85rem 1rem', color: '#374151', fontSize: '0.85rem', fontWeight: '600' }}>
                           {students.find(s => s.id === row.studentId)?.name || '—'}
                         </td>
                         <td style={{ padding: '0.85rem 1rem', color: row.type === 'debt' ? '#b91c1c' : '#065f46', fontSize: '0.9rem', fontWeight: '700' }}>
                           {row.type === 'debt' ? '-' : '+'}₺{(row.amount || 0).toLocaleString('tr-TR')}
                         </td>
                         <td style={{ padding: '0.85rem 1rem', color: '#6b7280', fontSize: '0.82rem' }}>
                           {row.date ? new Date(row.date).toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}
                         </td>
                         <td style={{ padding: '0.85rem 1rem' }}>
                           {row.type === 'debt' ? (
                             <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '6px', display: 'inline-block' }}>Borç Eklendi</span>
                           ) : (
                             <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '6px', display: 'inline-block' }}>Ödeme Alındı</span>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             );
           })()}
          </div>
          </div>
          </div>

          {payModalStudent && <PaymentModal student={payModalStudent} onClose={() => setPayModalStudent(null)} onSaved={loadAll} />}
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, sub, badge }) {
  return (
    <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '10px', background: iconColor + '18' }}>
          <Icon size={18} color={iconColor} />
        </div>
        {badge && (
          <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>{badge}</span>
        )}
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ color: '#111827', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.3rem' }}>{value}</p>
      {sub && <p style={{ color: '#9ca3af', fontSize: '0.72rem', lineHeight: 1.4 }}>{sub}</p>}
    </div>
  );
}