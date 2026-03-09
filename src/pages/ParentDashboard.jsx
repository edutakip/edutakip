import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle, DollarSign, AlertCircle, BookOpen, BarChart2, Settings, RefreshCw, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ParentDashboard() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

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

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '800' }}>Merhaba 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {student.name} için ders takip paneli
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Toplam Ders', value: lessons.length, icon: Calendar, color: 'var(--info)' },
          { label: 'Tamamlanan', value: lessons.filter(l => l.status === 'tamamlandı').length, icon: CheckCircle, color: 'var(--success)' },
          { label: 'Toplam Ödeme', value: `₺${totalPaid.toLocaleString('tr-TR')}`, icon: DollarSign, color: 'var(--accent)' },
          { label: 'Bekleyen Ödeme', value: `₺${pendingAmount.toLocaleString('tr-TR')}`, icon: AlertCircle, color: 'var(--warning)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{label}</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800' }}>{value}</p>
              </div>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: color + '20' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming lessons */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' }}>Yaklaşan Dersler</h3>
          {upcomingLessons.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Planlanmış ders yok</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: lesson.type === 'online' ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {lesson.type === 'online' ? <Video size={18} color='var(--info)' /> : <MapPin size={18} color='var(--accent)' />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                      {lesson.subject || 'Özel Ders'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {lesson.date && format(parseISO(lesson.date), 'd MMMM yyyy', { locale: tr })} · {lesson.startTime}–{lesson.endTime}
                    </div>
                  </div>
                  {lesson.meetingLink && (
                    <a href={lesson.meetingLink} target='_blank' rel='noreferrer'
                      style={{ background: 'var(--info)', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}>
                      Katıl
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Summary */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' }}>Ödeme Özeti</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Ödenen', value: totalPaid, color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' },
              { label: 'Bekleyen', value: pendingAmount, color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)' },
              { label: 'Geç Kalan', value: payments.filter(p => p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0), color: 'var(--danger)', bg: 'rgba(239,68,68,0.12)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', borderRadius: '10px', background: bg }}>
                <span style={{ color, fontSize: '0.82rem', fontWeight: '600' }}>{label}</span>
                <span style={{ color, fontSize: '1rem', fontWeight: '800' }}>₺{value.toLocaleString('tr-TR')}</span>
              </div>
            ))}
            {payments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.5rem' }}>Ödeme kaydı yok</p>}
          </div>
        </div>
      </div>

      {/* Full Payment History */}
      <PaymentHistory payments={payments} />


    </div>
  );
}