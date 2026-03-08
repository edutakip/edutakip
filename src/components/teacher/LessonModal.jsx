import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Video, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { format, addWeeks } from 'date-fns';

export default function LessonModal({ students, defaultDate, onClose, onSaved }) {
  const [form, setForm] = useState({
    studentId: '', date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '10:00', subject: '', type: 'yuzyuze',
    location: '', notes: '',
  });
  const [recurring, setRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateZoom = async () => {
    setZoomLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a realistic fake Zoom meeting link for a tutoring session on ${form.date} at ${form.startTime}. Format: https://zoom.us/j/XXXXXXXXXX?pwd=XXXXXXXXX. Return only the URL.`,
      });
      setMeetingLink(res.trim());
    } finally {
      setZoomLoading(false);
    }
  };

  const handleTypeChange = (t) => {
    u('type', t);
    if (t === 'online') generateZoom();
    else setMeetingLink('');
  };

  const save = async () => {
    if (!form.studentId || !form.date || !form.startTime) return;
    setLoading(true);
    const student = students.find(s => s.id === form.studentId);
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    const duration = Math.round((end - start) / 60000);
    const groupId = recurring ? `group_${Date.now()}` : undefined;

    const baseLesson = {
      ...form, studentName: student?.name || '',
      teacherEmail: (await base44.auth.me()).email,
      meetingLink, duration,
      recurringGroupId: groupId,
    };

    const dates = [form.date];
    if (recurring) {
      for (let w = 1; w < recurringWeeks; w++) {
        dates.push(format(addWeeks(new Date(form.date), w), 'yyyy-MM-dd'));
      }
    }

    for (const d of dates) {
      await base44.entities.Lesson.create({ ...baseLesson, date: d });
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px',
    background: 'var(--bg-hover)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
  };
  const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700' }}>Ders Planla</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Student */}
          <div>
            <label style={labelStyle}>Öğrenci</label>
            <select style={inputStyle} value={form.studentId} onChange={e => u('studentId', e.target.value)}>
              <option value=''>Öğrenci seçin...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Tarih</label>
              <input style={inputStyle} type='date' value={form.date} onChange={e => u('date', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Başlangıç</label>
              <input style={inputStyle} type='time' value={form.startTime} onChange={e => u('startTime', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Bitiş</label>
              <input style={inputStyle} type='time' value={form.endTime} onChange={e => u('endTime', e.target.value)} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={labelStyle}>Konu</label>
            <input style={inputStyle} placeholder='Ders konusu...' value={form.subject} onChange={e => u('subject', e.target.value)} />
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Ders Türü</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[{ v: 'yuzyuze', label: 'Yüz Yüze', icon: MapPin }, { v: 'online', label: 'Online', icon: Video }].map(({ v, label, icon: Icon }) => (
                <button key={v} onClick={() => handleTypeChange(v)}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: '12px', border: '2px solid',
                    borderColor: form.type === v ? 'var(--accent)' : 'var(--border)',
                    background: form.type === v ? 'var(--accent-light)' : 'transparent',
                    color: form.type === v ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.15s',
                  }}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting link */}
          {form.type === 'online' && (
            <div>
              <label style={labelStyle}>Zoom Linki</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder='Oluşturuluyor...' value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
                <button onClick={generateZoom} disabled={zoomLoading}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {zoomLoading ? <Loader2 size={15} className='animate-spin' /> : <RefreshCw size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Location for face-to-face */}
          {form.type === 'yuzyuze' && (
            <div>
              <label style={labelStyle}>Konum</label>
              <input style={inputStyle} placeholder='Adres veya yer...' value={form.location} onChange={e => u('location', e.target.value)} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notlar</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} placeholder='Ders notları...' value={form.notes} onChange={e => u('notes', e.target.value)} />
          </div>

          {/* Recurring */}
          <div style={{ background: 'var(--bg-hover)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input type='checkbox' checked={recurring} onChange={e => setRecurring(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
              <RefreshCw size={15} color='var(--accent)' />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '500' }}>Sonraki haftalara da ekle</span>
            </label>
            {recurring && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Toplam hafta:</span>
                {[2, 4, 8, 12].map(w => (
                  <button key={w} onClick={() => setRecurringWeeks(w)}
                    style={{
                      padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid',
                      borderColor: recurringWeeks === w ? 'var(--accent)' : 'var(--border)',
                      background: recurringWeeks === w ? 'var(--accent-light)' : 'transparent',
                      color: recurringWeeks === w ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                    }}>{w}</button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button onClick={save} disabled={loading || !form.studentId}
            style={{
              padding: '0.75rem', borderRadius: '12px', border: 'none',
              background: 'var(--accent)', color: 'white', fontWeight: '700',
              fontSize: '0.95rem', cursor: 'pointer', opacity: (!form.studentId || loading) ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
            {loading ? <><Loader2 size={16} className='animate-spin' /> Kaydediliyor...</> : 'Dersi Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}