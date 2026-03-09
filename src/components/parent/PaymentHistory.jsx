import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const STATUS_CONFIG = {
  'alındı':    { label: 'Ödendi',   icon: CheckCircle,  color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' },
  'bekliyor':  { label: 'Bekliyor', icon: Clock,        color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)' },
  'gecikmiş':  { label: 'Gecikmiş', icon: AlertCircle,  color: 'var(--danger)',  bg: 'rgba(239,68,68,0.12)'  },
};

const METHOD_LABELS = { nakit: 'Nakit', havale: 'Havale', diğer: 'Diğer' };

export default function PaymentHistory({ payments }) {
  const [filter, setFilter] = useState('tümü');

  const filtered = filter === 'tümü' ? payments : payments.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const tabs = [
    { key: 'tümü',     label: 'Tümü',     count: payments.length },
    { key: 'bekliyor', label: 'Bekleyen', count: payments.filter(p => p.status === 'bekliyor').length },
    { key: 'gecikmiş', label: 'Gecikmiş', count: payments.filter(p => p.status === 'gecikmiş').length },
    { key: 'alındı',   label: 'Ödendi',   count: payments.filter(p => p.status === 'alındı').length },
  ];

  return (
    <div style={{ marginTop: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(79,70,229,0.1)' }}>
          <CreditCard size={18} color='var(--accent)' />
        </div>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', margin: 0 }}>Ödeme Geçmişi</h3>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.15s',
              background: filter === t.key ? 'var(--accent)' : 'var(--bg-hover)',
              color: filter === t.key ? 'white' : 'var(--text-secondary)',
            }}>
            {t.label} {t.count > 0 && <span style={{ opacity: 0.75 }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Bu kategoride ödeme kaydı bulunmuyor.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sorted.map(p => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG['bekliyor'];
            const Icon = cfg.icon;
            let dateStr = p.date;
            try { dateStr = format(parseISO(p.date), 'd MMMM yyyy', { locale: tr }); } catch {}
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border-light)' }}>
                {/* Status icon */}
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={cfg.color} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                    ₺{p.amount?.toLocaleString('tr-TR')}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                    {dateStr}{p.method ? ` · ${METHOD_LABELS[p.method] || p.method}` : ''}{p.description ? ` · ${p.description}` : ''}
                  </div>
                </div>

                {/* Badge */}
                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}