import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle, DollarSign, AlertCircle, BookOpen, BarChart2, Settings, RefreshCw, ChevronRight, LogOut } from 'lucide-react';
import { createPageUrl } from '@/utils';
import LessonRequestModal from '../components/parent/LessonRequestModal';

const neonBtnStyle = `
  @property --btn-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .neon-connect-btn {
    position: relative;
    width: 100%;
    padding: 0.9rem 1.5rem;
    border-radius: 100px;
    border: none;
    background: #5c35cc;
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.01em;
    overflow: hidden;
    outline: none;
    transition: background 0.2s, transform 0.15s;
    opacity: 1;
  }

  .neon-connect-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .neon-connect-btn:not(:disabled):hover {
    background: #6a40dd;
    transform: scale(1.02);
  }

  .neon-connect-btn:not(:disabled):active {
    transform: scale(0.97);
  }

  .neon-connect-btn::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 100px;
    padding: 2px;
    background: conic-gradient(
      from var(--btn-angle),
      #a855f7, #7c3aed, #4f46e5, #818cf8, #c084fc, #a855f7
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: btn-border-spin 2.5s linear infinite;
    pointer-events: none;
  }

  .neon-connect-btn::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 100px;
    box-shadow: 0 0 18px 4px rgba(139,92,246,0.55), 0 0 40px 8px rgba(109,40,217,0.28);
    animation: btn-glow-pulse 1.8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes btn-border-spin {
    to { --btn-angle: 360deg; }
  }

  @keyframes btn-glow-pulse {
    0%, 100% { opacity: 0.7; }
    50%       { opacity: 1; }
  }

  .neon-btn-streak {
    position: absolute;
    top: 0; left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    border-radius: 100px;
    animation: btn-streak 2.2s linear infinite;
    pointer-events: none;
  }

  @keyframes btn-streak {
    0%   { left: -60%; }
    100% { left: 120%; }
  }

  .neon-btn-sparkle {
    font-size: 18px;
    position: relative;
    z-index: 1;
    animation: sparkle-anim 3s ease-in-out infinite;
    filter: drop-shadow(0 0 4px rgba(216,180,254,1));
    display: inline-flex;
  }

  @keyframes sparkle-anim {
    0%,100% { transform: scale(1) rotate(0deg); opacity: 1; }
    25%      { transform: scale(1.35) rotate(20deg); opacity: 1; }
    50%      { transform: scale(1) rotate(0deg); opacity: 0.6; }
    75%      { transform: scale(1.2) rotate(-15deg); opacity: 1; }
  }

  .neon-btn-label {
    position: relative;
    z-index: 1;
  }
`;

export default function ParentDashboard() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showLessonRequest, setShowLessonRequest] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadStudentData(u.email);
    });
  }, []);

  const loadStudentData = async (email) => {
    const all = await base44.entities.Student.filter({ parentEmail: email, inviteAccepted: true });
    if (all.length > 0) {
      const s = all[0];
      setStudent(s);
      const [l, p] = await Promise.all([
        base44.entities.Lesson.filter({ studentId: s.id }),
        base44.entities.Payment.filter({ studentId: s.id }),
      ]);
      setLessons(l.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setPayments(p);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true); setError('');
    const all = await base44.entities.Student.filter({ inviteCode: inviteCode.toUpperCase() });
    if (all.length === 0) {
      setError('Geçersiz davet kodu. Lütfen öğretmeninizden aldığınız kodu kontrol edin.');
      setLoading(false); return;
    }
    const s = all[0];
    await base44.entities.Student.update(s.id, { inviteAccepted: true, parentEmail: user?.email || '' });
    setLoading(false);
    loadStudentData(user?.email || '');
  };

  const totalPaid = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === 'bekliyor').reduce((s, p) => s + (p.amount || 0), 0);

  if (!student) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{neonBtnStyle}</style>
        <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', width: '100%', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Öğrenciye Bağlan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Öğretmeninizin size verdiği davet kodunu girerek çocuğunuzun derslerini takip edebilirsiniz.
          </p>
          <input
            value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
            placeholder='Davet kodunu girin (örn: ABC123)'
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center', letterSpacing: '3px', fontWeight: '700', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && handleJoinWithCode()}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button
            onClick={handleJoinWithCode}
            disabled={loading || !inviteCode.trim()}
            className="neon-connect-btn"
          >
            <div className="neon-btn-streak" />
            <span className="neon-btn-sparkle">✦</span>
            <span className="neon-btn-label">
              {loading ? 'Bağlanıyor...' : 'Hesabıma Bağla'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      label: 'Dersler & Ödemeler',
      desc: 'Toplam ders sayısı ve ödeme geçmişini görüntüle',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      shadow: 'rgba(99,102,241,0.35)',
      page: 'ParentLessonsPayments',
      stats: [
        { label: 'Toplam Ders', value: lessons.length },
        { label: 'Ödenen', value: `₺${totalPaid.toLocaleString('tr-TR')}` },
      ],
    },
    {
      label: 'Ödevler',
      desc: 'Öğretmenin verdiği ödevleri takip et',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      shadow: 'rgba(245,158,11,0.35)',
      page: 'ParentHomework',
      stats: [],
    },
    {
      label: 'Ders Performansı',
      desc: 'Gelişim grafikleri ve değerlendirme notları',
      icon: BarChart2,
      gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      shadow: 'rgba(16,185,129,0.35)',
      page: 'ParentPerformance',
      stats: [
        { label: 'Tamamlanan', value: lessons.filter(l => l.status === 'tamamlandı').length },
      ],
    },
    {
      label: 'Ders Talebi',
      desc: 'İptal, erteleme veya değişim talebinde bulun',
      icon: RefreshCw,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      shadow: 'rgba(59,130,246,0.35)',
      page: 'lessonRequest',
      stats: [],
    },
    {
      label: 'Ayarlar',
      desc: 'Bildirim ve hesap tercihlerini yönet',
      icon: Settings,
      gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      shadow: 'rgba(100,116,139,0.35)',
      page: 'ParentSettings',
      stats: [],
    },
    {
      label: 'Çıkış Yap',
      desc: 'Hesabınızdan çıkış yapın',
      icon: LogOut,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadow: 'rgba(239,68,68,0.35)',
      page: 'logout',
      stats: [],
    },
  ];

  return (
    <div style={{ padding: '1rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800' }}>Merhaba 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          {student.name} için veli paneli
        </p>
      </div>

      {/* Quick Stats Row */}
      {(() => {
        const today = new Date();
        const upcomingLesson = lessons.filter(l => l.status === 'planlandı' && new Date(l.date) >= new Date(today.toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
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
          (student.schedule || []).forEach(slot => {
            if (typeof slot.day === 'number') {
              const jsDay = slot.day === 6 ? 0 : slot.day + 1;
              scheduleMap[jsDay] = slot.time;
            } else {
              const shortIdx = dayNames.indexOf(slot.day);
              if (shortIdx >= 0) { scheduleMap[shortIdx] = slot.time; return; }
              const longIdx = dayNamesLong.indexOf(slot.day);
              if (longIdx >= 0) scheduleMap[longIdx] = slot.time;
            }
          });
        }
        const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
        const bakiye = totalPaid - totalDebt;
        const monthlyFee = student.monthlyFee || (student.feePerLesson || 0) * (student.weeklyLessons || 1) * 4;
        return (
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1b6e 100%)', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(99,102,241,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'white' }}>{student.name.split(' ')[0]}</h2>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{student.grade || ''}</span>
              </div>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '0.72rem', fontWeight: '700', padding: '0.3rem 0.7rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Aktif
              </span>
            </div>

            {upcomingLesson ? (
              <div style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Calendar size={13} color='#a5b4fc' />
                  <span style={{ color: '#a5b4fc', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.5px' }}>SONRAKİ DERS</span>
                </div>
                <p style={{ color: 'white', fontSize: '1rem', fontWeight: '700' }}>
                  {dayNamesLong[new Date(upcomingLesson.date).getDay()]}, {new Date(upcomingLesson.date).getDate()} {monthNames[new Date(upcomingLesson.date).getMonth()]}
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}> · {upcomingLesson.startTime} - {upcomingLesson.endTime}</span>
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Planlanmış ders yok</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', marginBottom: '1rem' }}>
              {[1,2,3,4,5,6,0].map(dayIdx => {
                const time = scheduleMap[dayIdx];
                const label = dayNames[dayIdx];
                const hasLesson = !!time;
                return (
                  <div key={dayIdx} style={{
                    background: hasLesson ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                    border: hasLesson ? '1.5px solid rgba(99,102,241,0.6)' : '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.2rem',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: '700', color: hasLesson ? '#a5b4fc' : 'rgba(255,255,255,0.3)', marginBottom: '0.15rem' }}>{label}</p>
                    <p style={{ fontSize: '0.62rem', color: hasLesson ? 'white' : 'rgba(255,255,255,0.2)', fontWeight: hasLesson ? '600' : '400' }}>{time || '—'}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BAKİYE</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: bakiye < 0 ? '#fca5a5' : '#6ee7b7' }}>
                  {bakiye < 0 ? '-' : ''}₺{Math.abs(bakiye).toLocaleString('tr-TR')}
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AYLIK</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>₺{monthlyFee.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Menu Cards */}
      <h2 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem' }}>Menü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
        {menuItems.map(({ label, desc, icon: Icon, gradient, shadow, page, stats }) => {
          const handleClick = (e) => {
            if (page === 'logout') {
              e.preventDefault();
              localStorage.removeItem('tilki_role');
              base44.auth.logout(createPageUrl('Landing'));
            } else if (page === 'lessonRequest') {
              e.preventDefault();
              setShowLessonRequest(true);
            }
          };
          const href = (page === 'logout' || page === 'lessonRequest') ? '#' : createPageUrl(page);
          return (
          <a key={label} href={href} onClick={handleClick}
            style={{
              background: gradient,
              borderRadius: '14px',
              padding: '1rem',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 4px 16px ${shadow}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${shadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${shadow}`; }}
          >
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', right: '15px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', position: 'relative' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.25)' }}>
                <Icon size={18} color='white' />
              </div>
              <ChevronRight size={14} color='rgba(255,255,255,0.7)' />
            </div>

            <h3 style={{ color: 'white', fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.2rem', position: 'relative' }}>{label}</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', lineHeight: '1.3', position: 'relative', marginBottom: stats.length > 0 ? '0.6rem' : '0' }}>{desc}</p>

            {stats.length > 0 && (
              <div style={{ display: 'flex', gap: '0.6rem', position: 'relative', flexWrap: 'wrap' }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', fontWeight: '600', marginBottom: '0.05rem' }}>{s.label}</p>
                    <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: '800' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            </a>
            );
            })}
      </div>
      {showLessonRequest && student && (
        <LessonRequestModal student={student} onClose={() => setShowLessonRequest(false)} />
      )}
    </div>
  );
}