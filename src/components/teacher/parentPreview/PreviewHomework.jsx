import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle, Eye, Gamepad2, Star, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const STATUS_CFG = {
  verildi:    { label: 'Yapılacak',   bg: '#e0e7ff', color: '#4338ca', icon: Clock },
  goruldu:    { label: 'Görüldü',     bg: '#fef9c3', color: '#854d0e', icon: Eye },
  tamamlandı: { label: 'Tamamlandı',  bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
  gecikmiş:   { label: 'Gecikmiş',    bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
};

export default function PreviewHomework({ homeworks, studentName }) {
  const [filter, setFilter] = useState('all');

  const filtered = homeworks.filter(h => filter === 'all' || h.status === filter);
  const counts = {
    all: homeworks.length,
    verildi: homeworks.filter(h => h.status === 'verildi').length,
    tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length,
    gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length,
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>Ödevler</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{studentName} · {homeworks.length} ödev</p>
      </div>

      {/* Read-only notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f3f4f6', borderRadius: '10px', padding: '0.5rem 0.85rem', marginBottom: '1rem' }}>
        <Lock size={13} color="#9ca3af" />
        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Önizleme modu — ödev tamamlama veya not ekleme devre dışı</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['verildi', 'Yapılacak'], ['tamamlandı', 'Tamamlandı'], ['gecikmiş', 'Gecikmiş']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem',
              fontWeight: 600, cursor: 'pointer',
              border: filter === val ? 'none' : '1.5px solid #e5e7eb',
              background: filter === val ? '#4f46e5' : 'white',
              color: filter === val ? 'white' : '#6b7280',
            }}>
            {label} ({counts[val]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.85rem' }}>Ödev bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map(hw => {
            const cfg = STATUS_CFG[hw.status] || STATUS_CFG.verildi;
            const Icon = cfg.icon;
            let dueDateStr = '';
            try { dueDateStr = hw.dueDate ? format(parseISO(hw.dueDate), 'd MMMM yyyy', { locale: tr }) : ''; } catch {}
            return (
              <div key={hw.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>{hw.title}</span>
                      {hw.questions?.length > 0 && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', padding: '0.15rem 0.45rem', borderRadius: 20, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Gamepad2 size={9} /> İnteraktif
                        </span>
                      )}
                    </div>
                    {!hw.questions?.length && hw.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.description}</div>}
                    {dueDateStr && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>Son Tarih: {dueDateStr}</div>}
                    {hw.gameResult && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <Star size={11} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>
                          {hw.gameResult.score}/{hw.gameResult.total} doğru · %{hw.gameResult.percentage}
                        </span>
                      </div>
                    )}
                    {hw.parentNote && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#6366f1', background: '#fafafe', borderRadius: '6px', padding: '0.3rem 0.5rem' }}>
                        💬 {hw.parentNote}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}