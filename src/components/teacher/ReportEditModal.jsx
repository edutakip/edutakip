import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Star, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RATING_LABELS = { 1: 'Çok Kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok İyi' };
const ATTENDANCE_OPTS = [
  { value: 'katıldı', label: 'Katıldı' },
  { value: 'geç kaldı', label: 'Geç Kaldı' },
  { value: 'katılmadı', label: 'Katılmadı' },
];
const UNDERSTOOD_OPTS = [
  { value: 'tam', label: 'Tam Anladı' },
  { value: 'kismen', label: 'Kısmen Anladı' },
  { value: 'tekrar', label: 'Tekrar Gerekli' },
];
const PARTICIPATION_OPTS = [
  { value: 'aktif', label: 'Aktif Katılım' },
  { value: 'orta', label: 'Orta Katılım' },
  { value: 'pasif', label: 'Pasif' },
];
const MOTIVATION_OPTS = [
  { value: 'yuksek', label: 'Yüksek Motivasyon' },
  { value: 'normal', label: 'Normal Motivasyon' },
  { value: 'dusuk', label: 'Düşük Motivasyon' },
];
const HOMEWORK_DONE_OPTS = [
  { value: 'evet', label: 'Evet, Yapıldı' },
  { value: 'kismen', label: 'Kısmen Yapıldı' },
  { value: 'hayir', label: 'Hayır, Yapılmadı' },
];

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem', display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
      onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
      onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || undefined)}
      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none', cursor: 'pointer', background: 'white', boxSizing: 'border-box' }}
    >
      <option value="">Seçiniz</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function ReportEditModal({ report, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!report) return;
    setForm({
      rating: report.rating || 0,
      attendance: report.attendance || '',
      understood: report.understood || '',
      participation: report.participation || '',
      motivation: report.motivation || '',
      topicsCovered: report.topicsCovered || '',
      pageLeft: report.pageLeft || '',
      generalNote: report.generalNote || '',
      strengths: report.strengths || '',
      improvements: report.improvements || '',
      homework: report.homework || '',
      homeworkDone: report.homeworkDone || '',
      nextGoal: report.nextGoal || '',
    });
  }, [report]);

  if (!report) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.LessonReport.update(report.id, {
        rating: form.rating || undefined,
        attendance: form.attendance || undefined,
        understood: form.understood || undefined,
        participation: form.participation || undefined,
        motivation: form.motivation || undefined,
        topicsCovered: form.topicsCovered || undefined,
        pageLeft: form.pageLeft || undefined,
        generalNote: form.generalNote || undefined,
        strengths: form.strengths || undefined,
        improvements: form.improvements || undefined,
        homework: form.homework || undefined,
        homeworkDone: form.homeworkDone || undefined,
        nextGoal: form.nextGoal || undefined,
      });
      onSaved?.();
    } catch (e) {
      console.error('Report update error:', e);
      alert('Rapor güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Raporu Düzenle</h2>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{report.studentName} · {report.subject || 'Ders'}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color='#6b7280' />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Rating */}
          <Field label="Genel Performans Puanı">
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => set('rating', n === form.rating ? 0 : n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <Star size={28} fill={n <= form.rating ? '#f59e0b' : 'none'} color={n <= form.rating ? '#f59e0b' : '#e5e7eb'} />
                </button>
              ))}
              <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#6b7280' }}>{form.rating ? RATING_LABELS[form.rating] : 'Seçilmedi'}</span>
            </div>
          </Field>

          {/* Selects */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Katılım Durumu"><Select value={form.attendance} onChange={v => set('attendance', v)} options={ATTENDANCE_OPTS} /></Field>
            <Field label="Anlama Düzeyi"><Select value={form.understood} onChange={v => set('understood', v)} options={UNDERSTOOD_OPTS} /></Field>
            <Field label="Derse Katılım"><Select value={form.participation} onChange={v => set('participation', v)} options={PARTICIPATION_OPTS} /></Field>
            <Field label="Motivasyon"><Select value={form.motivation} onChange={v => set('motivation', v)} options={MOTIVATION_OPTS} /></Field>
          </div>

          {/* Textareas */}
          <Field label="İşlenen Konular"><TextArea value={form.topicsCovered} onChange={v => set('topicsCovered', v)} placeholder="Derste işlenen konular..." /></Field>
          <Field label="Kalınan Sayfa"><input type="text" value={form.pageLeft} onChange={e => set('pageLeft', e.target.value)} placeholder="Örn: Sayfa 45, 3. ünite..." style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none', boxSizing: 'border-box' }} /></Field>
          <Field label="Genel Değerlendirme"><TextArea value={form.generalNote} onChange={v => set('generalNote', v)} placeholder="Genel değerlendirme notu..." /></Field>
          <Field label="Güçlü Yönler"><TextArea value={form.strengths} onChange={v => set('strengths', v)} placeholder="Öğrencinin güçlü yönleri..." /></Field>
          <Field label="Geliştirilmesi Gereken Alanlar"><TextArea value={form.improvements} onChange={v => set('improvements', v)} placeholder="Geliştirilmesi gereken alanlar..." /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Verilen Ödev"><TextArea value={form.homework} onChange={v => set('homework', v)} placeholder="Ödev..." /></Field>
            <Field label="Sonraki Ders Hedefi"><TextArea value={form.nextGoal} onChange={v => set('nextGoal', v)} placeholder="Hedef..." /></Field>
          </div>
          <Field label="Önceki Ödev Yapıldı mı?"><Select value={form.homeworkDone} onChange={v => set('homeworkDone', v)} options={HOMEWORK_DONE_OPTS} /></Field>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>İptal</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}