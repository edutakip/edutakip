import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ── Certificate language translations ────────────────────────
const CERT_LANGS = {
  en: { flag: '🇬🇧', label: 'English', title: 'Certificate of Achievement', certifies: 'This certifies that', completed: 'has successfully completed', teacher: 'Tutor', date: 'Date', congrats: 'Congratulations!', dir: 'ltr' },
  tr: { flag: '🇹🇷', label: 'Türkçe', title: 'Başarı Belgesi', certifies: 'Bu belge aşağıdaki kişinin', completed: 'başarıyla tamamladığını onaylar', teacher: 'Eğitmen', date: 'Tarih', congrats: 'Tebrikler!', dir: 'ltr' },
  de: { flag: '🇩🇪', label: 'Deutsch', title: 'Leistungszertifikat', certifies: 'Hiermit wird bestätigt, dass', completed: 'erfolgreich abgeschlossen hat', teacher: 'Lehrkraft', date: 'Datum', congrats: 'Herzlichen Glückwunsch!', dir: 'ltr' },
  es: { flag: '🇪🇸', label: 'Español', title: 'Certificado de Logro', certifies: 'Se certifica que', completed: 'ha completado con éxito', teacher: 'Tutor/a', date: 'Fecha', congrats: '¡Felicitaciones!', dir: 'ltr' },
  fr: { flag: '🇫🇷', label: 'Français', title: 'Certificat de Réussite', certifies: 'Le présent certificat atteste que', completed: 'a réussi avec succès', teacher: 'Tuteur/Tutrice', date: 'Date', congrats: 'Félicitations !', dir: 'ltr' },
  ar: { flag: '🇸🇦', label: 'العربية', title: 'شهادة إنجاز', certifies: 'تُقرّ هذه الشهادة بأن', completed: 'قد أتمّ بنجاح', teacher: 'المعلم', date: 'التاريخ', congrats: '!مبروك', dir: 'rtl' },
  it: { flag: '🇮🇹', label: 'Italiano', title: 'Certificato di Completamento', certifies: 'Si certifica che', completed: 'ha completato con successo', teacher: 'Tutor', date: 'Data', congrats: 'Congratulazioni!', dir: 'ltr' },
  pt: { flag: '🇧🇷', label: 'Português', title: 'Certificado de Conclusão', certifies: 'Certificamos que', completed: 'concluiu com sucesso', teacher: 'Tutor', date: 'Data', congrats: 'Parabéns!', dir: 'ltr' },
  ja: { flag: '🇯🇵', label: '日本語', title: '修了証書', certifies: 'これは以下の方が', completed: 'を修了したことを証明します', teacher: '指導者', date: '日付', congrats: 'おめでとうございます！', dir: 'ltr' },
};

// ── Design themes ─────────────────────────────────────────────
const THEMES = [
  {
    id: 'classic',
    labelEn: 'Classic Gold',
    labelTr: 'Klasik Altın',
    preview: 'linear-gradient(135deg, #fdfbf7, #fef3d0)',
    accent: '#c9a84c',
    bg: 'linear-gradient(135deg, #fdfbf7 0%, #fef9f0 100%)',
    border: '12px double #c9a84c',
    titleColor: '#7c5c10',
    bodyColor: '#6b5c3e',
    nameColor: '#3d2b00',
    fontFamily: '"Georgia", "Times New Roman", serif',
    nameBorder: '2px solid #c9a84c',
    shadow: '0 8px 40px rgba(201,168,76,0.2)',
    icon: '🏅',
  },
  {
    id: 'royal',
    labelEn: 'Royal Blue',
    labelTr: 'Kraliyet Mavisi',
    preview: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    accent: '#a78bfa',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    border: '8px solid #a78bfa',
    titleColor: '#e9d5ff',
    bodyColor: '#c4b5fd',
    nameColor: '#ffffff',
    fontFamily: '"Georgia", serif',
    nameBorder: '2px solid #a78bfa',
    shadow: '0 8px 40px rgba(79,70,229,0.4)',
    icon: '👑',
  },
  {
    id: 'modern',
    labelEn: 'Modern Minimal',
    labelTr: 'Modern Minimal',
    preview: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    accent: '#0ea5e9',
    bg: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: '3px solid #0ea5e9',
    titleColor: '#0c4a6e',
    bodyColor: '#0369a1',
    nameColor: '#0c4a6e',
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    nameBorder: '3px solid #0ea5e9',
    shadow: '0 8px 40px rgba(14,165,233,0.2)',
    icon: '🎓',
  },
  {
    id: 'nature',
    labelEn: 'Nature Green',
    labelTr: 'Doğa Yeşili',
    preview: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    accent: '#16a34a',
    bg: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '8px solid #16a34a',
    titleColor: '#14532d',
    bodyColor: '#166534',
    nameColor: '#14532d',
    fontFamily: '"Georgia", serif',
    nameBorder: '2px solid #16a34a',
    shadow: '0 8px 40px rgba(22,163,74,0.2)',
    icon: '🌿',
  },
];

// ── Subject suggestions ───────────────────────────────────────
const SUBJECT_GROUPS = [
  { groupKey: 'languages', items: ['Oxford Bright Ideas 1', 'Oxford Bright Ideas 2', 'Oxford Bright Ideas 3', 'Oxford Bright Ideas 4', 'Oxford Bright Ideas 5', 'Oxford Bright Ideas 6', 'English File Elementary', 'English File Pre-Intermediate', 'English File Intermediate', 'Headway Elementary', 'Headway Pre-Intermediate', 'Headway Upper-Intermediate', 'Cambridge Prepare A1', 'Cambridge Prepare A2', 'Cambridge Prepare B1', 'Speakout Elementary', 'Speakout Intermediate', 'DaF im Unternehmen A1', 'DaF im Unternehmen B1', 'Nuevo Español en Marcha A1', 'Nuevo Español en Marcha A2'] },
  { groupKey: 'mathScience', items: ['Khan Academy Algebra', 'IB Mathematics SL', 'IB Mathematics HL', 'GCSE Physics', 'GCSE Mathematics', 'A-Level Chemistry', 'A-Level Mathematics', 'SAT Math Prep'] },
  { groupKey: 'music', items: ['ABRSM Grade 1 Piano', 'ABRSM Grade 2 Piano', 'ABRSM Grade 3 Piano', 'ABRSM Grade 4 Piano', 'ABRSM Grade 5 Piano', 'ABRSM Grade 6 Piano', 'ABRSM Grade 7 Piano', 'ABRSM Grade 8 Piano', 'Guitar Foundation', 'Trinity Rock & Pop Guitar', 'Trinity Rock & Pop Vocals'] },
  { groupKey: 'coding', items: ['Scratch Beginner', 'Scratch Intermediate', 'Python for Kids', 'CS50 Introduction to Computer Science'] },
];
const GROUP_LABELS = {
  en: { languages: '🌍 Languages', mathScience: '📐 Math & Science', music: '🎵 Music', coding: '💻 Coding' },
  tr: { languages: '🌍 Dil Kursları', mathScience: '📐 Matematik & Fen', music: '🎵 Müzik', coding: '💻 Kodlama' },
};

// ── SubjectInput ──────────────────────────────────────────────
function SubjectInput({ value, onChange, isEn, inputStyle }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const labels = isEn ? GROUP_LABELS.en : GROUP_LABELS.tr;
  const filtered = SUBJECT_GROUPS.map(g => ({ ...g, items: g.items.filter(i => i.toLowerCase().includes(query.toLowerCase())) })).filter(g => g.items.length > 0);

  return (
    <div style={{ position: 'relative' }}>
      <input style={inputStyle} value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={isEn ? 'Type or search a subject...' : 'Konu yazın veya arayın...'}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 260, overflowY: 'auto', marginTop: 4 }}>
          {filtered.map(g => (
            <div key={g.groupKey}>
              <div style={{ padding: '0.45rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>{labels[g.groupKey]}</div>
              {g.items.map(item => (
                <div key={item} onMouseDown={() => { setQuery(item); onChange(item); setOpen(false); }}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >{item}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Certificate Preview ───────────────────────────────────────
function CertificatePreview({ form, certLang, theme }) {
  const c = CERT_LANGS[certLang];
  const t = THEMES.find(t => t.id === theme) || THEMES[0];
  const isRTL = c.dir === 'rtl';
  const isRoyal = theme === 'royal';

  return (
    <div id="certificate-preview" style={{
      background: t.bg,
      border: t.border,
      borderRadius: 10,
      padding: '3rem 2.5rem',
      minHeight: 420,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: t.fontFamily,
      direction: c.dir,
      textAlign: 'center',
      boxShadow: t.shadow,
    }}>
      {/* Corner ornaments */}
      {['top:14px;left:14px', 'top:14px;right:14px', 'bottom:14px;left:14px', 'bottom:14px;right:14px'].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...Object.fromEntries(pos.split(';').map(s => s.split(':'))), width: 28, height: 28, opacity: isRoyal ? 0.5 : 0.3, pointerEvents: 'none', color: t.accent, fontSize: 24, lineHeight: 1 }}>✦</div>
      ))}

      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: '5rem', fontWeight: 900, color: isRoyal ? 'rgba(167,139,250,0.07)' : `${t.accent}12`, letterSpacing: '-2px', userSelect: 'none' }}>EduTakip</span>
      </div>

      {/* Icon */}
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{t.icon}</div>

      {/* Title */}
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: t.titleColor, margin: '0 0 0.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {c.title}
      </h1>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.75rem 0' }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
        <span style={{ color: t.accent, fontSize: '1rem' }}>✦</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
      </div>

      {/* Certifies */}
      <p style={{ fontSize: '0.95rem', color: t.bodyColor, margin: '0.5rem 0', fontStyle: 'italic' }}>{c.certifies}</p>

      {/* Student name */}
      <h2 style={{ fontSize: '2rem', fontWeight: 700, color: t.nameColor, margin: '0.5rem 0', borderBottom: t.nameBorder, display: 'inline-block', padding: '0 1rem 0.25rem' }}>
        {form.studentName || '___________'}
      </h2>

      {/* Completed */}
      <p style={{ fontSize: '0.95rem', color: t.bodyColor, margin: '0.75rem 0 0.25rem', fontStyle: 'italic' }}>{c.completed}</p>

      {/* Course */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: t.titleColor, margin: '0.1rem 0 1.25rem' }}>
        {form.course || '___________'}
      </h3>

      {/* Personal message */}
      {form.message && (
        <p style={{ fontSize: '0.85rem', color: t.bodyColor, fontStyle: 'italic', margin: '0 0 1.25rem', padding: '0.5rem 1rem', borderLeft: isRTL ? 'none' : `3px solid ${t.accent}`, borderRight: isRTL ? `3px solid ${t.accent}` : 'none', textAlign: isRTL ? 'right' : 'left', background: `${t.accent}10`, borderRadius: 4 }}>
          "{form.message}"
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', gap: '1rem', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left', flex: 1 }}>
          <div style={{ borderTop: `1.5px solid ${t.accent}`, paddingTop: '0.4rem', minWidth: 120 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: t.nameColor }}>{form.tutorName || '___________'}</p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: t.bodyColor, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>{c.teacher}</p>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: t.accent }}>{c.congrats}</span>
        </div>
        <div style={{ textAlign: isRTL ? 'left' : 'right', flex: 1 }}>
          <div style={{ borderTop: `1.5px solid ${t.accent}`, paddingTop: '0.4rem', display: 'inline-block', minWidth: 100 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: t.nameColor }}>
              {form.date ? new Date(form.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '___________'}
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: t.bodyColor, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>{c.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CertificateGenerator() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [form, setForm] = useState({ studentName: '', tutorName: '', course: '', date: new Date().toISOString().slice(0, 10), message: '' });
  const [certLang, setCertLang] = useState('en');
  const [theme, setTheme] = useState('classic');
  const [showTooltip, setShowTooltip] = useState(false);
  const [applyAnim, setApplyAnim] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const prevDesc = useRef('');

  const u = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'designDesc') {
      setApplySuccess(false);
      setApplyAnim(!!val);
    }
  };

  const handleApplyDesc = () => {
    // Animate success
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 2000);
    // Scroll preview into view on mobile
    document.getElementById('certificate-preview')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handlePrint = () => {
    const node = document.getElementById('certificate-preview');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Certificate</title><style>body{margin:0;padding:40px;background:white;}@media print{body{padding:0;}}</style></head><body>${node.outerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  const UI = {
    title: isEn ? 'Certificate Generator' : 'Sertifika Oluşturucu',
    subtitle: isEn ? 'Fill in the form and instantly preview a printable certificate.' : 'Formu doldurun ve anında yazdırılabilir bir sertifika önizleyin.',
    studentName: isEn ? 'Student Name' : 'Öğrenci Adı',
    tutorName: isEn ? 'Tutor Name' : 'Öğretmen Adı',
    course: isEn ? 'Subject / Course Completed' : 'Ders / Tamamlanan Kurs',
    date: isEn ? 'Completion Date' : 'Tamamlanma Tarihi',
    certLangLabel: isEn ? 'Certificate Language' : 'Sertifika Dili',
    certLangTooltip: isEn ? 'This changes the language printed on the certificate, not the app interface.' : 'Bu seçim sertifikada basılan dili değiştirir; uygulama arayüzünü değiştirmez.',
    message: isEn ? 'Personal Message (optional)' : 'Kişisel Mesaj (isteğe bağlı)',
    messagePlaceholder: isEn ? 'e.g. Your dedication and hard work have truly paid off!' : 'Ör: Azmin ve çalışkanlığın meyvesini aldın!',
    designLabel: isEn ? 'Design Theme' : 'Tasarım Teması',
    designDescLabel: isEn ? 'Describe the Design (optional)' : 'Tasarımı Tarif Et (opsiyonel)',
    designDescPlaceholder: isEn ? 'e.g. Elegant with a floral border, pastel colors, suitable for a young student...' : 'Ör: Çiçekli bordürlü, pastel renkler, genç öğrenciye uygun...',
    preview: isEn ? 'Certificate Preview' : 'Sertifika Önizleme',
    print: isEn ? '🖨️ Print / Save PDF' : '🖨️ Yazdır / PDF Kaydet',
  };

  const inpStyle = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#111827', outline: 'none', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'Inter, sans-serif' };
  const labelStyle = { fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.4px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <style>{`
        .cert-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .theme-card { transition: all 0.15s; cursor: pointer; }
        .theme-card:hover { transform: translateY(-2px); }
        @keyframes applyPop {
          0% { transform: scale(0.92) translateY(6px); opacity: 0; }
          60% { transform: scale(1.04) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .apply-btn {
          animation: applyPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .apply-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 24px rgba(16,185,129,0.45) !important;
        }
        .apply-btn:active:not(:disabled) {
          transform: scale(0.97) !important;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 20, padding: '0.3rem 1rem', marginBottom: '0.75rem' }}>
            <span>🏅</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5' }}>EduTakip</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>{UI.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>{UI.subtitle}</p>
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.75rem', alignItems: 'start' }}>

          {/* ── FORM ── */}
          <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Student Name */}
            <div>
              <label style={labelStyle}>{UI.studentName}</label>
              <input className="cert-input" style={inpStyle} value={form.studentName} onChange={e => u('studentName', e.target.value)} placeholder={isEn ? 'e.g. John Smith' : 'Örn: Ali Yılmaz'} />
            </div>

            {/* Tutor Name */}
            <div>
              <label style={labelStyle}>{UI.tutorName}</label>
              <input className="cert-input" style={inpStyle} value={form.tutorName} onChange={e => u('tutorName', e.target.value)} placeholder={isEn ? 'e.g. Sarah Connor' : 'Örn: Ayşe Kaya'} />
            </div>

            {/* Subject */}
            <div>
              <label style={labelStyle}>{UI.course}</label>
              <SubjectInput value={form.course} onChange={v => u('course', v)} isEn={isEn} inputStyle={{ ...inpStyle }} />
            </div>

            {/* Date */}
            <div>
              <label style={labelStyle}>{UI.date}</label>
              <input className="cert-input" style={inpStyle} type="date" value={form.date} onChange={e => u('date', e.target.value)} />
            </div>

            {/* ── Design Theme ── */}
            <div>
              <label style={labelStyle}>{UI.designLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    className="theme-card"
                    onClick={() => setTheme(t.id)}
                    style={{
                      borderRadius: 12,
                      border: `2px solid ${theme === t.id ? '#6366f1' : '#e5e7eb'}`,
                      overflow: 'hidden',
                      background: 'white',
                      padding: 0,
                      boxShadow: theme === t.id ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                    }}
                  >
                    {/* Swatch */}
                    <div style={{ height: 44, background: t.preview, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.3rem' }}>{t.icon}</span>
                      {theme === t.id && (
                        <div style={{ position: 'absolute', top: 4, right: 6, background: '#6366f1', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 800 }}>✓</div>
                      )}
                    </div>
                    <div style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: theme === t.id ? 800 : 600, color: theme === t.id ? '#4f46e5' : '#374151' }}>
                        {isEn ? t.labelEn : t.labelTr}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Design Description (optional) ── */}
            <div>
              <label style={labelStyle}>{UI.designDescLabel}</label>
              <textarea
                className="cert-input"
                style={{ ...inpStyle, resize: 'vertical', minHeight: 60, fontFamily: 'Inter, sans-serif' }}
                value={form.designDesc || ''}
                onChange={e => u('designDesc', e.target.value)}
                placeholder={UI.designDescPlaceholder}
              />
              {form.designDesc && (
                <button
                  className="apply-btn"
                  onClick={handleApplyDesc}
                  style={{
                    marginTop: '0.6rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: 'white',
                    background: applySuccess
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1)',
                    backgroundSize: applySuccess ? '100%' : '200% auto',
                    animation: applySuccess ? 'none' : 'applyPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    boxShadow: applySuccess
                      ? '0 4px 16px rgba(16,185,129,0.4)'
                      : '0 4px 16px rgba(99,102,241,0.35)',
                    transition: 'background 0.3s, box-shadow 0.2s, transform 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {applySuccess ? (
                    <>✅ {isEn ? 'Applied!' : 'Uygulandı!'}</>
                  ) : (
                    <>{isEn ? '✨ Apply Description' : '✨ Uygula'}</>
                  )}
                </button>
              )}
            </div>

            {/* Certificate Language */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>{UI.certLangLabel}</label>
                <div style={{ position: 'relative' }}>
                  <button onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.85rem', padding: 0, lineHeight: 1 }}>ℹ️</button>
                  {showTooltip && (
                    <div style={{ position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', background: '#1f2937', color: 'white', fontSize: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8, zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: 240, textAlign: 'center', whiteSpace: 'normal' }}>
                      {UI.certLangTooltip}
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: '#1f2937' }} />
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                {Object.entries(CERT_LANGS).map(([code, lang]) => (
                  <button key={code} onClick={() => setCertLang(code)}
                    style={{
                      padding: '0.5rem 0.35rem', borderRadius: 8, border: `1.5px solid ${certLang === code ? '#6366f1' : '#e5e7eb'}`,
                      background: certLang === code ? '#eef2ff' : 'white',
                      cursor: 'pointer', fontSize: '0.72rem', fontWeight: certLang === code ? 700 : 500,
                      color: certLang === code ? '#4f46e5' : '#374151',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                      transition: 'all 0.12s',
                    }}>
                    <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                    <span style={{ lineHeight: 1.1, textAlign: 'center' }}>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Message */}
            <div>
              <label style={labelStyle}>{UI.message}</label>
              <textarea className="cert-input" style={{ ...inpStyle, resize: 'vertical', minHeight: 70, fontFamily: 'Inter, sans-serif' }}
                value={form.message} onChange={e => u('message', e.target.value)} placeholder={UI.messagePlaceholder} />
            </div>

            {/* Print */}
            <button onClick={handlePrint} style={{ width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.3)', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {UI.print}
            </button>
          </div>

          {/* ── PREVIEW ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{UI.preview}</span>
              <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600 }}>
                {CERT_LANGS[certLang].flag} {CERT_LANGS[certLang].label}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600 }}>
                {THEMES.find(t => t.id === theme)?.icon} {isEn ? THEMES.find(t => t.id === theme)?.labelEn : THEMES.find(t => t.id === theme)?.labelTr}
              </span>
            </div>
            <CertificatePreview form={form} certLang={certLang} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}