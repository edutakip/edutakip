import React, { useState } from 'react';
import { X, Check, Loader2, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';

const DAYS_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];

const inp = {
  width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
  color: '#ffffff', fontSize: '0.875rem', outline: 'none',
};

export default function ScheduleSlotEditor({ student, slot, slotIndex, onClose, onSaved }) {
  const [day, setDay] = useState(slot.day);
  const [time, setTime] = useState(slot.time);
  const [step, setStep] = useState('edit'); // 'edit' | 'confirm'
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setStep('confirm');
  };

  const apply = async (updateFuture) => {
    setLoading(true);
    // Update student schedule
    const newSchedule = student.schedule.map((s, i) =>
      i === slotIndex ? { day, time } : s
    );
    await base44.entities.Student.update(student.id, {
      schedule: newSchedule,
      weeklyLessons: newSchedule.length,
    });

    if (updateFuture) {
      // Find future lessons matching old slot
      const today = format(new Date(), 'yyyy-MM-dd');
      const lessons = await base44.entities.Lesson.filter({ studentId: student.id });
      const futureLessons = lessons.filter(l => {
        if (!l.date || l.date < today) return false;
        try {
          const d = parseISO(l.date);
          const dow = (d.getDay() + 6) % 7; // Mon=0
          return dow === slot.day && l.startTime === slot.time;
        } catch { return false; }
      });

      for (const lesson of futureLessons) {
        // Calculate new date (same week offset but different day)
        const lessonDate = parseISO(lesson.date);
        const lessonDow = (lessonDate.getDay() + 6) % 7;
        const dayDiff = day - lessonDow;
        const newDate = new Date(lessonDate);
        newDate.setDate(newDate.getDate() + dayDiff);

        // Calculate new end time
        const duration = lesson.duration || student.lessonDuration || 60;
        const startH = parseInt(time.slice(0, 2));
        const startM = parseInt(time.slice(3, 5));
        const endTotal = startH * 60 + startM + duration;
        const endTime = `${String(Math.floor(endTotal / 60)).padStart(2,'0')}:${String(endTotal % 60).padStart(2,'0')}`;

        await base44.entities.Lesson.update(lesson.id, {
          date: format(newDate, 'yyyy-MM-dd'),
          startTime: time,
          endTime,
        });
      }
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'linear-gradient(145deg, #1a1535, #1e1b4b)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '380px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>

        {step === 'edit' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Ders Saatini Düzenle</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Gün</label>
              <select style={{ ...inp, appearance: 'none', cursor: 'pointer' }} value={day} onChange={e => setDay(Number(e.target.value))}>
                {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Saat</label>
              <select style={{ ...inp, appearance: 'none', cursor: 'pointer' }} value={time} onChange={e => setTime(e.target.value)}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>İptal</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', background: '#f97316', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Check size={14} /> Devam
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CalendarDays size={24} color='#a5b4fc' />
              </div>
              <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1rem', marginBottom: '0.5rem' }}>Gelecek Dersler Güncellensin mi?</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                <span style={{ color: '#fdba74', fontWeight: '700' }}>{DAYS_FULL[slot.day]} {slot.time}</span> →{' '}
                <span style={{ color: '#86efac', fontWeight: '700' }}>{DAYS_FULL[day]} {time}</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Bu öğrencinin planlanmış gelecek dersleri de bu yeni gün ve saate taşınsın mı?</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => apply(true)} disabled={loading}
                style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />} Evet, Gelecek Dersleri de Güncelle
              </button>
              <button onClick={() => apply(false)} disabled={loading}
                style={{ padding: '0.75rem', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                Hayır, Sadece Programı Güncelle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}