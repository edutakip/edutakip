import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, ChevronRight, ChevronLeft, User, CreditCard, Calendar, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const GRADES = ['İlkokul (1-4)', 'Ortaokul (5-8)', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Üniversite', 'Yetişkin'];

const STEPS = [
  { num: 1, label: 'Temel Bilgiler', icon: User },
  { num: 2, label: 'Veli & İletişim', icon: User },
  { num: 3, label: 'Ders Programı', icon: Calendar },
  { num: 4, label: 'Kaynaklar & Bakiye', icon: CreditCard },
];

const inp = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
  color: '#ffffff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.15s',
};
const lbl = { fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const selStyle = { ...inp, appearance: 'none', cursor: 'pointer' };

function Field({ label, children }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
      <Icon size={15} color='#f97316' />
      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</span>
    </div>
  );
}

export default function AddStudentModal({ onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingLessons, setExistingLessons] = useState([]);
  const [form, setForm] = useState({
    name: '', grade: '', subject: '', hourlyFee: '', lessonDuration: 60,
    parentName: '', parentPhone: '', parentEmail: '',
    schedule: [], // [{day: 0, time: '16:00'}]
    notes: '',
    resourceName: '', initialBalance: '', initialBalanceType: 'borc',
  });

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    base44.auth.me().then(me =>
      base44.entities.Lesson.filter({ teacherEmail: me.email }).then(setExistingLessons)
    );
  }, []);

  const toggleScheduleSlot = (day, time) => {
    const exists = form.schedule.find(s => s.day === day && s.time === time);
    if (exists) {
      u('schedule', form.schedule.filter(s => !(s.day === day && s.time === time)));
    } else {
      u('schedule', [...form.schedule, { day, time }]);
    }
  };

  const getLessonsForSlot = (dayIdx, time) => {
    return existingLessons.filter(l => {
      try {
        const d = parseISO(l.date);
        const dow = (d.getDay() + 6) % 7; // Mon=0
        return dow === dayIdx && l.startTime?.startsWith(time.slice(0, 5));
      } catch { return false; }
    });
  };

  const save = async () => {
    if (!form.name) return;
    setLoading(true);
    const me = await base44.auth.me();
    const weeklyLessons = form.schedule.length || 1;
    const feePerLesson = Number(form.hourlyFee) || 0;
    const lessonDuration = Number(form.lessonDuration) || 60;
    const monthlyFee = Math.round(feePerLesson * weeklyLessons * 4.3);

    const student = await base44.entities.Student.create({
      name: form.name, grade: form.grade, subject: form.subject,
      feePerLesson, lessonDuration, weeklyLessons, monthlyFee,
      schedule: form.schedule,
      parentName: form.parentName, parentPhone: form.parentPhone, parentEmail: form.parentEmail,
      resourceName: form.resourceName, notes: form.notes,
      initialBalance: Number(form.initialBalance) || 0,
      initialBalanceType: form.initialBalanceType,
      teacherEmail: me.email,
      inviteCode: generateCode(), inviteAccepted: false, status: 'active',
    });

    // Başlangıç bakiyesi varsa ödeme kaydı oluştur
    if (form.initialBalance && Number(form.initialBalance) > 0) {
      await base44.entities.Payment.create({
        studentId: student.id,
        studentName: form.name,
        teacherEmail: me.email,
        amount: Number(form.initialBalance),
        date: format(new Date(), 'yyyy-MM-dd'),
        status: form.initialBalanceType === 'kredi' ? 'alındı' : 'bekliyor',
        description: 'Başlangıç bakiyesi',
        month: format(new Date(), 'yyyy-MM'),
      });
    }

    setLoading(false);
    onSaved(); onClose();
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 0;
    return true;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'linear-gradient(145deg, #1a1535, #1e1b4b)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '800' }}>Yeni Öğrenci Ekle</h2>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => s.num < step && setStep(s.num)}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem',
                  background: step === s.num ? '#f97316' : step > s.num ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                  color: step === s.num ? 'white' : step > s.num ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
                  border: step === s.num ? '2px solid #f97316' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>{s.num}</div>
                <span style={{ fontSize: '0.65rem', color: step === s.num ? '#f97316' : 'rgba(255,255,255,0.35)', fontWeight: step === s.num ? '700' : '400', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: step > s.num ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', margin: '0 0.5rem', marginBottom: '1.2rem', transition: 'background 0.2s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Temel Bilgiler */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <SectionTitle icon={User} title="Kimlik Bilgileri" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Öğrenci Adı Soyadı *">
                    <input style={inp} placeholder="Ad Soyad" value={form.name} onChange={e => u('name', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                </div>
                <Field label="Sınıf Seviyesi">
                  <select style={selStyle} value={form.grade} onChange={e => u('grade', e.target.value)}>
                    <option value="">Seçin...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Ders Konusu">
                  <input style={inp} placeholder="Matematik, Fizik..." value={form.subject} onChange={e => u('subject', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
              </div>
            </div>
            <div>
              <SectionTitle icon={CreditCard} title="Ders & Ücret" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Field label="Ders Saat Ücreti (₺)">
                  <input style={inp} type="number" placeholder="0" value={form.hourlyFee} onChange={e => u('hourlyFee', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  <p style={{ marginTop: '0.3rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Belirlenen ders süresi başına</p>
                  <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem' }}>
                    {[500, 750, 1000].map(v => (
                      <button key={v} onClick={() => u('hourlyFee', v)}
                        style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer' }}>
                        {v}₺
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Ders Süresi (dk)">
                  <input style={inp} type="number" placeholder="60" value={form.lessonDuration} onChange={e => u('lessonDuration', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem' }}>
                    {[45, 60, 90].map(v => (
                      <button key={v} onClick={() => u('lessonDuration', v)}
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer' }}>
                        {v}dk
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              {form.hourlyFee > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', color: '#34d399', fontSize: '0.78rem', fontWeight: '600' }}>
                  Tahmini aylık gelir: ₺{Math.round(Number(form.hourlyFee) * (form.schedule.length || 1) * 4.3).toLocaleString('tr-TR')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Veli & İletişim */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <SectionTitle icon={User} title="Veli Bilgileri" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Veli Adı Soyadı">
                    <input style={inp} placeholder="Veli adı soyadı" value={form.parentName} onChange={e => u('parentName', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                </div>
                <Field label="Veli Telefon">
                  <input style={inp} placeholder="05XX XXX XXXX" value={form.parentPhone} onChange={e => u('parentPhone', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
                <Field label="Veli E-posta">
                  <input style={inp} type="email" placeholder="veli@mail.com" value={form.parentEmail} onChange={e => u('parentEmail', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
              </div>
            </div>
            <div>
              <SectionTitle icon={BookOpen} title="Notlar" />
              <textarea style={{ ...inp, resize: 'vertical', minHeight: '90px' }} placeholder="Öğrenci hakkında notlar..."
                value={form.notes} onChange={e => u('notes', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </div>
          </div>
        )}

        {/* Step 3: Ders Programı */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SectionTitle icon={Calendar} title="Haftalık Ders Programı" />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '-0.75rem' }}>Seçili günler yeni öğrencinin ders saatleri. Gri hücreler mevcut derslerinizi gösterir.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr>
                    <th style={{ color: 'rgba(255,255,255,0.3)', padding: '0.4rem', textAlign: 'left', fontWeight: '600' }}>Saat</th>
                    {DAYS.map((d, i) => (
                      <th key={i} style={{ color: 'rgba(255,255,255,0.5)', padding: '0.4rem', textAlign: 'center', fontWeight: '700' }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIMES.map(time => (
                    <tr key={time}>
                      <td style={{ color: 'rgba(255,255,255,0.35)', padding: '0.25rem 0.4rem', whiteSpace: 'nowrap' }}>{time}</td>
                      {DAYS.map((_, di) => {
                        const occupied = getLessonsForSlot(di, time);
                        const selected = form.schedule.find(s => s.day === di && s.time === time);
                        return (
                          <td key={di} style={{ padding: '0.2rem' }}>
                            <div onClick={() => !occupied.length && toggleScheduleSlot(di, time)}
                              title={occupied.length ? occupied.map(l => l.studentName).join(', ') : ''}
                              style={{
                                width: '100%', minWidth: '34px', height: '26px', borderRadius: '6px', cursor: occupied.length ? 'not-allowed' : 'pointer',
                                background: selected ? '#f97316' : occupied.length ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                                border: selected ? '1.5px solid #f97316' : occupied.length ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                              {occupied.length > 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }} />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {form.schedule.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px' }}>
                <div style={{ color: '#fb923c', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>Seçilen saatler:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {form.schedule.map((s, i) => (
                    <span key={i} style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', color: '#fdba74', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '600' }}>
                      {DAY_FULL[s.day]} {s.time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Kaynaklar & Bakiye */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <SectionTitle icon={BookOpen} title="Kaynaklar" />
              <Field label="Kullanılan Kaynak / Kitap">
                <input style={inp} placeholder="Ör: Palme Yayınları, Karekök..." value={form.resourceName} onChange={e => u('resourceName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
            </div>
            <div>
              <SectionTitle icon={CreditCard} title="Başlangıç Bakiyesi" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Field label="Tutar (₺)">
                  <input style={inp} type="number" placeholder="0" value={form.initialBalance} onChange={e => u('initialBalance', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
                <Field label="Tür">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[{ val: 'borc', label: 'Borç', color: '#f87171', activeBg: 'rgba(239,68,68,0.2)', activeBorder: '#f87171' },
                      { val: 'kredi', label: 'Kredi', color: '#34d399', activeBg: 'rgba(16,185,129,0.2)', activeBorder: '#34d399' }].map(opt => (
                      <button key={opt.val} onClick={() => u('initialBalanceType', opt.val)}
                        style={{
                          flex: 1, padding: '0.65rem', borderRadius: '10px', border: `1.5px solid ${form.initialBalanceType === opt.val ? opt.activeBorder : 'rgba(255,255,255,0.1)'}`,
                          background: form.initialBalanceType === opt.val ? opt.activeBg : 'rgba(255,255,255,0.04)',
                          color: form.initialBalanceType === opt.val ? opt.color : 'rgba(255,255,255,0.35)',
                          fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                        }}>{opt.label}</button>
                    ))}
                  </div>
                </Field>
              </div>
              {form.initialBalance > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: form.initialBalanceType === 'borc' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${form.initialBalanceType === 'borc' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '10px', color: form.initialBalanceType === 'borc' ? '#f87171' : '#34d399', fontSize: '0.78rem', fontWeight: '600' }}>
                  {form.initialBalanceType === 'borc' ? `Öğrenci ₺${form.initialBalance} borçla başlayacak` : `Öğrenci ₺${form.initialBalance} alacakla başlayacak`}
                </div>
              )}
            </div>

            {/* Özet */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Özet</div>
              {[
                { label: 'Öğrenci', value: form.name },
                { label: 'Sınıf', value: form.grade },
                { label: 'Ders', value: form.subject },
                { label: 'Ders Saat Ücreti', value: form.hourlyFee ? `₺${form.hourlyFee}` : '-' },
                { label: 'Haftalık Ders', value: `${form.schedule.length || 0} ders` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', fontWeight: '600' }}>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '0.75rem' }}>
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
            {step === 1 ? 'İptal' : <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ChevronLeft size={15} /> Geri</span>}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', border: 'none', background: canNext() ? '#f97316' : 'rgba(255,255,255,0.1)', color: canNext() ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: '700', fontSize: '0.875rem', cursor: canNext() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s' }}>
              Devam <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={save} disabled={loading || !form.name}
              style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}>
              {loading ? <><Loader2 size={15} className='animate-spin' /> Ekleniyor...</> : 'Öğrenci Ekle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}