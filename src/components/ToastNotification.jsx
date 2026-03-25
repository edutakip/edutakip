import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle } from 'lucide-react';

// Soft notification sound using Web Audio API
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

let toastId = 0;

export default function ToastNotification() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 380);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const id = ++toastId;
      const toast = { id, ...e.detail, exiting: false };
      setToasts(prev => [...prev, toast]);
      playSuccessSound();
      setTimeout(() => remove(id), 3800);
    };
    window.addEventListener('edu:toast', handler);
    return () => window.removeEventListener('edu:toast', handler);
  }, [remove]);

  if (toasts.length === 0) return null;

  return createPortal(
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.7rem',
          background: 'rgba(17,24,15,0.92)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: '14px',
          padding: '0.7rem 0.9rem 0.7rem 0.85rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
          minWidth: '260px', maxWidth: '380px',
          pointerEvents: 'auto',
          animation: toast.exiting ? 'toastOut 0.35s cubic-bezier(0.4,0,1,1) forwards' : 'toastIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <style>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translateX(60px) scale(0.9); }
              to   { opacity: 1; transform: translateX(0) scale(1); }
            }
            @keyframes toastOut {
              from { opacity: 1; transform: translateX(0) scale(1); }
              to   { opacity: 0; transform: translateX(60px) scale(0.9); }
            }
          `}</style>
          <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.875rem', fontWeight: '600', flex: 1, lineHeight: 1.4 }}>
            {toast.message}
          </span>
          <button onClick={() => remove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '0.1rem', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}