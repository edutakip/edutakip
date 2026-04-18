import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle, AlertCircle, Clock, Eye, Award, Calendar, ChevronRight } from 'lucide-react';

const avatarColors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const STATUS_CONFIG = {
  verildi:         { label: 'Bekliyor',     color: '#4f46e5', bg: '#eef2ff', icon: Clock },
  goruldu:         { label: 'Görüldü',      color: '#b45309', bg: '#fef9c3', icon: Eye },
  tamamlandı:      { label: 'Tamamlandı',   color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  degerlendirildi: { label: 'Değerlendirildi', color: '#7c3aed', bg: '#f5f3ff', icon: Award },
  gecikmiş:        { label: 'Gecikmiş',     color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
};

export default function StudentDetailPanel({ student, homeworks, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  const sHws = homeworks.filter(h => h.studentId === student.id);
  const incomplete = sHws.filter(h => h.status !== 'tamamlandı' && h.status !== 'degerlendirildi');
  const completed = sHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi');
  const late = sHws.filter(h => h.status === 'gecikmiş');
  const rate = sHws.length > 0 ? Math.round((completed.length / sHws.length) * 100) : 0;
  const avatarColor = getAvatarColor(student.name);

  const panel = (
    <>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
      `}</style>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(460px, 95vw)',
        background: 'white', zIndex: 9999,
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '1.75rem 1.5rem 2rem', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${avatarColor}60` }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{getInitials(student.name)}</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>{student.name}</h2>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: '0.2rem 0 0' }}>
                  {sHws.length} ödev • %{rate} tamamlama
                </p>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
              <X size={16} color='white' />
            </button>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginTop: '1.25rem' }}>
            {[
              { label: 'Tamamlandı', value: completed.length, color: '#6ee7b7' },
              { label: 'Gecikmiş', value: late.length, color: '#fca5a5' },
              { label: 'Bekliyor', value: incomplete.length - late.length, color: '#a5b4fc' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Tamamlama Oranı</span>
              <span style={{ fontSize: '0.68rem', color: 'white', fontWeight: 800 }}>{rate}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <div style={{ height: '100%', width: `${rate}%`, background: rate >= 80 ? '#6ee7b7' : rate >= 50 ? '#fbbf24' : '#fca5a5', borderRadius: 999, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>

          {/* Incomplete homeworks */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
              <AlertCircle size={15} color='#ef4444' />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                Tamamlanmayan Ödevler ({incomplete.length})
              </span>
            </div>
            {incomplete.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <CheckCircle size={24} color='#10b981' style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>Tüm ödevler tamamlandı! 🎉</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {incomplete.map(hw => {
                  const cfg = STATUS_CONFIG[hw.status] || STATUS_CONFIG.verildi;
                  const Icon = cfg.icon;
                  const isLate = hw.status === 'gecikmiş';
                  return (
                    <div key={hw.id} style={{
                      background: isLate ? '#fef2f2' : '#f8fafc',
                      borderRadius: 12, padding: '0.85rem 1rem',
                      border: `1.5px solid ${isLate ? '#fecaca' : '#f1f5f9'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Icon size={14} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', margin: '0 0 0.2rem', lineHeight: 1.35 }}>{hw.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '0.15rem 0.5rem', borderRadius: 6 }}>
                              {cfg.label}
                            </span>
                            {hw.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                                <Calendar size={10} />
                                {new Date(hw.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          {hw.description && (
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.35rem 0 0', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {hw.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed homeworks */}
          {completed.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
                <CheckCircle size={15} color='#10b981' />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                  Tamamlanan Ödevler ({completed.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {completed.map(hw => (
                  <div key={hw.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#f0fdf4', borderRadius: 10, padding: '0.65rem 0.85rem', border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={14} color='#10b981' style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.title}</p>
                    </div>
                    {hw.gameResult?.percentage != null && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: hw.gameResult.percentage >= 80 ? '#059669' : hw.gameResult.percentage >= 50 ? '#d97706' : '#ef4444', flexShrink: 0 }}>
                        {hw.gameResult.percentage}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: '2rem' }} />
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(panel, document.body);
}