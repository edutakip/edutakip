import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WhatsAppMessageModal from './WhatsAppMessageModal';
import { isPro } from '@/lib/subscription';
import ProUpgradeModal from '../ProUpgradeModal';

// STEPS is now dynamic, defined inside component

const RATING_LABELS_TR = { 1: 'Zayıf', 2: 'Orta', 3: 'İyi', 4: 'Çok İyi', 5: 'Mükemmel' };
const RATING_LABELS_EN = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

// CHOICES is now dynamic, defined inside component

function ChoiceGroup({ label, field, value, onChange, CHOICES }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(CHOICES[field] || []).map(opt => (
          <button key={opt.v} onClick={() => onChange(opt.v)}
            style={{ padding: '0.5rem 1rem', borderRadius: 10, border: `1.5px solid ${value === opt.v ? '#4f46e5' : '#e5e7eb'}`, background: value === opt.v ? '#eef2ff' : 'white', color: value === opt.v ? '#4338ca' : '#6b7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {opt.icon} {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({ value, onChange, label, ratingLabels }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', fontSize: '1.75rem', lineHeight: 1, transition: 'transform 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            {n <= value ? '⭐' : '☆'}
          </button>
        ))}
        {value > 0 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginLeft: '0.25rem' }}>{ratingLabels[value]}</span>}
      </div>
    </div>
  );
}

export default function LessonReportModal({ lesson, onClose, onSaved }) {
  const { t, i18n } = useTranslation();
  const isEn = !i18n.language?.startsWith('tr');
  const RATING_LABELS = isEn ? RATING_LABELS_EN : RATING_LABELS_TR;
  const STEPS = [t('teacher.lessonReport.step1'), t('teacher.lessonReport.step2'), t('teacher.lessonReport.step3'), t('teacher.lessonReport.step4')];
  const CHOICES = {
    understood:   [{ v: 'tam', l: t('teacher.lessonReport.fullyUnderstood'), icon: '✅' }, { v: 'kismen', l: t('teacher.lessonReport.partiallyUnderstood'), icon: '🔶' }, { v: 'tekrar', l: t('teacher.lessonReport.needsReview'), icon: '🔁' }],
    participation:[{ v: 'aktif', l: t('teacher.lessonReport.activeParticipation'), icon: '🙋' }, { v: 'orta', l: t('teacher.lessonReport.mediumParticipation'), icon: '😐' }, { v: 'pasif', l: t('teacher.lessonReport.passive'), icon: '😶' }],
    motivation:   [{ v: 'yuksek', l: t('teacher.lessonReport.high'), icon: '🔥' }, { v: 'normal', l: t('teacher.lessonReport.normal'), icon: '👍' }, { v: 'dusuk', l: t('teacher.lessonReport.low'), icon: '😞' }],
  };
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    topics: '',
    understood: '',
    participation: '',
    motivation: '',
    challenge: '',
    homework: '',
    nextGoal: '',
    rating: 4,
    attendance: 'katıldı',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [existing, setExisting] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    document.body.classList.add('modal-open-hide-fab');
    base44.auth.me().then(setCurrentUser).catch(() => {});
    return () => document.body.classList.remove('modal-open-hide-fab');
  }, []);

  useEffect(() => {
    base44.entities.LessonReport.filter({ lessonId: lesson.id }).then(reports => {
      if (reports.length > 0) {
        const r = reports[0];
        setExisting(r);
        setForm(f => ({
          ...f,
          topics: r.topicsCovered || '',
          homework: r.homework || '',
          nextGoal: r.nextGoal || '',
          rating: r.rating || 4,
          attendance: r.attendance || 'katıldı',
          challenge: r.improvements || '',
          generalNote: r.generalNote || '',
        }));
        // Eski raporu yükleme — kullanıcı yeniden oluştursun
      }
    });
  }, [lesson.id]);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateReport = async () => {
    setGenerating(true);
    setOverlayVisible(true);
    try {
      const understoodMap = { tam: 'tam olarak anladı', kismen: 'konuyu kısmen anladı', tekrar: 'konuyu tekrar gözden geçirmesi gerekiyor' };
      const participationMap = { aktif: 'aktif bir katılım gösterdi', orta: 'orta düzeyde katılım gösterdi', pasif: 'derse pasif olarak katıldı' };
      const motivationMap = { yuksek: 'yüksek', normal: 'normal', dusuk: 'düşük' };
      const ratingStars = '⭐'.repeat(form.rating) + '☆'.repeat(5 - form.rating);

      const prompt = `Sen deneyimli ve pedagojik açıdan güçlü bir özel öğretmensin. Aşağıdaki ders bilgilerine dayanarak veliye gönderilecek profesyonel, sıcak ve pedagojik bir ders değerlendirme raporu yaz.

Ders Bilgileri:
- Öğrenci: ${lesson.studentName}
- Konu: ${lesson.subject || 'Belirtilmemiş'}
- Tarih: ${lesson.date}
- İşlenen Konular: ${form.topics}
- Anlama Düzeyi: ${understoodMap[form.understood] || form.understood}
- Katılım: ${participationMap[form.participation] || form.participation}
- Motivasyon: ${motivationMap[form.motivation] || form.motivation} seviyedeydi
- Performans Puanı: ${form.rating}/5 ${ratingStars}
- Katılım Durumu: ${form.attendance}
${form.challenge ? `- Zorlandığı Nokta: ${form.challenge}` : ''}
${form.homework ? `- Verilen Ödev: ${form.homework}` : ''}
${form.nextGoal ? `- Sonraki Ders Hedefi: ${form.nextGoal}` : ''}

Raporu şu formatta yaz:
1. Giriş cümlesi (bugünkü dersi özetle)
2. Öğrencinin performansını ve katılımını açıkla
3. Varsa zorlandığı noktayı pedagojik bir dille açıkla ve nasıl çalışacağını belirt
4. Ödevi ve sonraki ders hedefini belirt (📚 ve ➡️ emojileriyle)
5. Teşekkür cümlesiyle bitir

Ton: Profesyonel ama sıcak. Türkçe. Veliye hitap et. Madde madde değil, akıcı paragraflar halinde yaz.

ZORUNLU KURALLAR:
- Asla [İsim], [Pozisyon], [Okul] gibi placeholder yazma
- Saygılarımla satırından sonra hiçbir şey ekleme
- Mesajı "Saygılarımla," ile bitir, imza ekleme`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = typeof result === 'string' ? result : result?.text || result?.content || JSON.stringify(result);
      setGeneratedReport(text);
      // Önce generating kapat, success ekranı göster
      setGenerating(false);
      setShowSuccess(true);
      setTimeout(() => {
        setOverlayVisible(false); // CSS opacity transition → solar
        setTimeout(() => {
          setShowSuccess(false);
          setStep(3);             // rapor, overlay DOM'dan kalktıktan sonra açılır
        }, 500);
      }, 1900);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveWithoutReport = async () => {
    const understoodMap = { tam: 'Tam anladı', kismen: 'Kısmen anladı', tekrar: 'Tekrar gerekli' };
    const participationMap = { aktif: 'Aktif katılım', orta: 'Orta katılım', pasif: 'Pasif' };
    const motivationMap = { yuksek: 'Yüksek', normal: 'Normal', dusuk: 'Düşük' };
    const ratingStars = '⭐'.repeat(form.rating);

    const summary = [
      `📚 İşlenen Konular: ${form.topics}`,
      `✅ Anlama: ${understoodMap[form.understood] || form.understood}`,
      `🙋 Katılım: ${participationMap[form.participation] || form.participation}`,
      `🔥 Motivasyon: ${motivationMap[form.motivation] || form.motivation}`,
      `${ratingStars} Performans: ${form.rating}/5`,
      form.challenge ? `⚠️ Zorlandığı Nokta: ${form.challenge}` : '',
      form.homework ? `📖 Ödev: ${form.homework}` : '',
      form.nextGoal ? `➡️ Sonraki Hedef: ${form.nextGoal}` : '',
    ].filter(Boolean).join('\n');

    setGeneratedReport(summary);
    // handleSave tetiklenecek, generatedReport state güncellemesi async olduğu için direkt çağırıyoruz
    setLoading(true);
    const me = await base44.auth.me();
    const data = {
      lessonId: lesson.id, studentId: lesson.studentId,
      studentName: lesson.studentName, teacherEmail: me.email,
      date: lesson.date, subject: lesson.subject,
      rating: form.rating, attendance: form.attendance,
      topicsCovered: form.topics, generalNote: summary,
      improvements: form.challenge, homework: form.homework, nextGoal: form.nextGoal,
    };
    if (existing) await base44.entities.LessonReport.update(existing.id, data);
    else await base44.entities.LessonReport.create(data);

    if (form.homework?.trim()) {
      const existingHws = await base44.entities.Homework.filter({ lessonId: lesson.id });
      if (existingHws.length > 0) {
        await base44.entities.Homework.update(existingHws[0].id, { title: form.homework, description: form.homework });
      } else {
        await base44.entities.Homework.create({ lessonId: lesson.id, studentId: lesson.studentId, studentName: lesson.studentName, teacherEmail: me.email, title: form.homework, description: form.homework, status: 'verildi' });
      }
    }
    setLoading(false);

    const phone = lesson.parentPhone || (await base44.entities.Student.filter({ id: lesson.studentId }).then(s => s[0]?.parentPhone).catch(() => null));
    if (phone) setWhatsapp({ phone, message: summary });
    else { onSaved?.(); onClose(); }
  };

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
      rating: form.rating,
      attendance: form.attendance,
      topicsCovered: form.topics,
      generalNote: generatedReport,
      improvements: form.challenge,
      homework: form.homework,
      nextGoal: form.nextGoal,
    };

    if (existing) {
      await base44.entities.LessonReport.update(existing.id, data);
    } else {
      await base44.entities.LessonReport.create(data);
    }

    if (form.homework?.trim()) {
      const existingHws = await base44.entities.Homework.filter({ lessonId: lesson.id });
      if (existingHws.length > 0) {
        await base44.entities.Homework.update(existingHws[0].id, { title: form.homework, description: form.homework });
      } else {
        await base44.entities.Homework.create({
          lessonId: lesson.id, studentId: lesson.studentId,
          studentName: lesson.studentName, teacherEmail: me.email,
          title: form.homework, description: form.homework, status: 'verildi',
        });
      }
    }

    setLoading(false);

    // Placeholder imzaları temizle
    const cleanReport = generatedReport
      .replace(/\[İsim\]/g, '').replace(/\[Pozisyon\]/g, '')
      .replace(/\[Okul\/Öğretim Kurumu\]/g, '').replace(/\[Okul\]/g, '')
      .replace(/\[İmza\]/g, '').replace(/\[Signature\]/g, '')
      .replace(/\[\w+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();

    const phone = lesson.parentPhone;
    if (phone) {
      setWhatsapp({ phone, message: cleanReport });
    } else {
      try {
        const students = await base44.entities.Student.filter({ id: lesson.studentId });
        const studentPhone = students[0]?.parentPhone;
        if (studentPhone) {
          setWhatsapp({ phone: studentPhone, message: cleanReport });
          return;
        }
      } catch (e) {}
      onSaved?.();
      onClose();
    }
  };

  const inp = {
    width: '100%', background: '#f8fafc', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.875rem',
    color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
  };

  const canNext = () => {
    if (step === 0) return form.topics.trim() && form.attendance;
    if (step === 1) return form.understood && form.participation && form.motivation && form.rating;
    if (step === 2) return true;
    return true;
  };

  if (whatsapp) {
    return <WhatsAppMessageModal phone={whatsapp.phone} message={whatsapp.message} onClose={() => { onSaved?.(); onClose(); }} />;
  }

  return (
    <>
      {/* ── Loading / Success Overlay (tek div, smooth geçiş) ── */}
      {(generating || showSuccess) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2rem',
          background: showSuccess
            ? 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)'
            : 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)',
          opacity: overlayVisible ? 1 : 0,
          transition: 'background 0.6s ease, opacity 0.45s ease',
          pointerEvents: overlayVisible ? 'auto' : 'none',
        }}>

          {/* Animasyon stilleri */}
          <style>{[
            '@keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }',
            '@keyframes pulse-ring { 0%{transform:scale(0.85);opacity:0.6} 50%{transform:scale(1.15);opacity:0} 100%{transform:scale(0.85);opacity:0} }',
            '@keyframes shimmer-text { 0%,100%{opacity:0.5} 50%{opacity:1} }',
            '@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-8px);opacity:1} }',
            '@keyframes success-pop { 0%{transform:scale(0.4);opacity:0} 65%{transform:scale(1.12)} 85%{transform:scale(0.97)} 100%{transform:scale(1);opacity:1} }',
            '@keyframes check-draw { 0%{stroke-dashoffset:50} 100%{stroke-dashoffset:0} }',
            '@keyframes fade-in-up { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }',
            '@keyframes fade-out { 0%{opacity:1} 100%{opacity:0} }',
          ].join(' ')}</style>

          {/* LOADING içeriği */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
            opacity: showSuccess ? 0 : 1,
            transform: showSuccess ? 'scale(0.9)' : 'scale(1)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            position: showSuccess ? 'absolute' : 'relative',
            pointerEvents: 'none',
          }}>
            {/* Pulse halkalar + Logo */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)', animation: 'pulse-ring 1.8s ease-out infinite' }} />
              <div style={{ position: 'absolute', width: 108, height: 108, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.4)', animation: 'pulse-ring 1.8s ease-out 0.5s infinite' }} />
              <div style={{ width: 84, height: 84, borderRadius: '24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.5)', animation: 'heartbeat 1.8s ease-in-out infinite' }}>
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 56, height: 56, borderRadius: '14px', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>EduTakip</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0, animation: 'shimmer-text 2s ease-in-out infinite' }}>Özel Ders Yönetim Platformu</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: 'dot-bounce 1.2s ease-in-out 0s infinite' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: 'dot-bounce 1.2s ease-in-out 0.2s infinite' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: 'dot-bounce 1.2s ease-in-out 0.4s infinite' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0, animation: 'shimmer-text 1.5s ease-in-out 0.3s infinite' }}>{t('teacher.lessonReport.generatingAI')}</p>
          </div>

          {/* SUCCESS içeriği */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
            opacity: showSuccess ? 1 : 0,
            transform: showSuccess ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 0.45s ease 0.15s, transform 0.45s ease 0.15s',
            position: showSuccess ? 'relative' : 'absolute',
            pointerEvents: showSuccess ? 'auto' : 'none',
          }}>
            {/* Yeşil tik dairesi */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: showSuccess ? 'success-pop 0.55s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both' : 'none' }}>
              <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.35)', animation: showSuccess ? 'pulse-ring 1.6s ease-out 0.5s infinite' : 'none' }} />
              <div style={{ position: 'absolute', width: 96, height: 96, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.2)', animation: showSuccess ? 'pulse-ring 1.6s ease-out 0.85s infinite' : 'none' }} />
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34,197,94,0.45)' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline
                    points="9,20 17,28 31,12"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50"
                    style={{
                      strokeDashoffset: showSuccess ? undefined : '50',
                      animation: showSuccess ? 'check-draw 0.45s ease 0.4s both' : 'none',
                    }}
                  />
                </svg>
              </div>
            </div>
            {/* Yazı */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem',
              animation: showSuccess ? 'fade-in-up 0.4s ease 0.5s both' : 'none' }}>
              <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{t('teacher.lessonReport.reportCreated')}</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0 }}>{t('teacher.lessonReport.reportCreatedDesc')}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 70px))' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: 'calc(100vh - max(2rem, calc(env(safe-area-inset-bottom, 0px) + 80px)))', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.15rem' }}>{t('teacher.lessonReport.title')}</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{lesson.studentName} · {lesson.date} · {lesson.startTime?.slice(0,5)}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color='#6b7280' />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', padding: '1rem 1.5rem 0' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= step ? '#4f46e5' : '#f3f4f6', color: i <= step ? 'white' : '#9ca3af', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: i === step ? 700 : 500, color: i === step ? '#4f46e5' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? '#4f46e5' : '#f3f4f6', margin: '0 0.5rem', transition: 'all 0.2s' }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Step 0: Ders Bilgisi */}
          {step === 0 && (
            <>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.lessonReport.topicsCovered')}</label>
                <textarea value={form.topics} onChange={e => u('topics', e.target.value)}
                  placeholder={t('teacher.lessonReport.topicsPlaceholder')} rows={3} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.lessonReport.attendance')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[{ v: 'katıldı', l: t('teacher.lessonReport.attended') }, { v: 'geç kaldı', l: t('teacher.lessonReport.late') }, { v: 'katılmadı', l: t('teacher.lessonReport.absent') }].map(opt => (
                    <button key={opt.v} onClick={() => u('attendance', opt.v)}
                      style={{ border: `1.5px solid ${form.attendance === opt.v ? '#4f46e5' : '#e5e7eb'}`, background: form.attendance === opt.v ? '#eef2ff' : 'white', color: form.attendance === opt.v ? '#4338ca' : '#6b7280', borderRadius: 10, padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Performans */}
          {step === 1 && (
            <>
              <StarRating value={form.rating} onChange={v => u('rating', v)} label={t('teacher.lessonReport.overallRating')} ratingLabels={RATING_LABELS} />
              <ChoiceGroup label={t('teacher.lessonReport.understood')} field="understood" value={form.understood} onChange={v => u('understood', v)} CHOICES={CHOICES} />
              <ChoiceGroup label={t('teacher.lessonReport.participationLevel')} field="participation" value={form.participation} onChange={v => u('participation', v)} CHOICES={CHOICES} />
              <ChoiceGroup label={t('teacher.lessonReport.motivation')} field="motivation" value={form.motivation} onChange={v => u('motivation', v)} CHOICES={CHOICES} />
            </>
          )}

          {/* Step 2: Detaylar */}
          {step === 2 && (
            <>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.lessonReport.challenge')} <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>{t('teacher.lessonReport.optional')}</span></label>
                <textarea value={form.challenge} onChange={e => u('challenge', e.target.value)}
                  placeholder={t('teacher.lessonReport.challengePlaceholder')} rows={3} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.lessonReport.homework')} <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>{t('teacher.lessonReport.optional')}</span></label>
                <textarea value={form.homework} onChange={e => u('homework', e.target.value)}
                  placeholder={t('teacher.lessonReport.homeworkPlaceholder')} rows={2} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.lessonReport.nextGoal')} <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>{t('teacher.lessonReport.optional')}</span></label>
                <textarea value={form.nextGoal} onChange={e => u('nextGoal', e.target.value)}
                  placeholder={t('teacher.lessonReport.nextGoalPlaceholder')} rows={2} style={inp} />
              </div>
            </>
          )}

          {/* Step 3: Rapor */}
          {step === 3 && (
            <div style={{ animation: 'fade-in-up 0.45s ease both' }}>
              <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 14, padding: '1rem', border: '1.5px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Sparkles size={18} color='#4f46e5' />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4338ca' }}>{t('teacher.lessonReport.aiGenerated')}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>{t('teacher.lessonReport.aiEditNote')}</div>
                </div>
              </div>
              <textarea value={generatedReport} onChange={e => setGeneratedReport(e.target.value)}
                rows={14} style={{ ...inp, lineHeight: 1.7, fontSize: '0.88rem' }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '0.6rem 1.1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              {t('teacher.lessonReport.back')}
            </button>
          ) : <div />}

          {step < 2 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: canNext() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb', color: canNext() ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', cursor: canNext() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {t('teacher.lessonReport.next')} <ChevronRight size={15} />
            </button>
          )}

          {step === 2 && (
            !isPro(currentUser) ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveWithoutReport} disabled={loading}
                  style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
                  {t('teacher.lessonReport.saveWithoutReport')}
                </button>
                <button onClick={() => setShowProModal(true)}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(249,115,22,0.35)', position: 'relative', overflow: 'hidden', animation: 'proButtonPulse 2s ease-in-out infinite' }}>
                  <style>{`
                    @keyframes proButtonPulse {
                      0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(249,115,22,0.35); }
                      50% { transform: scale(1.04); box-shadow: 0 6px 22px rgba(249,115,22,0.55); }
                    }
                    @keyframes proShimmer {
                      0% { left: -100%; }
                      60%, 100% { left: 150%; }
                    }
                    .pro-btn-shimmer::after {
                      content: '';
                      position: absolute;
                      top: 0; left: -100%;
                      width: 60%; height: 100%;
                      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
                      animation: proShimmer 2.2s ease-in-out infinite;
                    }
                  `}</style>
                  <span className="pro-btn-shimmer" style={{ position: 'absolute', inset: 0 }} />
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {t('teacher.lessonReport.proAiReport')}
                  </span>
                </button>
              </div>
            ) : (
              <button onClick={generateReport} disabled={generating}
                style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                {generating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
                {generating ? t('teacher.lessonReport.generating') : t('teacher.lessonReport.generateReport')}
              </button>
            )
          )}

          {step === 3 && (
            <button onClick={handleSave} disabled={loading || !generatedReport}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
              {t('teacher.lessonReport.saveAndSend')}
            </button>
          )}
        </div>
      </div>
    </div>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        body.modal-open-hide-fab .app-fab {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.2s ease !important;
        }
      `}</style>
      {showProModal && <ProUpgradeModal reason='ai' onClose={() => setShowProModal(false)} onUpgraded={() => setShowProModal(false)} />}
    </>
  );
}