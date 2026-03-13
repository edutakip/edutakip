import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, Clock, XCircle, BookOpen, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS = {
  'planlandı':  { label: 'Planlandı',  color: '#4338ca', bg: '#e0e7ff', dot: '#6366f1', icon: Clock },
  'tamamlandı': { label: 'Tamamlandı', color: '#065f46', bg: '#d1fae5', dot: '#10b981', icon: CheckCircle },
  'iptal':      { label: 'İptal',      color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444', icon: XCircle },
};

const PAY_STATUS = {
  'alındı':   { label: 'Ödendi',   color: '#065f46', bg: '#d1fae5', icon: CheckCircle },
  'bekliyor': { label: 'Bekliyor', color: '#92400e', bg: '#fef3c7', icon: Clock },
  'gecikmiş': { label: 'Gecikmiş', color: '#b91c1c', bg: '#fee2e2', icon: AlertCircle },
};

export default function ParentLessonsPayments() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('dersler');
  const [lessonFilter, setLessonFilter] = useState('tümü');

  useEffect(() => {
    base44.auth.me().then(async u => {
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) {
        const s = all[0];
        setStudent(s);
        const [l, p] = await Promise.all([
          base44.entities.Lesson.filter({ studentId: s.id }),
          base44.entities.Payment.filter({ studentId: s.id }),
        ]);
        setLessons(l.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setPayments(p.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    });
  }, []);

  const totalPaid = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status !== 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const completedLessons = lessons.filter(l => l.status === 'tamamlandı').length;

  const filteredLessons = lessonFilter === 'tümü' ? lessons : lessons.filter(l => l.status === lessonFilter);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '1.5rem 1.25rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative' }}>
          <Link to={createPageUrl('ParentDashboard')} style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.4rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white' }}>Dersler & Ödemeler</h1>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', position: 'relative' }}>
          {[
            { label: 'Toplam Ders', value: lessons.length, emoji: '📚' },
            { label: 'Tamamlanan', value: completedLessons, emoji: '✅' },
            { label: 'Ödenen', value: `₺${totalPaid.toLocaleString('tr-TR')}`, emoji: '💰' },
          ].map(({ label, value, emoji }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '0.85rem 0.75rem', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{emoji}</div>
              <div style={{ color: 'white', fontWeight: '900', fontSize: '1.15rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: '600', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content card pulled up */}
      <div style={{ margin: '-1.5rem 1rem 0', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(79,70,229,0.12)', padding: '1.25rem', minHeight: '60vh' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '1.25rem' }}>
          {[
            { key: 'dersler', label: '📖 Dersler', count: lessons.length },
            { key: 'ödemeler', label: '💳 Ödemeler', count: payments.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', transition: 'all 0.15s', background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#4f46e5' : '#6b7280', boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {t.label} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({t.count})</span>
            </button>
          ))}
        </div>

        {tab === 'dersler' && (
          <>
            {/* Lesson filters */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[
                { key: 'tümü', label: 'Tümü' },
                { key: 'planlandı', label: 'Planlandı' },
                { key: 'tamamlandı', label: 'Tamamlandı' },
                { key: 'iptal', label: 'İptal' },
              ].map(f => (
                <button key={f.key} onClick={() => setLessonFilter(f.key)}
                  style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1.5px solid', borderColor: lessonFilter === f.key ? '#4f46e5' : '#e5e7eb', background: lessonFilter === f.key ? '#eef2ff' : 'transparent', color: lessonFilter === f.key ? '#4f46e5' : '#6b7280', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredLessons.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.875rem' }}>Ders kaydı bulunamadı.</p>
                </div>
              )}
              {filteredLessons.map(l => {
                const cfg = STATUS[l.status] || STATUS['planlandı'];
                const Icon = cfg.icon;
                let dateStr = l.date;
                try { dateStr = format(parseISO(l.date), 'd MMM yyyy, EEEE', { locale: tr }); } catch {}
                return (
                  <div key={l.id} style={{ borderRadius: '14px', border: '1.5px solid #f3f4f6', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#fafafa', transition: 'box-shadow 0.15s' }}>
                    {/* Color strip */}
                    <div style={{ width: '4px', height: '44px', borderRadius: '4px', background: cfg.dot, flexShrink: 0 }} />
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.subject || 'Ders'}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                        {dateStr}{l.startTime ? ` · ${l.startTime.slice(0,5)}` : ''}
                        {l.duration ? ` · ${l.duration} dk` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'ödemeler' && (
          <>
            {/* Payment summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ color: '#065f46', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>TOPLAM ÖDENDİ</div>
                <div style={{ color: '#064e3b', fontSize: '1.35rem', fontWeight: '900' }}>₺{totalPaid.toLocaleString('tr-TR')}</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ color: '#92400e', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>BEKLEYEN</div>
                <div style={{ color: '#78350f', fontSize: '1.35rem', fontWeight: '900' }}>₺{totalPending.toLocaleString('tr-TR')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {payments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                  <CreditCard size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.875rem' }}>Ödeme kaydı bulunamadı.</p>
                </div>
              )}
              {payments.map(p => {
                const cfg = PAY_STATUS[p.status] || PAY_STATUS['bekliyor'];
                const Icon = cfg.icon;
                let dateStr = p.date;
                try { dateStr = format(parseISO(p.date), 'd MMM yyyy', { locale: tr }); } catch {}
                return (
                  <div key={p.id} style={{ borderRadius: '14px', border: '1.5px solid #f3f4f6', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#fafafa' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '800', color: '#111827', fontSize: '1rem' }}>₺{p.amount?.toLocaleString('tr-TR')}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.1rem' }}>
                        {dateStr}{p.description ? ` · ${p.description}` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}