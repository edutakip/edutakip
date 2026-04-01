import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { showToast } from '@/lib/toast';

const ASSESSMENTS = [
  { key: 'yetersiz',      label: 'Yetersiz',      emoji: '😕', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { key: 'gelistirilmeli', label: 'Geliştirilmeli', emoji: '📝', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { key: 'iyi',           label: 'İyi',            emoji: '👍', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { key: 'cok_iyi',       label: 'Çok İyi',        emoji: '🌟', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
];

export default function TeacherAssessmentSection({ hw, onAssessmentSaved }) {
  const [selected, setSelected] = useState(hw?.teacherAssessment || null);
  const [note, setNote] = useState(hw?.teacherNote || '');
  const [saving, setSaving] = useState(false);

  const handleSelect = (key) => setSelected(key);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.Homework.update(hw.id, {
      teacherAssessment: selected,
      teacherNote: note,
      status: 'degerlendirildi',
    });
    onAssessmentSaved({ teacherAssessment: selected, teacherNote: note, status: 'degerlendirildi' });
    showToast({ message: 'Değerlendirme kaydedildi ✓' });
    setSaving(false);
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', border: '1.5px solid #e5e7eb', animation: 'slideUp 0.4s ease 0.38s both' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        ⭐ Değerlendirme
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {ASSESSMENTS.map(a => (
          <button key={a.key} onClick={() => handleSelect(a.key)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            padding: '0.7rem', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            border: `2px solid ${selected === a.key ? a.color : a.border}`,
            background: selected === a.key ? a.bg : 'white',
            fontWeight: selected === a.key ? 700 : 500,
            fontSize: '0.85rem',
            color: selected === a.key ? a.color : '#6b7280',
            boxShadow: selected === a.key ? `0 2px 8px ${a.color}25` : 'none',
          }}>
            <span>{a.emoji}</span> {a.label}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Öğretmen notu (isteğe bağlı)"
        rows={2}
        style={{
          width: '100%', background: 'white', border: '1.5px solid #e5e7eb',
          borderRadius: 10, padding: '0.65rem 0.85rem', fontSize: '0.82rem',
          color: '#374151', resize: 'none', outline: 'none', fontFamily: 'inherit',
          boxSizing: 'border-box', marginBottom: '0.5rem', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = '#7c3aed'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
      <button onClick={handleSave} disabled={!selected || saving} style={{
        width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
        background: selected ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e5e7eb',
        color: selected ? 'white' : '#9ca3af',
        fontWeight: 700, fontSize: '0.875rem', cursor: selected ? 'pointer' : 'default',
        boxShadow: selected ? '0 4px 14px rgba(124,58,237,0.25)' : 'none',
        transition: 'all 0.15s',
      }}>
        {saving ? 'Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
      </button>
    </div>
  );
}