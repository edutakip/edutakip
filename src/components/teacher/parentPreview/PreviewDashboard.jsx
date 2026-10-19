import React from 'react';
import { Calendar, BookOpen, DollarSign, BarChart2, CheckCircle } from 'lucide-react';

export default function PreviewDashboard({ student, lessons, payments, homeworks }) {
  const totalPaid = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const bakiye = totalPaid - totalDebt;
  const monthlyFee = student?.monthlyFee || ((student?.feePerLesson || 0) * (student?.weeklyLessons || 1) * 4);

  const today = new Date();
  const upcomingLesson = lessons
    .filter(l => l.status === 'planlandı' && new Date(l.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const dayNamesLong = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  const scheduleMap = {};
  lessons.filter(l => l.status === 'planlandı').forEach(l => {
    try {
      const d = new Date(l.date + 'T12:00:00');
      const jsDay = d.getDay();
      if (!scheduleMap[jsDay]) scheduleMap[jsDay] = l.startTime;
    } catch {}
  });
  if (Object.keys(scheduleMap).length === 0) {
    (student?.schedule || []).forEach(slot => {
      if (typeof slot.day === 'number') {
        const jsDay = slot.day === 6 ? 0 : slot.day + 1;
        scheduleMap[jsDay] = slot.time;
      } else {
        const idx = dayNames.indexOf(slot.day);
        if (idx >= 0) scheduleMap[idx] = slot.time;
      }
    });
  }

  const completedHw = homeworks.filter(h => h.status === 'tamamlandı').length;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>Merhaba 👋</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{student?.name} için veli paneli</p>
      </div>

      {/* Hero card */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1b6e 100%)', borderRadius: '18px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{student?.name?.split(' ')[0]}</h2>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{student?.grade || ''}</span>
          </div>
          <span style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' }}>
            Aktif
          </span>
        </div>

        {upcomingLesson ? (
          <div style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Calendar size={13} color='#a5b4fc' />
              <span style={{ color: '#a5b4fc', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.5px' }}>SONRAKİ DERS</span>
            </div>
            <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>
              {dayNamesLong[new Date(upcomingLesson.date).getDay()]}, {new Date(upcomingLesson.date).getDate()} {monthNames[new Date(upcomingLesson.date).getMonth()]}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}> · {upcomingLesson.startTime}{upcomingLesson.endTime ? ` - ${upcomingLesson.endTime}` : ''}</span>
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>Planlanmış ders yok</p>
          </div>
        )}

        {/* Weekly schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem', marginBottom: '1rem' }}>
          {[1,2,3,4,5,6,0].map(dayIdx => {
            const time = scheduleMap[dayIdx];
            const hasLesson = !!time;
            return (
              <div key={dayIdx} style={{
                background: hasLesson ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                border: hasLesson ? '1.5px solid rgba(99,102,241,0.6)' : '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '0.4rem 0.2rem', textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: hasLesson ? '#a5b4fc' : 'rgba(255,255,255,0.3)', marginBottom: '0.15rem' }}>{dayNames[dayIdx]}</p>
                <p style={{ fontSize: '0.6rem', color: hasLesson ? 'white' : 'rgba(255,255,255,0.2)', fontWeight: hasLesson ? 600 : 400 }}>{time || '—'}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BAKİYE</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: bakiye < 0 ? '#fca5a5' : '#6ee7b7' }}>
              {bakiye < 0 ? '-' : ''}₺{Math.abs(bakiye).toLocaleString('tr-TR')}
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AYLIK</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>₺{monthlyFee.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </div>

      {/* Menu cards (read-only) */}
      <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '0.85rem' }}>Veli Menüsü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.85rem' }}>
        {[
          { label: 'Dersler & Ödemeler', desc: 'Ders ve ödeme geçmişi', icon: DollarSign, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', stat: `${lessons.length} ders` },
          { label: 'Ödevler', desc: 'Verilen ödevleri görüntüle', icon: BookOpen, gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', stat: `${completedHw}/${homeworks.length} tamamlandı` },
          { label: 'Ders Performansı', desc: 'Gelişim grafikleri ve raporlar', icon: BarChart2, gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', stat: `${lessons.filter(l => l.status === 'tamamlandı').length} tamamlandı` },
          { label: 'Ders Talebi', desc: 'İptal/erteleme talebi', icon: Calendar, gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', stat: '' },
        ].map(({ label, desc, icon: Icon, gradient, stat }) => (
          <div key={label} style={{
            background: gradient, borderRadius: '14px', padding: '1rem',
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', position: 'relative' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.25)' }}>
                <Icon size={18} color='white' />
              </div>
              <CheckCircle size={14} color="rgba(255,255,255,0.5)" />
            </div>
            <h3 style={{ color: 'white', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.2rem', position: 'relative' }}>{label}</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', lineHeight: 1.3, position: 'relative', marginBottom: stat ? '0.5rem' : 0 }}>{desc}</p>
            {stat && (
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '8px', padding: '0.3rem 0.6rem', position: 'relative' }}>
                <p style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800, margin: 0 }}>{stat}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}