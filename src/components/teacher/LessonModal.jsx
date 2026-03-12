import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Video, MapPin, RefreshCw, Loader2, CalendarDays } from 'lucide-react';
import { format, addWeeks, parseISO } from 'date-fns';

export default function LessonModal({ students, defaultDate, existingLesson, onClose, onSaved }) {
  const isEditing = !!existingLesson;
  const [form, setForm] = useState(isEditing ? {
    studentId: existingLesson.studentId || '',
    date: existingLesson.date || defaultDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: existingLesson.startTime || '09:00',
    endTime: existingLesson.endTime || '10:00',
    subject: existingLesson.subject || '',
    type: existingLesson.type || 'yuzyuze',
    location: existingLesson.location || '',
    notes: existingLesson.notes || '',
    lessonFee: existingLesson.lessonFee || 0,
  } : {
    studentId: '', date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '10:00', subject: '', type: 'yuzyuze',
    location: '', notes: '', lessonFee: 0,
  });
  const [recurring, setRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState(existingLesson?.meetingLink || '');
  const [confirmStep, setConfirmStep] = useState(false);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateZoom = async () => {
    setZoomLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a realistic fake Zoom meeting link for a tutoring session on ${form.date} at ${form.startTime}. Format: https://zoom.us/j/XXXXXXXXXX?pwd=XXXXXXXXX. Return only the URL.`,
      });
      setMeetingLink(res.trim());
    } finally { setZoomLoading(false); }
  };

  const handleTypeChange = (t) => {
    u('type', t);
    if (t === 'online') generateZoom();
    else setMeetingLink('');
  };

  const save = async () => {
    if (!form.studentId || !form.date || !form.startTime) return;
    if (isEditing) {
      setConfirmStep(true);
      return;
    }
    await doSave(false);
  };

  const doSave = async (updateFuture) => {
    setLoading(true);
    const student = students.find(s => s.id === form.studentId);
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    const duration = Math.round((end - start) / 60000);
    const lessonFee = Number(form.lessonFee) || (student?.feePerLesson || 0);

    if (isEditing) {
      await base44.entities.Lesson.update(existingLesson.id, {
        ...form, studentName: student?.name || existingLesson.studentName,
        meetingLink, duration, lessonFee,
      });

      if (updateFuture) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const allLessons = await base44.entities.Lesson.filter({ studentId: existingLesson.studentId });
        const futureLessons = allLessons.filter(l => {
          if (l.id === existingLesson.id || !l.date || l.date <= today) return false;
          try {
            const d = parseISO(l.date);
            const dow = (d.getDay() + 6) % 7;
            const origDate = parseISO(existingLesson.date);
            const origDow = (origDate.getDay() + 6) % 7;
            return dow === origDow && l.startTime === existingLesson.startTime;
          } catch { return false; }
        });

        for (const l of futureLessons) {
          const lDate = parseISO(l.date);
          const origDate = parseISO(existingLesson.date);
          const newDate = parseISO(form.date);
          const dayDiff = newDate.getDay() - origDate.getDay();
          const shifted = new Date(lDate);
          shifted.setDate(shifted.getDate() + dayDiff);

          await base44.entities.Lesson.update(l.id, {
            date: format(shifted, 'yyyy-MM-dd'),
            startTime: form.startTime,
            endTime: form.endTime,
            subject: form.subject,
            location: form.location,
            lessonFee,
            duration,
          });
        }
      }
    } else {
      const me = await base44.auth.me();
      const groupId = recurring ? `group_${Date.now()}` : undefined;
      const baseLesson = { ...form, studentName: student?.name || '', teacherEmail: me.email, meetingLink, duration, lessonFee, recurringGroupId: groupId };
      const dates = [form.date];
      if (recurring) for (let w = 1; w < recurringWeeks; w++) dates.push(format(addWeeks(new Date(form.date), w), 'yyyy-MM-dd'));
      for (const d of dates) await base44.entities.Lesson.create({ ...baseLesson, date: d });
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  const inp = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px',
    background: '#f9fafb', border: '1.5px solid #e5e7eb',
    color: '#111827', fontSize: '0.875rem', outline: 'none',
    transition: 'border-color 0.15s',
  };
  const lbl = { fontSize: '0.72rem', color: '#6b7280', fontWeight: '600', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  if (confirmStep) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CalendarDays size={26} color='#4f46e5' />
            </div>
            <h3 style={{ color: '#111827', fontWeight: '800', fontSize: '1rem', marginBottom: '0.5rem' }}>Gelecek Dersler Güncellensin mi?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: '1.6' }}>
              Bu dersin değişiklikleri aynı öğrencinin ilerleyen haftalardaki planlanmış derslerine de uygulanacak mı?
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => doSave(true)} disabled={loading}
              style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <Loader2 size={14} className='animate-spin' /> : null} Evet, Gelecek Dersleri de Güncelle
            </button>
            <button onClick={() => doSave(false)} disabled={loading}
              style={{ padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
              Hayır, Sadece Bu Dersi Güncelle
            </button>
            <button onClick={() => setConfirmStep(false)} disabled={loading}
              style={{ padding: '0.5rem', borderRadius: '10px', border: 'none', background: 'none', color: '#9ca3af', fontWeight: '500', fontSize: '0.8rem', cursor: 'pointer' }}>
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '500px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '1.15rem', fontWeight: '800' }}>{isEditing ? 'Dersi Düzenle' : 'Ders Planla'}</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.1rem' }}>{isEditing ? 'Ders bilgilerini güncelle' : 'Yeni ders oluştur'}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Student */}
          <div>
            <label style={lbl}>Öğrenci</label>
            <select style={inp} value={form.studentId} onChange={e => u('studentId', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
              <option value=''>Öğrenci seçin...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Tarih', type: 'date', val: form.date, key: 'date' },
              { label: 'Başlangıç', type: 'time', val: form.startTime, key: 'startTime' },
              { label: 'Bitiş', type: 'time', val: form.endTime, key: 'endTime' },
            ].map(({ label, type, val, key }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input style={inp} type={type} value={val} onChange={e => u(key, e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            ))}
          </div>

          {/* Subject & Fee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '0.75rem' }}>
            <div>
              <label style={lbl}>Konu</label>
              <input style={inp} placeholder='Ders konusu...' value={form.subject} onChange={e => u('subject', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={lbl}>Ders Ücreti (₺)</label>
              <input style={inp} type='number' placeholder={students.find(s => s.id === form.studentId)?.feePerLesson || '0'} value={form.lessonFee} onChange={e => u('lessonFee', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          {/* Type */}
          <div>
            <label style={lbl}>Ders Türü</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[{ v: 'yuzyuze', label: 'Yüz Yüze', icon: MapPin }, { v: 'online', label: 'Online', icon: Video }].map(({ v, label, icon: Icon }) => (
                <button key={v} onClick={() => handleTypeChange(v)} style={{
                  flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1.5px solid',
                  borderColor: form.type === v ? '#4f46e5' : '#e5e7eb',
                  background: form.type === v ? '#eef2ff' : '#f9fafb',
                  color: form.type === v ? '#4f46e5' : '#6b7280',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  fontSize: '0.83rem', fontWeight: '600', transition: 'all 0.15s',
                }}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting link */}
          {form.type === 'online' && (
            <div>
              <label style={lbl}>Zoom Linki</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input style={{ ...inp, flex: 1 }} placeholder='Oluşturuluyor...' value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
                <button onClick={generateZoom} disabled={zoomLoading} style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', cursor: 'pointer' }}>
                  {zoomLoading ? <Loader2 size={14} className='animate-spin' /> : <RefreshCw size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Location */}
          {form.type === 'yuzyuze' && (
            <div>
              <label style={lbl}>Konum</label>
              <input style={inp} placeholder='Adres veya yer...' value={form.location} onChange={e => u('location', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={lbl}>Notlar</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '72px' }} placeholder='Ders notları...' value={form.notes} onChange={e => u('notes', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          {!isEditing && (
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '0.9rem 1rem', border: '1.5px solid #e5e7eb' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input type='checkbox' checked={recurring} onChange={e => setRecurring(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }} />
                <RefreshCw size={14} color='#4f46e5' />
                <span style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '500' }}>Sonraki haftalara da ekle</span>
              </label>
              {recurring && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Toplam hafta:</span>
                  {[2, 4, 8, 12].map(w => (
                    <button key={w} onClick={() => setRecurringWeeks(w)} style={{
                      padding: '0.2rem 0.6rem', borderRadius: '7px', border: '1.5px solid',
                      borderColor: recurringWeeks === w ? '#4f46e5' : '#e5e7eb',
                      background: recurringWeeks === w ? '#eef2ff' : 'white',
                      color: recurringWeeks === w ? '#4f46e5' : '#6b7280',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                    }}>{w}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={save} disabled={loading || !form.studentId} style={{
            padding: '0.8rem', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700',
            fontSize: '0.9rem', cursor: 'pointer', opacity: (!form.studentId || loading) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(79,70,229,0.35)', transition: 'all 0.15s',
          }}>
            {loading ? <><Loader2 size={16} className='animate-spin' /> Kaydediliyor...</> : isEditing ? 'Güncelle' : 'Dersi Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}