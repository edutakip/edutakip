import React, { useState } from 'react';
import { X, Plus, Minus, RotateCcw } from 'lucide-react';

const QUICK_ADDS = [1, 5, 10, 25];
const QUICK_SUBS = [1, 5, 10, 25];

export default function PointsEditor({ student, adjustment, onAdjust, onClose }) {
  const [note, setNote] = useState(student.pointsNote || '');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (amt) => {
    setSaving(true);
    await onAdjust(adjustment + amt, note);
    setSaving(false);
  };

  const handleSub = async (amt) => {
    setSaving(true);
    await onAdjust(adjustment - amt, note);
    setSaving(false);
  };

  const handleReset = async () => {
    setSaving(true);
    setNote('');
    await onAdjust(0, '');
    setSaving(false);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '1.25rem 1.5rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color='white' />
          </button>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Puan Düzenle</div>
          <h2 style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', margin: '0.2rem 0 0' }}>{student.name}</h2>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>MANUEL PUAN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: adjustment > 0 ? '#86efac' : adjustment < 0 ? '#fca5a5' : 'white', lineHeight: 1 }}>
                {adjustment > 0 ? '+' : ''}{adjustment}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Add points */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={14} /> Puan Ekle
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {QUICK_ADDS.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleAdd(amt)}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: 12, border: '1.5px solid #d1fae5',
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    color: '#047857', fontWeight: 800, fontSize: '0.95rem',
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; } }}
                  onMouseLeave={e => { if (!saving) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'linear-gradient(135deg, #ecfdf5, #d1fae5)'; e.currentTarget.style.color = '#047857'; } }}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Subtract points */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Minus size={14} /> Puan Çıkar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {QUICK_SUBS.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleSub(amt)}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: 12, border: '1.5px solid #fee2e2',
                    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                    color: '#b91c1c', fontWeight: 800, fontSize: '0.95rem',
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; } }}
                  onMouseLeave={e => { if (!saving) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #fee2e2)'; e.currentTarget.style.color = '#b91c1c'; } }}
                >
                  −{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.35rem' }}>Not (opsiyonel)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Örn: Derse aktif katılım"
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: '0.82rem',
                outline: 'none', transition: 'border 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={saving || adjustment === 0}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 12,
              border: '1.5px solid #e5e7eb', background: '#f9fafb',
              color: '#6b7280', fontWeight: 700, fontSize: '0.85rem',
              cursor: saving || adjustment === 0 ? 'not-allowed' : 'pointer',
              opacity: saving || adjustment === 0 ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!saving && adjustment !== 0) { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; } }}
            onMouseLeave={e => { if (!saving && adjustment !== 0) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; } }}
          >
            <RotateCcw size={14} /> Manuel Puanı Sıfırla
          </button>

          <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.85rem', lineHeight: 1.4 }}>
            Ders ve ödevlerden gelen puanlar korunur. Sadece manuel eklenen/çıkarılan puanlar sıfırlanır.
          </p>
        </div>
      </div>
    </div>
  );
}