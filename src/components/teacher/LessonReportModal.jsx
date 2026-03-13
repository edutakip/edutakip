import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Star, Loader2, CheckCircle } from 'lucide-react';
import WhatsAppMessageModal from './WhatsAppMessageModal';

export default function LessonReportModal({ lesson, onClose, onSaved }) {
  const [form, setForm] = useState({
    rating: 4,
    attendance: 'katıldı',
    topicsCovered: '',
    generalNote: '',
    strengths: '',
    improvements: '',
    homework: '',
    nextGoal: '',
  });
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);

  useEffect(() => {
    base44.entities.LessonReport.filter({ lessonId: lesson.id }).then(reports => {
      if (reports.length > 0) {
        const r = reports[0];
        setExisting(r);
        setForm({
          rating: r.rating || 4,
          attendance: r.attendance || 'katıldı',
          topicsCovered: r.topicsCovered || '',
          generalNote: r.generalNote || '',
          strengths: r.strengths || '',
          improvements: r.improvements || '',
          homework: r.homework || '',
          nextGoal: r.nextGoal || '',
        });
      }
    });
  }, [lesson.id]);

  const handleSave = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    const data = {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      studentName: lesson.studentName,
      teacherEmail: me.email,
      date: lesson.date,
      subject: lesson.subject,
      ...form,
    };
    if (existing) {
      await base44.entities.LessonReport.update(existing.id, data);
    } else {
      await base44.entities.LessonReport.create(data);
    }

    // Rapordaki ödev alanı doluysa Homework entity'sine de kaydet
    if (form.homework && form.homework.trim()) {
      // Bu ders için daha önce oluşturulmuş ödev var mı?
      const existingHws = await base44.entities.Homework.filter({ lessonId: lesson.id });
      if (existingHws.length > 0) {
        await base44.entities.Homework.update(existingHws[0].id, { title: form.homework, description: form.homework });
      } else {
        await base44.entities.Homework.create({
          lessonId: lesson.id,
          studentId: lesson.studentId,
          studentName: lesson.studentName,
          teacherEmail: me.email,
          title: form.homework,
          description: form.homework,
          status: 'verildi',
        });
      }
    }

    setLoading(false);

    // WhatsApp bildirimi - veliye ders değerlendirmesi gönder
    const students = await base44.entities.Student.filter({ id: lesson.studentId });
    const student = students[0];
    const phone = student?.parentPhone || lesson.parentPhone;
    if (phone) {
      const ratingLabels = ['', 'Zayıf', 'Orta', 'İyi', 'Çok İyi', 'Mükemmel'];
      const starsStr = '*'.repeat(data.rating || 4);
      const msg = `Merhaba ${student?.parentName || ''},\n\n*Ders Degerlendirmesi*\nOgrenci: ${lesson.studentName}\nKonu: ${lesson.subject || '-'}\nTarih: ${lesson.date}\n\nPerformans (${data.rating}/5 - ${ratingLabels[data.rating] || ''})\nKatilim: ${data.attendance}${data.topicsCovered ? '\nIslenen Konular: ' + data.topicsCovered : ''}${data.generalNote ? '\nGenel Not: ' + data.generalNote : ''}${data.homework ? '\nOdev: ' + data.homework : ''}${data.nextGoal ? '\nSonraki Hedef: ' + data.nextGoal : ''}\n\nIyi gunler.`;
      setWhatsapp({ phone, message: msg });
    } else {
      onSaved?.();
      onClose();
    }
  };

  const inp = {
    width: '100%', background: '#f8fafc', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', padding: '0.65rem 0.875rem', fontSize: '0.875rem',
    color: '#111827', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
    resize: 'vertical',
  };

  if (whatsapp) {
    return <WhatsAppMessageModal phone={whatsapp.phone} message={whatsapp.message} onClose={() => { onSaved?.(); onClose(); }} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>Ders Değerlendirmesi</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.2rem' }}>{lesson.studentName} · {lesson.date} · {lesson.startTime}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color='#6b7280' />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Rating */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>PERFORMANS PUANI</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                  <Star size={28} fill={n <= form.rating ? '#f59e0b' : 'none'} color={n <= form.rating ? '#f59e0b' : '#d1d5db'} />
                </button>
              ))}
              <span style={{ color: '#6b7280', fontSize: '0.85rem', alignSelf: 'center', marginLeft: '0.4rem' }}>
                {['', 'Zayıf', 'Orta', 'İyi', 'Çok İyi', 'Mükemmel'][form.rating]}
              </span>
            </div>
          </div>

          {/* Attendance */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>KATILIM</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['katıldı', 'geç kaldı', 'katılmadı'].map(opt => (
                <button key={opt} onClick={() => setForm(f => ({ ...f, attendance: opt }))}
                  style={{
                    border: `1.5px solid ${form.attendance === opt ? '#4f46e5' : '#e5e7eb'}`,
                    background: form.attendance === opt ? '#eef2ff' : 'white',
                    color: form.attendance === opt ? '#4338ca' : '#6b7280',
                    borderRadius: '10px', padding: '0.4rem 0.85rem', fontSize: '0.8rem',
                    fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>İŞLENEN KONULAR</label>
            <textarea value={form.topicsCovered} onChange={e => setForm(f => ({ ...f, topicsCovered: e.target.value }))}
              placeholder="Bu derste işlenen konuları yazın..." rows={2} style={inp} />
          </div>

          {/* General note */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>GENEL DEĞERLENDİRME</label>
            <textarea value={form.generalNote} onChange={e => setForm(f => ({ ...f, generalNote: e.target.value }))}
              placeholder="Öğrencinin genel durumu hakkında not..." rows={3} style={inp} />
          </div>

          {/* Strengths + Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>💪 GÜÇLÜ YÖNLER</label>
              <textarea value={form.strengths} onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))}
                placeholder="İyi yaptığı şeyler..." rows={3} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>📈 GELİŞİM ALANLARI</label>
              <textarea value={form.improvements} onChange={e => setForm(f => ({ ...f, improvements: e.target.value }))}
                placeholder="Geliştirilmesi gerekenler..." rows={3} style={inp} />
            </div>
          </div>

          {/* Homework + Next Goal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>📝 VERİLEN ÖDEV</label>
              <textarea value={form.homework} onChange={e => setForm(f => ({ ...f, homework: e.target.value }))}
                placeholder="Ödev detayları..." rows={2} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>🎯 SONRAKİ DERS HEDEFİ</label>
              <textarea value={form.nextGoal} onChange={e => setForm(f => ({ ...f, nextGoal: e.target.value }))}
                placeholder="Bir sonraki dersin hedefi..." rows={2} style={inp} />
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
            {existing ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}