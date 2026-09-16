import React, { useState } from 'react';
import { Star, Trophy, Flame, BookOpen, CheckCircle, Target, Zap } from 'lucide-react';

// ── Points calculation ────────────────────────────────────────
const COMPLETED_HW_STATUSES = ['tamamlandı', 'goruldu'];

const ASSESSMENT_BONUS = {
  cok_iyi:        30,
  iyi:            20,
  gelistirilmeli: 10,
  yetersiz:        5,
};

// Tarih sıralı raporlardan üst üste 5 yıldız serisi
function calcConsecutive5Stars(reports) {
  if (!reports || reports.length === 0) return 0;
  const sorted = [...reports].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  let max = 0, cur = 0;
  for (const r of sorted) {
    if (r.rating >= 5) { cur++; max = Math.max(max, cur); }
    else cur = 0;
  }
  return max;
}

export function calcGamification(reports = [], homeworks = [], pointsAdjustment = 0) {
  let points = 0;
  const earnedBadgeIds = new Set();

  const attended = reports.filter(r => r.attendance === 'katıldı').length;
  const lateCount = reports.filter(r => r.attendance === 'geç kaldı').length;
  const missedCount = reports.filter(r => r.attendance === 'katılmadı').length;
  const totalReports = reports.length;

  attended && (points += attended * 10);
  lateCount && (points += lateCount * 3);

  // Ratings bonus
  reports.forEach(r => {
    if (r.rating >= 5) points += 15;
    else if (r.rating >= 4) points += 10;
    else if (r.rating >= 3) points += 5;
  });

  const isHWCompleted = (h) => COMPLETED_HW_STATUSES.includes(h.status) || !!h.teacherAssessment;
  const completedHW = homeworks.filter(isHWCompleted).length;
  const totalHW = homeworks.length;
  const lateHW = homeworks.filter(h => h.status === 'gecikmiş').length;
  const onTimeHW = completedHW - lateHW;

  homeworks.forEach(h => {
    if (!isHWCompleted(h)) return;
    if (h.teacherAssessment) {
      points += ASSESSMENT_BONUS[h.teacherAssessment] ?? 15;
    } else {
      points += 20;
    }
  });

  // Manual adjustment
  points += pointsAdjustment || 0;

  // ── Badge logic ───────────────────────────────────────────
  const avgRating = reports.length ? reports.reduce((s, r) => s + (r.rating || 0), 0) / reports.length : 0;
  const total5Stars = reports.filter(r => r.rating >= 5).length;
  const consecutive5 = calcConsecutive5Stars(reports);
  const cokIyiCount = homeworks.filter(h => h.teacherAssessment === 'cok_iyi').length;
  const iyiCount = homeworks.filter(h => h.teacherAssessment === 'iyi').length;
  const yetersizCount = homeworks.filter(h => h.teacherAssessment === 'yetersiz').length;

  // ───── Attendance badges ─────
  if (attended >= 1)  earnedBadgeIds.add('ilk_ders');
  if (attended >= 3)  earnedBadgeIds.add('devam_baslangic');
  if (attended >= 5)  earnedBadgeIds.add('devam_ustasi');
  if (attended >= 10) earnedBadgeIds.add('devam_guclu');
  if (attended >= 15) earnedBadgeIds.add('surekli_gelme');
  if (attended >= 20) earnedBadgeIds.add('devam_efsanesi');
  if (attended >= 25) earnedBadgeIds.add('devam_krali');
  if (attended >= 30) earnedBadgeIds.add('30_ders');
  if (attended >= 50) earnedBadgeIds.add('50_ders');
  if (attended >= 100) earnedBadgeIds.add('100_ders');

  // No miss
  if (missedCount === 0 && attended >= 3)  earnedBadgeIds.add('hic_kacinmadi');
  if (missedCount === 0 && attended >= 10) earnedBadgeIds.add('tam_devam');
  if (lateCount === 0 && attended >= 10)   earnedBadgeIds.add('hic_gec_kalmadi');
  if (lateCount === 0 && attended >= 5)    earnedBadgeIds.add('zamaninda');

  // ───── Performance badges ─────
  if (total5Stars >= 1) earnedBadgeIds.add('ilk_5_yildiz');
  if (consecutive5 >= 3) earnedBadgeIds.add('3_ustuste_5');
  if (consecutive5 >= 5) earnedBadgeIds.add('5_ustuste_5');
  if (consecutive5 >= 10) earnedBadgeIds.add('10_ustuste_5');
  if (total5Stars >= 20) earnedBadgeIds.add('yildiz_yagmuru');
  if (avgRating >= 5 && reports.length >= 10) earnedBadgeIds.add('ortalama_5');
  if (avgRating >= 3 && reports.length >= 2)  earnedBadgeIds.add('yukselis');
  if (avgRating >= 3.5 && reports.length >= 5) earnedBadgeIds.add('yukselen_yildiz');
  if (avgRating >= 4 && reports.length >= 3)  earnedBadgeIds.add('parlayan_yildiz');
  if (avgRating >= 4 && reports.length >= 10) earnedBadgeIds.add('surekli_iyi');
  if (avgRating >= 4.5 && reports.length >= 5) earnedBadgeIds.add('altin_yildiz');
  if (avgRating >= 4.8 && reports.length >= 5) earnedBadgeIds.add('kusursuz');
  if (total5Stars >= 50) earnedBadgeIds.add('cok_yildiz');
  if (avgRating >= 3 && reports.length >= 1) earnedBadgeIds.add('ilk_yildiz');

  // ───── Homework badges ─────
  if (completedHW >= 1)  earnedBadgeIds.add('ilk_odev');
  if (completedHW >= 1 && lateHW === 0) earnedBadgeIds.add('ilk_zamaninda');
  if (completedHW >= 5)  earnedBadgeIds.add('odev_sampiyonu');
  if (completedHW >= 10) earnedBadgeIds.add('odev_makinesi');
  if (completedHW >= 20) earnedBadgeIds.add('20_odev');
  if (completedHW >= 25) earnedBadgeIds.add('odev_kahramani');
  if (completedHW >= 30) earnedBadgeIds.add('30_odev');
  if (completedHW >= 50) earnedBadgeIds.add('50_odev');
  if (totalHW > 0 && completedHW === totalHW && totalHW >= 3) earnedBadgeIds.add('mukemmel_ogrenci');
  if (onTimeHW >= 10) earnedBadgeIds.add('zamaninda_krali');
  if (lateHW === 0 && completedHW >= 10) earnedBadgeIds.add('hic_gecikme');

  // ───── Assessment quality badges ─────
  if (cokIyiCount >= 1)  earnedBadgeIds.add('cok_iyi_odev');
  if (cokIyiCount >= 1)  earnedBadgeIds.add('ilk_cok_iyi');
  if (cokIyiCount >= 3)  earnedBadgeIds.add('odev_yildizi');
  if (cokIyiCount >= 5)  earnedBadgeIds.add('surekli_cok_iyi');
  if (cokIyiCount >= 10) earnedBadgeIds.add('10_cok_iyi');
  if (cokIyiCount >= 15) earnedBadgeIds.add('kalite_krali');
  if (cokIyiCount >= 20) earnedBadgeIds.add('20_cok_iyi');
  if (iyiCount >= 10)    earnedBadgeIds.add('iyi_ogrenci');
  if (iyiCount + cokIyiCount >= 5) earnedBadgeIds.add('kaliteli_calisan');
  if (yetersizCount === 0 && completedHW >= 10) earnedBadgeIds.add('hic_yetersiz');
  if (cokIyiCount >= 20 && yetersizCount === 0) earnedBadgeIds.add('mukemmel_kalite');

  // ───── Points milestones ─────
  if (points >= 50)  earnedBadgeIds.add('ilk_50');
  if (points >= 100) earnedBadgeIds.add('100_puan');
  if (points >= 300) earnedBadgeIds.add('300_puan');
  if (points >= 500) earnedBadgeIds.add('super_kahraman');
  if (points >= 750) earnedBadgeIds.add('efsane_750');
  if (points >= 1000) earnedBadgeIds.add('1000_puan');
  if (points >= 1500) earnedBadgeIds.add('1500_puan');
  if (points >= 2000) earnedBadgeIds.add('2000_puan');
  if (points >= 3000) earnedBadgeIds.add('3000_puan');
  if (points >= 5000) earnedBadgeIds.add('5000_puan');

  // ───── Combination badges ─────
  if (attended >= 5 && completedHW >= 5)  earnedBadgeIds.add('tam_ogrenci');
  if (attended >= 10 && completedHW >= 10) earnedBadgeIds.add('ders_ve_odev_10');
  if (attended >= 20 && completedHW >= 20) earnedBadgeIds.add('ders_ve_odev_20');
  if (avgRating >= 4 && attended >= 10)    earnedBadgeIds.add('yildiz_ve_devam');
  if (attended >= 20 && completedHW >= 20 && avgRating >= 4) earnedBadgeIds.add('tam_paket');
  if (attended >= 50 && completedHW >= 30) earnedBadgeIds.add('altin_donem');
  if (attended >= 100 && completedHW >= 50) earnedBadgeIds.add('efsane_donem');
  if (avgRating >= 4 && completedHW >= 3 && missedCount === 0) earnedBadgeIds.add('altin_ogrenci');

  return {
    points,
    earnedBadgeIds,
    attended,
    missedCount,
    lateCount,
    completedHW,
    totalHW,
    lateHW,
    onTimeHW,
    avgRating,
    totalReports,
    total5Stars,
    consecutive5,
    cokIyiCount,
    iyiCount,
    yetersizCount,
    pointsAdjustment: pointsAdjustment || 0,
  };
}

// ── Badge definitions (75 total) ──────────────────────────────
export const ALL_BADGES = [
  // ── Devam rozetleri (12) ──
  { id: 'ilk_ders',          emoji: '🎉', label: 'İlk Ders',            desc: 'İlk derse katıldı',              color: '#10b981', bg: '#d1fae5' },
  { id: 'devam_baslangic',   emoji: '👣', label: 'İlk Adım',            desc: '3 derse katıldı',                 color: '#10b981', bg: '#d1fae5' },
  { id: 'devam_ustasi',      emoji: '🏃', label: 'Devam Ustası',         desc: '5 derse katıldı',                 color: '#059669', bg: '#d1fae5' },
  { id: 'devam_guclu',       emoji: '💪', label: 'Güçlü Devam',          desc: '10 derse katıldı',                color: '#047857', bg: '#d1fae5' },
  { id: 'surekli_gelme',     emoji: '📅', label: 'Sürekli Gelme',        desc: '15 derse katıldı',                color: '#0d9488', bg: '#ccfbf1' },
  { id: 'devam_efsanesi',    emoji: '🔥', label: 'Devam Efsanesi',      desc: '20 derse katıldı',                color: '#f97316', bg: '#ffedd5' },
  { id: 'devam_krali',       emoji: '👑', label: 'Devam Kralı',          desc: '25 derse katıldı',                color: '#ea580c', bg: '#ffedd5' },
  { id: '30_ders',           emoji: '🎖️', label: '30 Ders',              desc: '30 derse katıldı',                color: '#dc2626', bg: '#fee2e2' },
  { id: '50_ders',           emoji: '🏅', label: '50 Ders',              desc: '50 derse katıldı',                color: '#b91c1c', bg: '#fee2e2' },
  { id: '100_ders',          emoji: '🏆', label: '100 Ders!',            desc: '100 derse katıldı',               color: '#7c2d12', bg: '#fef3c7' },
  { id: 'hic_kacinmadi',     emoji: '✨', label: 'Hiç Kaçırmadı',        desc: 'Hiç devamsızlık yok (3+ ders)',   color: '#6366f1', bg: '#eef2ff' },
  { id: 'tam_devam',         emoji: '🎯', label: 'Tam Devam',            desc: 'Hiç devamsızlık yok (10+ ders)',  color: '#4f46e5', bg: '#eef2ff' },
  { id: 'hic_gec_kalmadi',   emoji: '⏰', label: 'Hiç Geç Kalmadı',      desc: '10+ ders, 0 geç kalma',           color: '#0891b2', bg: '#cffafe' },
  { id: 'zamaninda',         emoji: '🕐', label: 'Zamanında',            desc: '5+ ders, 0 geç kalma',            color: '#0e7490', bg: '#cffafe' },

  // ── Performans rozetleri (14) ──
  { id: 'ilk_yildiz',        emoji: '💫', label: 'İlk Yıldız',          desc: 'İlk 3+ yıldız aldı',              color: '#3b82f6', bg: '#dbeafe' },
  { id: 'ilk_5_yildiz',      emoji: '🌟', label: 'İlk 5 Yıldız',        desc: 'İlk 5 yıldız aldı',               color: '#f59e0b', bg: '#fef3c7' },
  { id: '3_ustuste_5',       emoji: '🔥', label: '3 Üst Üste',          desc: '3 üst üste 5 yıldız',             color: '#f97316', bg: '#ffedd5' },
  { id: '5_ustuste_5',       emoji: '⚡', label: '5 Üst Üste',          desc: '5 üst üste 5 yıldız',             color: '#ea580c', bg: '#ffedd5' },
  { id: '10_ustuste_5',      emoji: '💥', label: '10 Üst Üste!',        desc: '10 üst üste 5 yıldız',            color: '#dc2626', bg: '#fee2e2' },
  { id: 'yildiz_yagmuru',   emoji: '🌧️', label: 'Yıldız Yağmuru',       desc: '20 toplam 5 yıldız',              color: '#d97706', bg: '#fef3c7' },
  { id: 'cok_yildiz',       emoji: '✨', label: 'Çok Yıldız',          desc: '50 toplam 5 yıldız',              color: '#fbbf24', bg: '#fef9c3' },
  { id: 'yukselis',          emoji: '📈', label: 'Yükseliş',            desc: 'Ort. 3+ yıldız (2+ ders)',        color: '#3b82f6', bg: '#dbeafe' },
  { id: 'yukselen_yildiz',  emoji: '🌠', label: 'Yükselen Yıldız',       desc: 'Ort. 3.5+ yıldız (5+ ders)',      color: '#2563eb', bg: '#dbeafe' },
  { id: 'parlayan_yildiz',  emoji: '⭐', label: 'Parlayan Yıldız',      desc: 'Ort. 4+ yıldız (3+ ders)',        color: '#f59e0b', bg: '#fef9c3' },
  { id: 'surekli_iyi',       emoji: '🌟', label: 'Sürekli İyi',         desc: 'Ort. 4+ yıldız (10+ ders)',       color: '#d97706', bg: '#fef3c7' },
  { id: 'altin_yildiz',     emoji: '🌟', label: 'Altın Yıldız',         desc: 'Ort. 4.5+ yıldız (5+ ders)',      color: '#d97706', bg: '#fef3c7' },
  { id: 'ortalama_5',        emoji: '💎', label: 'Ortalama 5',          desc: 'Ort. tam 5 yıldız (10+ ders)',    color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'kusursuz',          emoji: '💎', label: 'Kusursuz',             desc: 'Ort. 4.8+ yıldız (5+ ders)',      color: '#7c3aed', bg: '#f5f3ff' },

  // ── Ödev rozetleri (12) ──
  { id: 'ilk_odev',          emoji: '✅', label: 'İlk Ödev',            desc: 'İlk ödevini tamamladı',           color: '#10b981', bg: '#d1fae5' },
  { id: 'ilk_zamaninda',     emoji: '🎯', label: 'İlk Zamanında',       desc: 'İlk zamanında teslim',            color: '#059669', bg: '#d1fae5' },
  { id: 'odev_sampiyonu',    emoji: '📚', label: 'Ödev Şampiyonu',      desc: '5 ödev tamamladı',                color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'odev_makinesi',     emoji: '🤖', label: 'Ödev Makinesi',       desc: '10 ödev tamamladı',               color: '#6d28d9', bg: '#ede9fe' },
  { id: '20_odev',           emoji: '📖', label: '20 Ödev',             desc: '20 ödev tamamladı',               color: '#5b21b6', bg: '#ede9fe' },
  { id: 'odev_kahramani',    emoji: '🦸', label: 'Ödev Kahramanı',       desc: '25 ödev tamamladı',               color: '#4c1d95', bg: '#ede9fe' },
  { id: '30_odev',           emoji: '📚', label: '30 Ödev!',            desc: '30 ödev tamamladı',               color: '#4338ca', bg: '#eef2ff' },
  { id: '50_odev',           emoji: '🎓', label: '50 Ödev!',            desc: '50 ödev tamamladı',               color: '#312e81', bg: '#eef2ff' },
  { id: 'mukemmel_ogrenci',  emoji: '🎓', label: 'Mükemmel Öğrenci',    desc: 'Tüm ödevleri tamamladı (3+)',      color: '#4f46e5', bg: '#eef2ff' },
  { id: 'zamaninda_krali',   emoji: '👑', label: 'Zamanında Kralı',     desc: '10 ödev zamanında',               color: '#0891b2', bg: '#cffafe' },
  { id: 'hic_gecikme',       emoji: '🚫', label: 'Hiç Gecikme',         desc: '10+ ödev, 0 gecikme',             color: '#0e7490', bg: '#cffafe' },

  // ── Değerlendirme rozetleri (10) ──
  { id: 'ilk_cok_iyi',       emoji: '🥇', label: 'İlk Çok İyi',         desc: 'İlk "Çok İyi" değerlendirme',     color: '#f59e0b', bg: '#fef3c7' },
  { id: 'cok_iyi_odev',      emoji: '🥇', label: 'Çok İyi Ödev',        desc: '1 ödev "Çok İyi" değerlendi',     color: '#f59e0b', bg: '#fef3c7' },
  { id: 'odev_yildizi',      emoji: '🌠', label: 'Ödev Yıldızı',        desc: '3 ödev "Çok İyi" değerlendi',     color: '#d97706', bg: '#fef9c3' },
  { id: 'surekli_cok_iyi',  emoji: '🌟', label: 'Sürekli Çok İyi',     desc: '5 ödev "Çok İyi" değerlendi',     color: '#b45309', bg: '#fef3c7' },
  { id: '10_cok_iyi',        emoji: '🏆', label: '10 Çok İyi',          desc: '10 ödev "Çok İyi"',               color: '#92400e', bg: '#fef3c7' },
  { id: 'kalite_krali',      emoji: '👑', label: 'Kalite Kralı',        desc: '15 ödev "Çok İyi"',               color: '#78350f', bg: '#fef3c7' },
  { id: '20_cok_iyi',        emoji: '👑', label: '20 Çok İyi!',         desc: '20 ödev "Çok İyi"',               color: '#451a03', bg: '#fef3c7' },
  { id: 'iyi_ogrenci',       emoji: '🥈', label: 'İyi Öğrenci',         desc: '10 ödev "İyi"',                   color: '#64748b', bg: '#f1f5f9' },
  { id: 'kaliteli_calisan',  emoji: '🏆', label: 'Kaliteli Çalışan',    desc: '5+ ödev "İyi/Çok İyi"',           color: '#b45309', bg: '#fef3c7' },
  { id: 'hic_yetersiz',      emoji: '💎', label: 'Hiç Yetersiz Yok',    desc: '10+ ödev, 0 yetersiz',            color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'mukemmel_kalite',   emoji: '💎', label: 'Mükemmel Kalite',     desc: '20+ çok iyi, 0 yetersiz',         color: '#5b21b6', bg: '#f5f3ff' },

  // ── Kombinasyon rozetleri (9) ──
  { id: 'tam_ogrenci',       emoji: '🌈', label: 'Tam Öğrenci',         desc: '5+ ders & 5+ ödev',               color: '#ec4899', bg: '#fce7f3' },
  { id: 'ders_ve_odev_10',   emoji: '🔗', label: '10+10',               desc: '10 ders + 10 ödev',               color: '#db2777', bg: '#fce7f3' },
  { id: 'ders_ve_odev_20',   emoji: '🔗', label: '20+20',               desc: '20 ders + 20 ödev',               color: '#be185d', bg: '#fce7f3' },
  { id: 'yildiz_ve_devam',   emoji: '✨', label: 'Yıldız+Devam',        desc: '4+ ort & 10+ ders',               color: '#c026d3', bg: '#fae8ff' },
  { id: 'tam_paket',         emoji: '🎁', label: 'Tam Paket',           desc: '20+ ders, 20+ ödev, 4+ ort',      color: '#a21caf', bg: '#fae8ff' },
  { id: 'altin_donem',       emoji: '🥇', label: 'Altın Dönem',         desc: '50+ ders, 30+ ödev',              color: '#d97706', bg: '#fef3c7' },
  { id: 'efsane_donem',      emoji: '🚀', label: 'Efsane Dönem',        desc: '100+ ders, 50+ ödev',            color: '#4f46e5', bg: '#eef2ff' },
  { id: 'altin_ogrenci',     emoji: '👑', label: 'Altın Öğrenci',       desc: 'Devam + performans + ödev',       color: '#f59e0b', bg: '#fef3c7' },

  // ── Puan rozetleri (10) ──
  { id: 'ilk_50',            emoji: '🌱', label: '50 Puan!',            desc: '50 puana ulaştı',                 color: '#10b981', bg: '#d1fae5' },
  { id: '100_puan',          emoji: '💯', label: '100 Puan!',           desc: '100 puana ulaştı',                color: '#ec4899', bg: '#fce7f3' },
  { id: '300_puan',          emoji: '🏅', label: '300 Puan!',           desc: '300 puana ulaştı',                color: '#f59e0b', bg: '#fef3c7' },
  { id: 'super_kahraman',    emoji: '🦸', label: 'Süper Kahraman',       desc: '500 puana ulaştı',                color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'efsane_750',        emoji: '🚀', label: 'Efsane!',              desc: '750 puana ulaştı',                color: '#4f46e5', bg: '#eef2ff' },
  { id: '1000_puan',         emoji: '🌟', label: '1000 Puan!',          desc: '1000 puana ulaştı',               color: '#7c3aed', bg: '#f5f3ff' },
  { id: '1500_puan',         emoji: '⭐', label: '1500 Puan!',          desc: '1500 puana ulaştı',               color: '#6d28d9', bg: '#ede9fe' },
  { id: '2000_puan',         emoji: '💫', label: '2000 Puan!',          desc: '2000 puana ulaştı',               color: '#5b21b6', bg: '#ede9fe' },
  { id: '3000_puan',         emoji: '🔥', label: '3000 Puan!',          desc: '3000 puana ulaştı',               color: '#dc2626', bg: '#fee2e2' },
  { id: '5000_puan',         emoji: '🏆', label: '5000 Puan!',          desc: '5000 puana ulaştı',               color: '#7c2d12', bg: '#fef3c7' },
];

// ── Level from points ─────────────────────────────────────────
export function getLevel(points) {
  if (points >= 3000) return { level: 9,  label: 'Efsane Usta 🏆',  color: '#7c2d12', next: null,  prev: 2000 };
  if (points >= 2000) return { level: 8,  label: 'Efsane 🚀',       color: '#4f46e5', next: 3000, prev: 1500 };
  if (points >= 1500) return { level: 7,  label: 'Usta 🌟',         color: '#6d28d9', next: 2000, prev: 1000 };
  if (points >= 1000) return { level: 6,  label: 'Kahraman 🦸',    color: '#7c3aed', next: 1500, prev: 750  };
  if (points >= 750)  return { level: 5,  label: 'Efsane 🚀',      color: '#4f46e5', next: 1000, prev: 500  };
  if (points >= 500)  return { level: 4,  label: 'Süper 🦸',       color: '#7c3aed', next: 750,  prev: 300  };
  if (points >= 300)  return { level: 3,  label: 'Uzman 🏅',       color: '#f59e0b', next: 500,  prev: 150  };
  if (points >= 150)  return { level: 2,  label: 'İleri 🌟',       color: '#6366f1', next: 300,  prev: 60   };
  if (points >= 60)   return { level: 1,  label: 'Gelişiyor ⭐',    color: '#10b981', next: 150,  prev: 0    };
  return                    { level: 0,  label: 'Yeni Başlayan 🌱', color: '#9ca3af', next: 60,  prev: 0    };
}

// ── Main component ────────────────────────────────────────────
export default function StudentGamification({ reports = [], homeworks = [], studentName = '', pointsAdjustment = 0 }) {
  const [showAll, setShowAll] = useState(false);
  const g = calcGamification(reports, homeworks, pointsAdjustment);
  const { points, earnedBadgeIds } = g;
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
              {pointsAdjustment ? (
                <span style={{ fontSize: '0.75rem', color: pointsAdjustment > 0 ? '#86efac' : '#fca5a5', fontWeight: 700, marginLeft: '0.3rem' }}>
                  ({pointsAdjustment > 0 ? '+' : ''}{pointsAdjustment} manuel)
                </span>
              ) : null}
            </div>
            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: lvl.color, background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.7rem', borderRadius: 20 }}>{lvl.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { icon: '🏃', val: g.attended, label: 'Devam' },
              { icon: '⭐', val: g.avgRating > 0 ? g.avgRating.toFixed(1) : '-', label: 'Ort. Puan' },
              { icon: '📚', val: `${g.completedHW}/${g.totalHW}`, label: 'Ödev' },
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