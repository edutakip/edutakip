import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { X, Edit2, Save, Phone, Mail, BookOpen, Calendar, DollarSign, Archive, ArchiveRestore, Loader2, User, Clock, ChevronRight, History, Send, CheckCircle, Clock3 } from 'lucide-react';
import PaymentHistoryModal from './PaymentHistoryModal';
import ScheduleSlotEditor from './ScheduleSlotEditor';
import { useTranslation } from 'react-i18next';
import StudentGamification from '../gamification/StudentGamification';
import { sendParentInviteEmail } from '@/lib/parentInviteEmail';

const DAYS_FULL_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAYS_FULL_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GRADES = ['İlkokul (1-4)', 'Ortaokul (5-8)', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Üniversite', 'Yetişkin'];

function useWindowSize() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

const inp = {
  width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
  color: '#ffffff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.15s',
};
const lbl = { fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Icon size={14} color='#f97316' />
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

export default function StudentDetailModal({ student, onClose, onSaved }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const DAYS_FULL = isEn ? DAYS_FULL_EN : DAYS_FULL_TR;
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [reports, setReports] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [form, setForm] = useState({ ...student });
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const isMobile = useWindowSize() < 640;

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    base44.entities.Payment.filter({ studentId: student.id }).then(setPayments);
    base44.entities.Lesson.filter({ studentId: student.id }).then(ls =>
      setLessons(ls.sort((a, b) => b.date?.localeCompare(a.date)).slice(0, 10))
    );
    base44.entities.LessonReport.filter({ studentId: student.id }).then(setReports);
    base44.entities.Homework.filter({ studentId: student.id }).then(setHomeworks);
  }, [student.id]);

  // Yaramaz popup fix
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const earned = payments.filter(p => p.status === 'bekliyor').reduce((s, p) => s + (p.amount || 0), 0);
  const collected = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const balance = collected - earned;

  const save = async () => {
    setLoading(true);
    await base44.entities.Student.update(student.id, {
      name: form.name, grade: form.grade, subject: form.subject,
      phone: form.phone, feePerLesson: Number(form.feePerLesson) || 0,
      lessonDuration: Number(form.lessonDuration) || 60,
      weeklyLessons: Number(form.weeklyLessons) || 1,
      parentName: form.parentName, parentPhone: form.parentPhone, parentEmail: form.parentEmail,
      resourceName: form.resourceName, notes: form.notes,
    });
    setLoading(false);
    setEditing(false);
    onSaved();
  };

  const sendInvite = async () => {
    if (!student.parentEmail) return;
    setInviteSending(true);
    try {
      const me = await base44.auth.me();
      const teacherName = me.full_name || me.email;
      const isEn = i18n.language === 'en';

      // 1. Hesap oluştur (platform şifre belirleme e-postası gönderir)
      await base44.users.inviteUser(student.parentEmail, 'user');

      // 2. Marka uyumlu, dil duyarlı davet e-postası gönder
      try {
        await sendParentInviteEmail({
          parentEmail: student.parentEmail,
          teacherName,
          studentName: student.name,
          parentName: student.parentName,
          inviteCode: student.inviteCode,
          isEn,
        });
      } catch (emailErr) {
        console.warn('Özel e-posta gönderilemedi, platform e-postası yine de gitti:', emailErr);
      }

      await base44.entities.Student.update(student.id, { parentInviteSent: true });
      setInviteSent(true);
    } catch (e) {
      console.error('Davet gönderilemedi:', e);
    }
    setInviteSending(false);
  };

  const toggleArchive = async () => {
    setLoading(true);
    await base44.entities.Student.update(student.id, { status: student.status === 'active' ? 'archived' : 'active' });
    setLoading(false);
    onSaved();
    onClose();
  };

  const statusColors = { tamamlandı: '#22c55e', planlandı: '#f59e0b', iptal: '#ef4444' };
  const statusLabels = isEn
    ? { tamamlandı: 'Completed', planlandı: 'Planned', iptal: 'Cancelled' }
    : { tamamlandı: 'Tamamlandı', planlandı: 'Planlandı', iptal: 'İptal' };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '1rem', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'linear-gradient(145deg, #1a1535, #1e1b4b)', borderRadius: isMobile ? '20px 20px 0 0' : '20px', width: '100%', maxWidth: isMobile ? '100%' : '680px', maxHeight: isMobile ? '92vh' : '92vh', height: isMobile ? '92vh' : 'auto', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: isMobile ? '1rem 1.1rem' : '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'linear-gradient(145deg, #1a1535, #1e1b4b)', zIndex: 10, borderRadius: isMobile ? '20px 20px 0 0' : '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: isMobile ? '38px' : '46px', height: isMobile ? '38px' : '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: isMobile ? '0.95rem' : '1.1rem', color: 'white', flexShrink: 0 }}>
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ color: '#ffffff', fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: '800' }}>{student.name}</h2>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {student.grade && <span style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.55)', fontSize: '0.6rem', fontWeight: '600', padding: '0.12rem 0.45rem', borderRadius: '5px' }}>{student.grade}</span>}
                <span style={{ border: `1px solid ${student.status === 'active' ? '#22c55e' : '#9ca3af'}`, color: student.status === 'active' ? '#22c55e' : '#9ca3af', fontSize: '0.6rem', fontWeight: '700', padding: '0.12rem 0.45rem', borderRadius: '5px' }}>
                  {student.status === 'active' ? (isEn ? '● Active' : '● Aktif') : (isEn ? '● Archived' : '● Arşiv')}
                </span>
                {/* Mobil: butonlar ismin yanında */}
                {isMobile && !editing && (
                  <>
                    <button onClick={() => setShowPaymentHistory(true)}
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '7px', padding: '0.2rem 0.5rem', fontWeight: '700', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <History size={10} /> {isEn ? 'History' : 'Geçmiş'}
                    </button>
                    <button onClick={() => setEditing(true)}
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '7px', padding: '0.2rem 0.5rem', fontWeight: '700', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Edit2 size={10} /> {isEn ? 'Edit' : 'Düzenle'}
                    </button>
                  </>
                )}
                {isMobile && editing && (
                  <>
                    <button onClick={() => { setEditing(false); setForm({ ...student }); }}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '7px', padding: '0.2rem 0.5rem', fontWeight: '700', fontSize: '0.65rem', cursor: 'pointer' }}>
                      {isEn ? 'Cancel' : 'İptal'}
                    </button>
                    <button onClick={save} disabled={loading}
                      style={{ background: '#4f46e5', border: 'none', color: 'white', borderRadius: '7px', padding: '0.2rem 0.5rem', fontWeight: '700', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {loading ? <Loader2 size={10} className='animate-spin' /> : <Save size={10} />} {isEn ? 'Save' : 'Kaydet'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {/* Masaüstü/tablet: butonlar header'da */}
            {!isMobile && !editing && (
              <button onClick={() => setShowPaymentHistory(true)}
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '9px', padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <History size={12} /> Geçmiş
              </button>
            )}
            {!isMobile && (!editing ? (
              <button onClick={() => setEditing(true)}
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '9px', padding: '0.5rem 1rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Edit2 size={12} /> {isEn ? 'Edit' : 'Düzenle'}
              </button>
            ) : (
              <>
                <button onClick={() => { setEditing(false); setForm({ ...student }); }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '9px', padding: '0.4rem 0.65rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {isEn ? 'Cancel' : 'İptal'}
                </button>
                <button onClick={save} disabled={loading}
                  style={{ background: '#4f46e5', border: 'none', color: 'white', borderRadius: '9px', padding: '0.4rem 0.65rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {loading ? <Loader2 size={12} className='animate-spin' /> : <Save size={12} />} {isEn ? 'Save' : 'Kaydet'}
                </button>
              </>
            ))}
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? '1rem' : '1.75rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0' : '1.5rem' }}>

          {/* LEFT */}
          <div>
            {!editing ? (
              <>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '0.5rem' : '0.6rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                  {[
                    { label: isEn ? 'Hourly Fee' : 'Ders Saat Ücreti', value: `₺${(student.feePerLesson || 0).toLocaleString()}`, color: '#818cf8', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
                    { label: isEn ? 'Duration' : 'Ders Süresi', value: `${student.lessonDuration || 60} ${isEn ? 'min' : 'dk'}`, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
                    { label: isEn ? 'Weekly' : 'Haftalık Ders', value: `${student.weeklyLessons || 0}`, color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
                    { label: isEn ? 'Total Lessons' : 'Toplam Ders', value: `${lessons.length}+`, color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)' },
                  ].map(({ label, value, color, bg, border }) => (
                    <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: isMobile ? '0.65rem 0.75rem' : '0.75rem' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ color, fontWeight: '800', fontSize: isMobile ? '1.1rem' : '1rem' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <Section title={isEn ? "Basic Info" : "Temel Bilgiler"} icon={User}>
                  <InfoRow label={isEn ? "Grade" : "Sınıf"} value={student.grade} />
                  <InfoRow label={isEn ? "Subject" : "Ders Konusu"} value={student.subject} />
                  <InfoRow label={isEn ? "Phone" : "Telefon"} value={student.phone} />
                  <InfoRow label={isEn ? "Resource" : "Kaynak"} value={student.resourceName} />
                </Section>

                <Section title={isEn ? "Parent & Contact" : "Veli & İletişim"} icon={Phone}>
                  <InfoRow label={isEn ? "Parent Name" : "Veli Adı"} value={student.parentName} />
                  <InfoRow label={isEn ? "Parent Phone" : "Veli Telefon"} value={student.parentPhone} />
                  <InfoRow label={isEn ? "Parent Email" : "Veli E-posta"} value={student.parentEmail} />
                </Section>

                {student.schedule?.length > 0 && (
                  <Section title={isEn ? "Schedule" : "Ders Programı"} icon={Calendar}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginBottom: '0.6rem' }}>{isEn ? 'Click a time to edit' : 'Saate tıklayarak düzenleyebilirsiniz'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {student.schedule.map((s, i) => (
                        <span key={i}
                          onClick={() => setEditingSlot({ slot: s, slotIndex: i })}
                          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fdba74', fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '7px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.3)'; e.currentTarget.style.borderColor = '#f97316'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.15)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}>
                          ✏️ {DAYS_FULL[s.day]} {s.time}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {student.notes && (
                  <Section title={isEn ? "Notes" : "Notlar"} icon={BookOpen}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.6 }}>{student.notes}</p>
                  </Section>
                )}
              </>
            ) : (
              /* EDIT FORM */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label={isEn ? "Full Name *" : "Ad Soyad *"}>
                      <input style={inp} value={form.name || ''} onChange={e => u('name', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </Field>
                  </div>
                  <Field label={isEn ? "Grade" : "Sınıf"}>
                    <select style={{ ...inp, appearance: 'none' }} value={form.grade || ''} onChange={e => u('grade', e.target.value)}>
                      <option value="">{isEn ? 'Select' : 'Seçin'}</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label={isEn ? "Subject" : "Konu"}>
                    <input style={inp} value={form.subject || ''} onChange={e => u('subject', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Phone" : "Telefon"}>
                    <input style={inp} value={form.phone || ''} onChange={e => u('phone', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Hourly Fee (₺)" : "Ders Saat Ücreti (₺)"}>
                    <input style={inp} type="number" value={form.feePerLesson || ''} onChange={e => u('feePerLesson', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Duration (min)" : "Ders Süresi (dk)"}>
                    <input style={inp} type="number" value={form.lessonDuration || 60} onChange={e => u('lessonDuration', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Weekly Lessons" : "Haftalık Ders Sayısı"}>
                    <input style={inp} type="number" min="1" value={form.weeklyLessons || 1} onChange={e => u('weeklyLessons', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Parent Name" : "Veli Adı"}>
                    <input style={inp} value={form.parentName || ''} onChange={e => u('parentName', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <Field label={isEn ? "Parent Phone" : "Veli Telefon"}>
                    <input style={inp} value={form.parentPhone || ''} onChange={e => u('parentPhone', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </Field>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label={isEn ? "Parent Email" : "Veli E-posta"}>
                      <input style={inp} type="email" value={form.parentEmail || ''} onChange={e => u('parentEmail', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </Field>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label={isEn ? "Resource" : "Kaynak"}>
                      <input style={inp} value={form.resourceName || ''} onChange={e => u('resourceName', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </Field>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label={isEn ? "Notes" : "Notlar"}>
                      <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' }} value={form.notes || ''} onChange={e => u('notes', e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </Field>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ marginTop: isMobile ? '0.25rem' : '0' }}>
            {isMobile && <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.75rem 0 1rem' }} />}
            {/* Finance Summary */}
            <Section title={isEn ? "Financial Summary" : "Finansal Özet"} icon={DollarSign}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: isEn ? 'Earned' : 'Hak Edilen', value: `₺${earned.toLocaleString('tr-TR')}`, color: 'rgba(255,255,255,0.7)' },
                  { label: isEn ? 'Collected' : 'Tahsil Edilen', value: `₺${collected.toLocaleString('tr-TR')}`, color: '#22c55e' },
                  { label: isEn ? 'Balance' : 'Bakiye', value: `${balance < 0 ? '-' : '+'}₺${Math.abs(balance).toLocaleString('tr-TR')}`, color: balance < 0 ? '#f87171' : '#22c55e' },
                ].map(({ label, value, color }, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{label}</span>
                    <span style={{ color, fontWeight: '700', fontSize: '0.85rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Veli Davet */}
            <Section title={isEn ? "Parent Invite" : "Veli Daveti"} icon={Mail}>
              {!student.parentEmail ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{isEn ? 'No parent email — add one via Edit.' : 'Veli e-postası yok — Düzenle ile ekleyin.'}</p>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {student.inviteAccepted ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: '700', color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '0.25rem 0.6rem', borderRadius: '7px' }}>
                        <CheckCircle size={12} /> {isEn ? 'Accepted' : 'Kabul Edildi'}
                      </span>
                    ) : (student.parentInviteSent || inviteSent) ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '0.25rem 0.6rem', borderRadius: '7px' }}>
                        <Clock3 size={12} /> {isEn ? 'Pending' : 'Bekliyor'}
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', background: 'rgba(156,163,175,0.12)', border: '1px solid rgba(156,163,175,0.3)', padding: '0.25rem 0.6rem', borderRadius: '7px' }}>
                        <Mail size={12} /> {isEn ? 'Not Sent' : 'Davet Yok'}
                      </span>
                    )}
                  </div>
                  <button onClick={sendInvite} disabled={inviteSending || student.inviteAccepted}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: student.inviteAccepted ? 0.5 : 1 }}>
                    {inviteSending ? <Loader2 size={13} className='animate-spin' /> : <Send size={13} />}
                    {(student.parentInviteSent || inviteSent) && !student.inviteAccepted
                      ? (isEn ? 'Resend Invite' : 'Yeniden Davet Gönder')
                      : (isEn ? 'Send Invite' : 'Davet Gönder')}
                  </button>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {isEn ? 'Parent will receive an email to set their password and auto-connect on login.' : 'Veli e-posta alır, şifresini belirler ve giriş yapınca otomatik bağlanır.'}
                  </p>
                </>
              )}
            </Section>

            {/* Son Dersler */}
            <Section title={isEn ? "Recent Lessons" : "Son Dersler"} icon={Clock}>
              {lessons.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{isEn ? 'No lessons yet' : 'Henüz ders yok'}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {lessons.slice(0, 6).map(l => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: '600' }}>{l.date}</div>
                        {l.subject && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>{l.subject}</div>}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '5px', background: `${statusColors[l.status]}22`, color: statusColors[l.status] || 'rgba(255,255,255,0.4)', border: `1px solid ${statusColors[l.status]}44` }}>
                        {statusLabels[l.status] || l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Gamification */}
            <Section title={isEn ? "Gamification" : "Başarı & Puanlar"} icon={ChevronRight}>
              <StudentGamification reports={reports} homeworks={homeworks} studentName="" />
            </Section>

            {/* Archive */}
            <button onClick={toggleArchive} disabled={loading}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: `1px solid ${student.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, background: student.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: student.status === 'active' ? '#f87171' : '#34d399', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {student.status === 'active' ? <><Archive size={13} /> {isEn ? 'Archive' : 'Arşivle'}</> : <><ArchiveRestore size={13} /> {isEn ? 'Activate' : 'Aktife Al'}</>}
            </button>
            </div>
            </div>
            </div>

            {showPaymentHistory && (
            <PaymentHistoryModal student={student} onClose={() => setShowPaymentHistory(false)} />
            )}
            {editingSlot && (
            <ScheduleSlotEditor
              student={student}
              slot={editingSlot.slot}
              slotIndex={editingSlot.slotIndex}
              onClose={() => setEditingSlot(null)}
              onSaved={() => { setEditingSlot(null); onSaved(); onClose(); }}
            />
            )}
            </div>
  , document.body);
}