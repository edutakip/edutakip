import React, { useState } from 'react';
import { Star, Trophy, Flame, BookOpen, CheckCircle, Target, Zap } from 'lucide-react';

// ── Points calculation ────────────────────────────────────────
export function calcGamification(reports = [], homeworks = []) {
  let points = 0;
  const earnedBadgeIds = new Set();

  // Points from lesson reports
  const attended = reports.filter(r => r.attendance === 'katıldı').length;
  const lateCount = reports.filter(r => r.attendance === 'geç kaldı').length;
  const missedCount = reports.filter(r => r.attendance === 'katılmadı').length;

  attended && (points += attended * 10);        // +10 per attended lesson
  lateCount && (points += lateCount * 3);        // +3 per late (still came)
  // Ratings bonus
  reports.forEach(r => {
    if (r.rating >= 5) points += 15;
    else if (r.rating >= 4) points += 10;
    else if (r.rating >= 3) points += 5;
  });

  // Points from homework
  const completedHW = homeworks.filter(h => h.status === 'tamamlandı').length;
  const totalHW = homeworks.length;
  completedHW && (points += completedHW * 20);   // +20 per completed homework

  // ── Badge logic ───────────────────────────────────────────
  // Attendance streak: attended 5+ lessons
  if (attended >= 5) earnedBadgeIds.add('devam_ustasi');
  if (attended >= 20) earnedBadgeIds.add('devam_efsanesi');

  // All stars: avg rating >= 4
  const avgRating = reports.length ? reports.reduce((s, r) => s + (r.rating || 0), 0) / reports.length : 0;
  if (avgRating >= 4 && reports.length >= 3) earnedBadgeIds.add('parlayan_yildiz');
  if (avgRating >= 4.5 && reports.length >= 5) earnedBadgeIds.add('altin_yildiz');

  // Homework champion
  if (completedHW >= 5) earnedBadgeIds.add('odev_sampiyonu');
  if (totalHW > 0 && completedHW === totalHW && totalHW >= 3) earnedBadgeIds.add('mukemmel_ogrenci');

  // No miss
  if (missedCount === 0 && attended >= 5) earnedBadgeIds.add('hic_kacinmadi');

  // Points milestones
  if (points >= 100) earnedBadgeIds.add('100_puan');
  if (points >= 300) earnedBadgeIds.add('300_puan');
  if (points >= 500) earnedBadgeIds.add('super_kahraman');

  return { points, earnedBadgeIds, attended, missedCount, completedHW, totalHW, avgRating };
}

// ── Badge definitions ─────────────────────────────────────────
export const ALL_BADGES = [
  { id: 'devam_ustasi',     emoji: '🏃', label: 'Devam Ustası',      desc: '5 derse katıldı',         color: '#10b981', bg: '#d1fae5' },
  { id: 'devam_efsanesi',   emoji: '🔥', label: 'Devam Efsanesi',    desc: '20 derse katıldı',        color: '#f97316', bg: '#ffedd5' },
  { id: 'hic_kacinmadi',    emoji: '✨', label: 'Hiç Kaçırmadı',     desc: 'Devamsızlık sıfır',       color: '#6366f1', bg: '#eef2ff' },
  { id: 'parlayan_yildiz',  emoji: '⭐', label: 'Parlayan Yıldız',   desc: 'Ort. 4+ yıldız (3+ ders)',color: '#f59e0b', bg: '#fef9c3' },
  { id: 'altin_yildiz',     emoji: '🌟', label: 'Altın Yıldız',      desc: 'Ort. 4.5+ yıldız (5+ ders)', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'odev_sampiyonu',   emoji: '📚', label: 'Ödev Şampiyonu',    desc: '5 ödev tamamladı',        color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'mukemmel_ogrenci', emoji: '🎓', label: 'Mükemmel Öğrenci',  desc: 'Tüm ödevleri tamamladı',  color: '#4f46e5', bg: '#eef2ff' },
  { id: '100_puan',         emoji: '💯', label: '100 Puan!',         desc: '100 puana ulaştı',        color: '#ec4899', bg: '#fce7f3' },
  { id: '300_puan',         emoji: '🏅', label: '300 Puan!',         desc: '300 puana ulaştı',        color: '#f59e0b', bg: '#fef3c7' },
  { id: 'super_kahraman',   emoji: '🦸', label: 'Süper Kahraman',    desc: '500 puana ulaştı',        color: '#7c3aed', bg: '#f5f3ff' },
];

// ── Level from points ─────────────────────────────────────────
export function getLevel(points) {
  if (points >= 500) return { level: 5, label: 'Efsane 🦸',   color: '#7c3aed', next: null };
  if (points >= 300) return { level: 4, label: 'Uzman 🏅',    color: '#f59e0b', next: 500 };
  if (points >= 150) return { level: 3, label: 'İleri 🌟',    color: '#6366f1', next: 300 };
  if (points >= 60)  return { level: 2, label: 'Gelişiyor ⭐', color: '#10b981', next: 150 };
  return             { level: 1, label: 'Yeni Başlayan 🌱',   color: '#9ca3af', next: 60 };
}

// ── Main component ────────────────────────────────────────────
export default function StudentGamification({ reports = [], homeworks = [], studentName = '' }) {
  const [showAll, setShowAll] = useState(false);
  const { points, earnedBadgeIds, attended, missedCount, completedHW, totalHW, avgRating } = calcGamification(reports, homeworks);
  const lvl = getLevel(points);
  const earnedBadges = ALL_BADGES.filter(b => earnedBadgeIds.has(b.id));
  const lockedBadges = ALL_BADGES.filter(b => !earnedBadgeIds.has(b.id));
  const progressPct = lvl.next ? Math.min(100, Math.round(((points - (lvl.next === 500 ? 300 : lvl.next === 300 ? 150 : lvl.next === 150 ? 60 : 0)) / (lvl.next - (lvl.next === 500 ? 300 : lvl.next === 300 ? 150 : lvl.next === 150 ? 60 : 0))) * 100)) : 100;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Points card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
        borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekor */}
        <div style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 30, bottom: -40, width: 90, height: 90, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
              {studentName ? `${studentName} ·` : ''} Toplam Puan
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{points}</span>
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>puan</span>
            </div>
            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: lvl.color, background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.7rem', borderRadius: 20 }}>{lvl.label}</span>
            </div>
          </div>

          {/* Stats quick */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { icon: '🏃', val: attended, label: 'Devam' },
              { icon: '⭐', val: avgRating > 0 ? avgRating.toFixed(1) : '-', label: 'Ort. Puan' },
              { icon: '📚', val: `${completedHW}/${totalHW}`, label: 'Ödev' },
              { icon: '🏅', val: earnedBadges.length, label: 'Rozet' },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>{icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{val}</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {lvl.next && (
          <div style={{ position: 'relative', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Sonraki seviye: {lvl.next} puan</span>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{progressPct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 999, background: 'linear-gradient(90deg, #a78bfa, #f97316)', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Earned badges ── */}
      {earnedBadges.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Trophy size={16} color='#f59e0b' />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0 }}>Kazanılan Rozetler</h3>
            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 20 }}>{earnedBadges.length}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {earnedBadges.map(b => (
              <div key={b.id} title={b.desc} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: b.bg, border: `1.5px solid ${b.color}33`, borderRadius: 12, padding: '0.4rem 0.75rem', cursor: 'default' }}>
                <span style={{ fontSize: '1.1rem' }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: b.color }}>{b.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Locked badges ── */}
      {lockedBadges.length > 0 && (
        <div style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <button onClick={() => setShowAll(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showAll ? '0.85rem' : 0 }}>
            <Target size={15} color='#9ca3af' />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b7280' }}>Kilitli Rozetler ({lockedBadges.length})</span>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{showAll ? '▲' : '▼'}</span>
          </button>
          {showAll && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {lockedBadges.map(b => (
                <div key={b.id} title={b.desc} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.4rem 0.75rem', opacity: 0.55 }}>
                  <span style={{ fontSize: '1rem', filter: 'grayscale(1)' }}>{b.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>{b.label}</div>
                    <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}