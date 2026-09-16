import React from 'react';
import { X, Trophy, Star, BookOpen, Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ALL_BADGES, getLevel } from './StudentGamification';

export default function StudentDetailDrawer({ row, rank, onClose }) {
  if (!row) return null;

  const { student, points, earnedBadgeIds, attended, missedCount, completedHW, totalHW, avgRating, lvl, badges, pointsAdjustment } = row;
  const lockedBadges = ALL_BADGES.filter(b => !earnedBadgeIds.has(b.id));

  const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const rankEmoji = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  const progressPct = lvl.next ? Math.min(100, Math.round(((points - lvl.prev) / (lvl.next - lvl.prev)) * 100)) : 100;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', borderRadius: '24px 24px 0 0', padding: '1.75rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color='white' />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: getColor(student.name), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{getInitials(student.name)}</span>
              </div>
              <div style={{ position: 'absolute', bottom: -4, right: -4, fontSize: '1.2rem' }}>{rankEmoji(rank)}</div>
            </div>
            <div>
              <h2 style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', margin: 0 }}>{student.name}</h2>
              <div style={{ color: lvl.color, fontWeight: 700, fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: 20, display: 'inline-block', marginTop: '0.3rem' }}>{lvl.label}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{points}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>puan</div>
              {pointsAdjustment ? (
                <div style={{ fontSize: '0.65rem', color: pointsAdjustment > 0 ? '#86efac' : '#fca5a5', fontWeight: 700, marginTop: '0.15rem' }}>
                  {pointsAdjustment > 0 ? '+' : ''}{pointsAdjustment} manuel
                </div>
              ) : null}
            </div>
          </div>

          {/* Progress bar */}
          {lvl.next && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Sonraki seviye: {lvl.next} puan</span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{progressPct}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 999, background: 'linear-gradient(90deg, #a78bfa, #f97316)' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '🏃', val: attended, label: 'Devam' },
              { icon: '❌', val: missedCount, label: 'Devamsızlık' },
              { icon: '⭐', val: avgRating > 0 ? avgRating.toFixed(1) : '-', label: 'Ort. Puan' },
              { icon: '📚', val: `${completedHW}/${totalHW}`, label: 'Ödev' },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: 14, padding: '0.85rem 0.5rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>{val}</div>
                <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Earned Badges */}
          {badges.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Trophy size={15} color='#f59e0b' />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111827' }}>Kazanılan Rozetler</span>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: 20 }}>{badges.length}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: b.bg, border: `1.5px solid ${b.color}33`, borderRadius: 10, padding: '0.35rem 0.65rem' }}>
                    <span style={{ fontSize: '1rem' }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: b.color }}>{b.label}</div>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Target size={15} color='#9ca3af' />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#6b7280' }}>Kazanılacak Rozetler ({lockedBadges.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {lockedBadges.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.35rem 0.65rem', opacity: 0.6 }}>
                    <span style={{ fontSize: '1rem', filter: 'grayscale(1)' }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>{b.label}</div>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}