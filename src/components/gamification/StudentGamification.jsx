import React, { useState } from 'react';
import { Star, Trophy, Flame, BookOpen, CheckCircle, Target, Zap } from 'lucide-react';

// ── Points calculation ────────────────────────────────────────
// "değerlendirildi" statüsü de tamamlanmış sayılır
const COMPLETED_HW_STATUSES = ['tamamlandı', 'değerlendirildi'];

// teacherAssessment puan çarpanı
const ASSESSMENT_BONUS = {
  cok_iyi:        30,
  iyi:            20,
  gelistirilmeli: 10,
  yetersiz:        5,
};

export function calcGamification(reports = [], homeworks = []) {
  let points = 0;
  const earnedBadgeIds = new Set();

  // Points from lesson reports
  const attended = reports.filter(r => r.attendance === 'katıldı').length;
  const lateCount = reports.filter(r => r.attendance === 'geç kaldı').length;
  const missedCount = reports.filter(r => r.attendance === 'katılmadı').length;

  attended && (points += attended * 10);   // +10 per attended lesson
  lateCount && (points += lateCount * 3);  // +3 per late

  // Ratings bonus
  reports.forEach(r => {
    if (r.rating >= 5) points += 15;
    else if (r.rating >= 4) points += 10;
    else if (r.rating >= 3) points += 5;
  });

  // Points from homework — "değerlendirildi" also counts as completed
  const completedHW = homeworks.filter(h => COMPLETED_HW_STATUSES.includes(h.status)).length;
  const totalHW = homeworks.length;

  homeworks.forEach(h => {
    if (!COMPLETED_HW_STATUSES.includes(h.status)) return;
    if (h.status === 'değerlendirildi' && h.teacherAssessment) {
      // Assessment-based points
      points += ASSESSMENT_BONUS[h.teacherAssessment] ?? 15;
    } else {
      points += 20; // default completed
    }
  });

  // ── Badge logic ───────────────────────────────────────────
  const avgRating = reports.length ? reports.reduce((s, r) => s + (r.rating || 0), 0) / reports.length : 0;

  // Attendance
  if (attended >= 3)  earnedBadgeIds.add('devam_baslangic');
  if (attended >= 5)  earnedBadgeIds.add('devam_ustasi');
  if (attended >= 10) earnedBadgeIds.add('devam_guclu');
  if (attended >= 20) earnedBadgeIds.add('devam_efsanesi');

  // No miss
  if (missedCount === 0 && attended >= 3)  earnedBadgeIds.add('hic_kacinmadi');
  if (missedCount === 0 && attended >= 10) earnedBadgeIds.add('tam_devam');

  // Stars
  if (avgRating >= 3 && reports.length >= 2)  earnedBadgeIds.add('yukselis');
  if (avgRating >= 4 && reports.length >= 3)  earnedBadgeIds.add('parlayan_yildiz');
  if (avgRating >= 4.5 && reports.length >= 5) earnedBadgeIds.add('altin_yildiz');
  if (avgRating >= 4.8 && reports.length >= 5) earnedBadgeIds.add('kusursuz');

  // Homework
  if (completedHW >= 1)  earnedBadgeIds.add('ilk_odev');
  if (completedHW >= 5)  earnedBadgeIds.add('odev_sampiyonu');
  if (completedHW >= 10) earnedBadgeIds.add('odev_makinesi');
  if (totalHW > 0 && completedHW === totalHW && totalHW >= 3) earnedBadgeIds.add('mukemmel_ogrenci');

  // Assessment quality badges
  const cokIyiCount = homeworks.filter(h => h.teacherAssessment === 'cok_iyi').length;
  const iyiCount = homeworks.filter(h => h.teacherAssessment === 'iyi').length;
  if (cokIyiCount >= 1) earnedBadgeIds.add('cok_iyi_odev');
  if (cokIyiCount >= 3) earnedBadgeIds.add('odev_yildizi');
  if (iyiCount + cokIyiCount >= 5) earnedBadgeIds.add('kaliteli_calisan');

  // Points milestones
  if (points >= 50)  earnedBadgeIds.add('ilk_50');
  if (points >= 100) earnedBadgeIds.add('100_puan');
  if (points >= 300) earnedBadgeIds.add('300_puan');
  if (points >= 500) earnedBadgeIds.add('super_kahraman');
  if (points >= 750) earnedBadgeIds.add('efsane_750');

  // Combined achievements
  if (attended >= 5 && completedHW >= 5) earnedBadgeIds.add('tam_ogrenci');
  if (avgRating >= 4 && completedHW >= 3 && missedCount === 0) earnedBadgeIds.add('altin_ogrenci');

  return { points, earnedBadgeIds, attended, missedCount, completedHW, totalHW, avgRating };
}

// ── Badge definitions ─────────────────────────────────────────
export const ALL_BADGES = [
  // Devam rozetleri
  { id: 'devam_baslangic',  emoji: '👣', label: 'İlk Adım',          desc: '3 derse katıldı',                  color: '#10b981', bg: '#d1fae5' },
  { id: 'devam_ustasi',     emoji: '🏃', label: 'Devam Ustası',       desc: '5 derse katıldı',                  color: '#059669', bg: '#d1fae5' },
  { id: 'devam_guclu',      emoji: '💪', label: 'Güçlü Devam',        desc: '10 derse katıldı',                 color: '#047857', bg: '#d1fae5' },
  { id: 'devam_efsanesi',   emoji: '🔥', label: 'Devam Efsanesi',     desc: '20 derse katıldı',                 color: '#f97316', bg: '#ffedd5' },
  { id: 'hic_kacinmadi',    emoji: '✨', label: 'Hiç Kaçırmadı',      desc: 'Hiç devamsızlık yok (3+ ders)',    color: '#6366f1', bg: '#eef2ff' },
  { id: 'tam_devam',        emoji: '🎯', label: 'Tam Devam',          desc: 'Hiç devamsızlık yok (10+ ders)',   color: '#4f46e5', bg: '#eef2ff' },
  // Performans rozetleri
  { id: 'yukselis',         emoji: '📈', label: 'Yükseliş',           desc: 'Ort. 3+ yıldız (2+ ders)',         color: '#3b82f6', bg: '#dbeafe' },
  { id: 'parlayan_yildiz',  emoji: '⭐', label: 'Parlayan Yıldız',    desc: 'Ort. 4+ yıldız (3+ ders)',         color: '#f59e0b', bg: '#fef9c3' },
  { id: 'altin_yildiz',     emoji: '🌟', label: 'Altın Yıldız',       desc: 'Ort. 4.5+ yıldız (5+ ders)',      color: '#d97706', bg: '#fef3c7' },
  { id: 'kusursuz',         emoji: '💎', label: 'Kusursuz',            desc: 'Ort. 4.8+ yıldız (5+ ders)',      color: '#7c3aed', bg: '#f5f3ff' },
  // Ödev rozetleri
  { id: 'ilk_odev',         emoji: '✅', label: 'İlk Ödev',           desc: 'İlk ödevini tamamladı',            color: '#10b981', bg: '#d1fae5' },
  { id: 'odev_sampiyonu',   emoji: '📚', label: 'Ödev Şampiyonu',     desc: '5 ödev tamamladı',                 color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'odev_makinesi',    emoji: '🤖', label: 'Ödev Makinesi',      desc: '10 ödev tamamladı',                color: '#6d28d9', bg: '#ede9fe' },
  { id: 'mukemmel_ogrenci', emoji: '🎓', label: 'Mükemmel Öğrenci',   desc: 'Tüm ödevleri tamamladı (3+)',      color: '#4f46e5', bg: '#eef2ff' },
  // Değerlendirme rozetleri
  { id: 'cok_iyi_odev',     emoji: '🥇', label: 'Çok İyi Ödev',       desc: '1 ödev "Çok İyi" değerlendi',      color: '#f59e0b', bg: '#fef3c7' },
  { id: 'odev_yildizi',     emoji: '🌠', label: 'Ödev Yıldızı',       desc: '3 ödev "Çok İyi" değerlendi',      color: '#d97706', bg: '#fef9c3' },
  { id: 'kaliteli_calisan', emoji: '🏆', label: 'Kaliteli Çalışan',   desc: '5+ ödev "İyi/Çok İyi" değerlendi', color: '#b45309', bg: '#fef3c7' },
  // Kombinasyon rozetleri
  { id: 'tam_ogrenci',      emoji: '🌈', label: 'Tam Öğrenci',        desc: '5+ ders & 5+ ödev tamamlandı',     color: '#ec4899', bg: '#fce7f3' },
  { id: 'altin_ogrenci',    emoji: '👑', label: 'Altın Öğrenci',      desc: 'Devam + performans + ödev mükemmel',color: '#f59e0b', bg: '#fef3c7' },
  // Puan rozetleri
  { id: 'ilk_50',           emoji: '🌱', label: '50 Puan!',            desc: '50 puana ulaştı',                  color: '#10b981', bg: '#d1fae5' },
  { id: '100_puan',         emoji: '💯', label: '100 Puan!',           desc: '100 puana ulaştı',                 color: '#ec4899', bg: '#fce7f3' },
  { id: '300_puan',         emoji: '🏅', label: '300 Puan!',           desc: '300 puana ulaştı',                 color: '#f59e0b', bg: '#fef3c7' },
  { id: 'super_kahraman',   emoji: '🦸', label: 'Süper Kahraman',      desc: '500 puana ulaştı',                 color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'efsane_750',       emoji: '🚀', label: 'Efsane!',             desc: '750 puana ulaştı',                 color: '#4f46e5', bg: '#eef2ff' },
];

// ── Level from points ─────────────────────────────────────────
export function getLevel(points) {
  if (points >= 750) return { level: 6, label: 'Efsane 🚀',    color: '#4f46e5', next: null,  prev: 500 };
  if (points >= 500) return { level: 5, label: 'Süper Kahraman 🦸', color: '#7c3aed', next: 750, prev: 300 };
  if (points >= 300) return { level: 4, label: 'Uzman 🏅',     color: '#f59e0b', next: 500,  prev: 150 };
  if (points >= 150) return { level: 3, label: 'İleri 🌟',     color: '#6366f1', next: 300,  prev: 60  };
  if (points >= 60)  return { level: 2, label: 'Gelişiyor ⭐',  color: '#10b981', next: 150,  prev: 0   };
  return                    { level: 1, label: 'Yeni Başlayan 🌱', color: '#9ca3af', next: 60, prev: 0 };
}

// ── Main component ────────────────────────────────────────────
export default function StudentGamification({ reports = [], homeworks = [], studentName = '' }) {
  const [showAll, setShowAll] = useState(false);
  const { points, earnedBadgeIds, attended, missedCount, completedHW, totalHW, avgRating } = calcGamification(reports, homeworks);
  const lvl = getLevel(points);
  const earnedBadges = ALL_BADGES.filter(b => earnedBadgeIds.has(b.id));
  const lockedBadges = ALL_BADGES.filter(b => !earnedBadgeIds.has(b.id));
  const progressPct = lvl.next ? Math.min(100, Math.round(((points - lvl.prev) / (lvl.next - lvl.prev)) * 100)) : 100;

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