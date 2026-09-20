import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Radio, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Web Audio API ile iki tonalı chime sesi
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Üç tonalı nazik chime (C5 - E5 - G5)
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = now + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.start(start);
      osc.stop(start + 0.6);
    });
    // ctx kapatma
    setTimeout(() => { try { ctx.close(); } catch {} }, 2000);
  } catch (e) { /* sessizce geç */ }
}

const STORAGE_KEY = 'edutakip_notified_lessons';

// Modül seviyesinde — Layout remount olsa bile aynı ders için tekrar tetiklenmez
const shownLessonIds = new Set();

function getNotifiedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markNotified(lessonId) {
  try {
    const ids = getNotifiedIds();
    ids.add(lessonId);
    // Son 50 kaydı tut, eskiyi temizle
    const arr = Array.from(ids).slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function LessonStartPopup({ activeLessons }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [popupLesson, setPopupLesson] = useState(null);
  const [visible, setVisible] = useState(false);

  // Aktif dersler değiştiğinde bildirilmemiş ilk dersi bul
  useEffect(() => {
    if (!activeLessons || activeLessons.length === 0) return;
    const notified = getNotifiedIds();
    const target = activeLessons.find(l => !notified.has(l.id) && !shownLessonIds.has(l.id));
    if (target) {
      // Hem modül seviyesinde hem localStorage'da hemen işaretle —
      // remount veya tekrar koşma durumunda tekrar tetiklenmesin
      shownLessonIds.add(target.id);
      markNotified(target.id);
      setPopupLesson(target);
      requestAnimationFrame(() => setVisible(true));
      playChime();
    }
  }, [activeLessons]);

  const handleClose = () => {
    if (popupLesson) markNotified(popupLesson.id);
    setVisible(false);
    setTimeout(() => {
      setPopupLesson(null);
    }, 300);
  };

  const handleGo = () => {
    if (popupLesson) markNotified(popupLesson.id);
    setVisible(false);
    setTimeout(() => {
      setPopupLesson(null);
      navigate(createPageUrl('ActiveLesson') + '?lessonId=' + popupLesson.id);
    }, 300);
  };

  if (!popupLesson) return null;

  return (
    <>
      <style>{`
        @keyframes lsp-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lsp-card-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.92); }
          60% { opacity: 1; transform: translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lsp-pulse-ring {
          0% { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes lsp-icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(17,24,39,0.55)',
          backdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Popup kart */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', pointerEvents: 'none',
      }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%', maxWidth: 400,
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.92)',
            transition: 'opacity 0.35s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Gradient header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
            padding: '1.75rem 1.5rem 1.25rem',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Pulse ring dekorasyon */}
            <div style={{
              position: 'absolute', top: '1.4rem', right: '1.5rem',
              width: 44, height: 44, borderRadius: '50%',
              border: '2px solid rgba(239,68,68,0.5)',
              animation: 'lsp-pulse-ring 1.8s ease-out infinite',
            }} />
            {/* Kapat butonu */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', top: '0.75rem', left: '0.75rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                width: 30, height: 30, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 2,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              <X size={16} />
            </button>

            {/* İkon + canlı rozeti */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.1rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                animation: 'lsp-icon-bounce 1.5s ease-in-out infinite',
              }}>
                <Radio size={22} color='white' />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.7rem', fontWeight: 800, color: '#fca5a5',
                background: 'rgba(239,68,68,0.15)',
                padding: '0.3rem 0.7rem', borderRadius: 20,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'al-pulse 1.5s ease-in-out infinite' }} />
                {t('activeLesson.live')}
              </div>
            </div>

            {/* Başlık */}
            <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
              {t('activeLesson.confirmTitle')}
            </h2>
          </div>

          {/* Gövde */}
          <div style={{ background: 'white', padding: '1.25rem 1.5rem 1.5rem' }}>
            {/* Ders bilgi kartı */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              padding: '0.85rem', borderRadius: 14,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: getColor(popupLesson.studentName),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>
                  {getInitials(popupLesson.studentName)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {popupLesson.studentName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                  {popupLesson.subject || ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>
                  {popupLesson.startTime?.slice(0, 5)}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                  {popupLesson.endTime?.slice(0, 5)}
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              {t('activeLesson.confirmDesc', {
                name: popupLesson.studentName,
                time: `${popupLesson.startTime?.slice(0, 5)} - ${popupLesson.endTime?.slice(0, 5)}`,
              })}
            </p>

            {/* Butonlar */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', background: 'white',
                  color: '#6b7280', fontWeight: 700, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                {t('activeLesson.confirmCancel')}
              </button>
              <button
                onClick={handleGo}
                style={{
                  flex: 1.4, padding: '0.8rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white', fontWeight: 800, fontSize: '0.85rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.35)'; }}
              >
                {t('activeLesson.confirmGo')} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}