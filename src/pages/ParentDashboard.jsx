import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle, DollarSign, AlertCircle, BookOpen, BarChart2, Settings, RefreshCw, ChevronRight, LogOut } from 'lucide-react';
import { createPageUrl } from '@/utils';
import LessonRequestModal from '../components/parent/LessonRequestModal';

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
        <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', width: '100%', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Öğrenciye Bağlan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Öğretmeninizin size verdiği davet kodunu girerek çocuğunuzun derslerini takip edebilirsiniz.
          </p>
          <input
            value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
            placeholder='Davet kodunu girin (örn: ABC123)'
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center', letterSpacing: '3px', fontWeight: '700', outline: 'none', marginBottom: '0.75rem' }}
            onKeyDown={e => e.key === 'Enter' && handleJoinWithCode()}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button onClick={handleJoinWithCode} disabled={loading || !inviteCode.trim()}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Bağlanıyor...' : 'Hesabıma Bağla'}
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
      <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>Genel Özet</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {[
            { label: 'Toplam Ders', value: lessons.length, icon: Calendar, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', emoji: '📚' },
            { label: 'Tamamlanan', value: lessons.filter(l => l.status === 'tamamlandı').length, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)', emoji: '✅' },
            { label: 'Toplam Ödenen', value: `₺${totalPaid.toLocaleString('tr-TR')}`, icon: DollarSign, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', emoji: '💰' },
            { label: 'Bekleyen Ödeme', value: `₺${pendingAmount.toLocaleString('tr-TR')}`, icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '⏳' },
          ].map(({ label, value, color, bg, emoji }, i, arr) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              borderRadius: i === 0 ? '10px 0 0 10px' : i === arr.length - 1 ? '0 10px 10px 0' : '0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                  {emoji}
                </div>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '900', lineHeight: 1 }}>{value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '600' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      <h2 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem' }}>Menü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
        {menuItems.map(({ label, desc, icon: Icon, gradient, shadow, page, stats }) => {
          const handleClick = (e) => {
            if (page === 'logout') {
              e.preventDefault();
              localStorage.removeItem('tilki_role');
              base44.auth.logout(createPageUrl('Landing'));
            }
          };
          return (
          <a key={label} href={page === 'logout' ? '#' : createPageUrl(page)} onClick={handleClick}
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
            {/* Decorative circle */}
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
            </div>
            );
            }