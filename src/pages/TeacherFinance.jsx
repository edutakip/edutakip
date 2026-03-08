import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign, Plus, AlertCircle } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import PaymentModal from '../components/teacher/PaymentModal';

const COLORS = ['var(--accent)', 'var(--purple)', 'var(--info)', 'var(--success)', 'var(--warning)'];

export default function TeacherFinance() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payModalStudent, setPayModalStudent] = useState(null);

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

  const totalIncome = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingIncome = payments.filter(p => p.status === 'bekliyor').reduce((s, p) => s + (p.amount || 0), 0);

  // Monthly income chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(new Date(), 5 - i);
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const income = payments.filter(p => {
      if (!p.date || p.status !== 'alındı') return false;
      const d = new Date(p.date);
      return d >= start && d <= end;
    }).reduce((s, p) => s + (p.amount || 0), 0);
    return { month: format(m, 'MMM yy', { locale: tr }), gelir: income };
  });

  // Student-based income
  const studentIncome = students.map(s => ({
    name: s.name.split(' ')[0],
    total: payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0),
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // Pending by student
  const pendingByStudent = students.map(s => ({
    student: s,
    amount: payments.filter(p => p.studentId === s.id && p.status === 'bekliyor').reduce((sum, p) => sum + (p.amount || 0), 0),
  })).filter(x => x.amount > 0);

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' };
  const statCard = (label, value, icon, color, sub) => (
    <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: color + '20' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{label}</p>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800' }}>{value}</p>
          {sub && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{sub}</p>}
        </div>
        <div style={{ padding: '0.6rem', borderRadius: '12px', background: color + '20' }}>
          {React.createElement(icon, { size: 20, color })}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.3rem' }}>Finans Yönetimi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ödemeler, gelir ve gider takibi ve istatistikler</p>
        </div>
        <button onClick={() => students.length > 0 && setPayModalStudent(students[0])}
          style={{ background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Ödeme Kaydet
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCard('Aktif Öğrenci', students.length, Users, 'var(--info)')}
        {statCard('Toplam Gelir', `₺${totalIncome.toLocaleString('tr-TR')}`, DollarSign, 'var(--accent)')}
        {statCard('Toplam Ders', lessons.length, Clock, 'var(--purple)')}
        {statCard('Bekleyen Bakiye', `₺${pendingIncome.toLocaleString('tr-TR')}`, AlertCircle, 'var(--warning)', pendingByStudent.length > 0 ? `${pendingByStudent.length} öğrenci` : 'Hepsi ödendi')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Monthly chart */}
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1.25rem' }}>Aylık Gelir Grafiği</h3>
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id='gradGelir' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey='month' tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              <Area type='monotone' dataKey='gelir' stroke='#f97316' fill='url(#gradGelir)' strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Student income */}
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1.25rem' }}>Öğrenci Bazlı Kazanç</h3>
          {studentIncome.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {studentIncome.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: '600' }}>₺{s.total.toLocaleString('tr-TR')}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '3px' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: COLORS[i % COLORS.length], width: `${totalIncome > 0 ? (s.total / totalIncome) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>Henüz ödeme kaydı yok</p>
          )}
        </div>
      </div>

      {/* Pending payments */}
      {pendingByStudent.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' }}>Bekleyen Ödemeler</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {pendingByStudent.map(({ student, amount }) => (
              <div key={student.id} style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{student.name}</div>
                  <div style={{ color: 'var(--warning)', fontSize: '1rem', fontWeight: '800' }}>₺{amount.toLocaleString('tr-TR')}</div>
                </div>
                <button onClick={() => setPayModalStudent(student)}
                  style={{ background: 'var(--warning)', border: 'none', color: 'white', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                  Tahsil Et
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {payModalStudent && <PaymentModal student={payModalStudent} onClose={() => setPayModalStudent(null)} onSaved={loadAll} />}
    </div>
  );
}