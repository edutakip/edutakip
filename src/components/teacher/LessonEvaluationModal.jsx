import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Star, Loader2 } from 'lucide-react';

export default function LessonEvaluationModal({ lesson, onClose, onSaved }) {
  const [form, setForm] = useState({
    evaluationRating: lesson.evaluationRating || 0,
    evaluationNote: lesson.evaluationNote || '',
    homeworkGiven: lesson.homeworkGiven || '',
    topicsCompleted: lesson.topicsCompleted || '',
    studentAttitude: lesson.studentAttitude || 'iyi',
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    await base44.entities.Lesson.update(lesson.id, form);
    setLoading(false);
    onSaved();
    onClose();
  };

  const inp = { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', outline: 'none' };
  const lbl = { fontSize: '0.72rem', color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '1.15rem', fontWeight: '800' }}>Ders Değerlendirmesi</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.1rem' }}>{lesson.studentName} · {lesson.date}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Star Rating */}
          <div>
            <label style={lbl}>Ders Puanı</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setForm(f => ({ ...f, evaluationRating: star }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                  <Star size={28}
                    fill={form.evaluationRating >= star ? '#f59e0b' : 'none'}
                    color={form.evaluationRating >= star ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Attitude */}
          <div>
            <label style={lbl}>Öğrenci Tutumu</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['çok iyi', 'iyi', 'orta', 'geliştirmeli'].map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, studentAttitude: a }))}
                  style={{
                    padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1.5px solid',
                    borderColor: form.studentAttitude === a ? '#4f46e5' : '#e5e7eb',
                    background: form.studentAttitude === a ? '#eef2ff' : '#f9fafb',
                    color: form.studentAttitude === a ? '#4f46e5' : '#6b7280',
                    fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label style={lbl}>İşlenen Konular</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px' }}
              placeholder='Bu derste işlenen konular...'
              value={form.topicsCompleted}
              onChange={e => setForm(f => ({ ...f, topicsCompleted: e.target.value }))} />
          </div>

          {/* Homework */}
          <div>
            <label style={lbl}>Verilen Ödev</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px' }}
              placeholder='Ödev veya alıştırmalar...'
              value={form.homeworkGiven}
              onChange={e => setForm(f => ({ ...f, homeworkGiven: e.target.value }))} />
          </div>

          {/* Note */}
          <div>
            <label style={lbl}>Öğretmen Notu</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
              placeholder='Veli için genel değerlendirme notu...'
              value={form.evaluationNote}
              onChange={e => setForm(f => ({ ...f, evaluationNote: e.target.value }))} />
          </div>

          <button onClick={save} disabled={loading}
            style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
            {loading ? <><Loader2 size={16} className='animate-spin' /> Kaydediliyor...</> : 'Değerlendirmeyi Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}