import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, BookOpen, CreditCard, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function PreviewLessonsPayments({ lessons, payments }) {
  const [tab, setTab] = useState('dersler');
  const [lessonFilter, setLessonFilter] = useState('tümü');

  const totalPaid = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const bakiye = totalPaid - totalDebt;
  const completedLessons = lessons.filter(l => l.status === 'tamamlandı').length;
  const filteredLessons = lessonFilter === 'tümü' ? lessons : lessons.filter(l => l.status === lessonFilter);

  return (
    <div>
      {/* Hero stats */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', position: 'relative' }}>
          {[
            { label: 'Toplam Ders', value: lessons.length, emoji: '📚' },
            { label: 'Tamamlanan', value: completedLessons, emoji: '✅' },
            { label: 'Bakiye', value: `${bakiye < 0 ? '-' : ''}₺${Math.abs(bakiye).toLocaleString('tr-TR')}`, emoji: bakiye < 0 ? '💳' : '✅' },
          ].map(({ label, value, emoji }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{emoji}</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '1rem' }}>
        {[
          { key: 'dersler', label: '📖 Dersler', count: lessons.length },
          { key: 'ödemeler', label: '💳 Ödemeler', count: payments.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '0.55rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s', background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#4f46e5' : '#6b7280', boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            {t.label} <span style={{ opacity: 0.6, fontSize: '0.72rem' }}>({t.count})</span>
          </button>
        ))}
      </div>

      {tab === 'dersler' && (
        <>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            {[['tümü', 'Tümü'], ['planlandı', 'Planlandı'], ['tamamlandı', 'Tamamlandı'], ['iptal', 'İptal']].map(([key, label]) => (
              <button key={key} onClick={() => setLessonFilter(key)}
                style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1.5px solid', borderColor: lessonFilter === key ? '#4f46e5' : '#e5e7eb', background: lessonFilter === key ? '#eef2ff' : 'transparent', color: lessonFilter === key ? '#4f46e5' : '#6b7280', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
          {filteredLessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <BookOpen size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>Ders kaydı bulunamadı.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {filteredLessons.map(l => {
                const cfg = STATUS[l.status] || STATUS['planlandı'];
                const Icon = cfg.icon;
                let dateStr = l.date;
                try { dateStr = format(parseISO(l.date), 'd MMM yyyy, EEEE', { locale: tr }); } catch {}
                return (
                  <div key={l.id} style={{ borderRadius: '12px', border: '1.5px solid #f3f4f6', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white' }}>
                    <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: cfg.dot, flexShrink: 0 }} />
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.subject || 'Ders'}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.1rem' }}>
                        {dateStr}{l.startTime ? ` · ${l.startTime.slice(0,5)}` : ''}{l.duration ? ` · ${l.duration} dk` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.66rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'ödemeler' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', padding: '0.85rem' }}>
              <div style={{ color: '#065f46', fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.2rem' }}>TOPLAM ÖDENDİ</div>
              <div style={{ color: '#064e3b', fontSize: '1.25rem', fontWeight: 900 }}>₺{totalPaid.toLocaleString('tr-TR')}</div>
            </div>
            <div style={{ background: bakiye < 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', padding: '0.85rem' }}>
              <div style={{ color: bakiye < 0 ? '#92400e' : '#065f46', fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.2rem' }}>BAKİYE</div>
              <div style={{ color: bakiye < 0 ? '#78350f' : '#064e3b', fontSize: '1.25rem', fontWeight: 900 }}>{bakiye < 0 ? '-' : ''}₺{Math.abs(bakiye).toLocaleString('tr-TR')}</div>
            </div>
          </div>
          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <CreditCard size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>Ödeme kaydı bulunamadı.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {payments.map(p => {
                const cfg = PAY_STATUS[p.status] || PAY_STATUS['bekliyor'];
                const Icon = cfg.icon;
                let dateStr = p.date;
                try { dateStr = format(parseISO(p.date), 'd MMM yyyy', { locale: tr }); } catch {}
                return (
                  <div key={p.id} style={{ borderRadius: '12px', border: '1.5px solid #f3f4f6', padding: '0.8rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem' }}>₺{p.amount?.toLocaleString('tr-TR')}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.1rem' }}>
                        {dateStr}{p.description ? ` · ${p.description}` : ''}
                      </div>
                    </div>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.66rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}