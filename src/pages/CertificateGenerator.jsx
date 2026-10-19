import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Download, Printer, Sparkles, ChevronDown, Award, User, Calendar, BookOpen, MessageSquare, Palette, Globe, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

// ── Certificate language translations ────────────────────────
const CERT_LANGS = {
  en: { flag: '🇬🇧', label: 'English', title: 'Certificate of Achievement', certifies: 'This certifies that', completed: 'has successfully completed', teacher: 'Tutor', date: 'Date', congrats: 'Congratulations!', dir: 'ltr', locale: 'en-GB' },
  tr: { flag: '🇹🇷', label: 'Türkçe', title: 'Başarı Belgesi', certifies: 'Bu belge aşağıdaki kişinin', completed: 'başarıyla tamamladığını onaylar', teacher: 'Eğitmen', date: 'Tarih', congrats: 'Tebrikler!', dir: 'ltr', locale: 'tr-TR' },
  de: { flag: '🇩🇪', label: 'Deutsch', title: 'Leistungszertifikat', certifies: 'Hiermit wird bestätigt, dass', completed: 'erfolgreich abgeschlossen hat', teacher: 'Lehrkraft', date: 'Datum', congrats: 'Herzlichen Glückwunsch!', dir: 'ltr', locale: 'de-DE' },
  es: { flag: '🇪🇸', label: 'Español', title: 'Certificado de Logro', certifies: 'Se certifica que', completed: 'ha completado con éxito', teacher: 'Tutor/a', date: 'Fecha', congrats: '¡Felicitaciones!', dir: 'ltr', locale: 'es-ES' },
  fr: { flag: '🇫🇷', label: 'Français', title: 'Certificat de Réussite', certifies: 'Le présent certificat atteste que', completed: 'a réussi avec succès', teacher: 'Tuteur/Tutrice', date: 'Date', congrats: 'Félicitations !', dir: 'ltr', locale: 'fr-FR' },
  ar: { flag: '🇸🇦', label: 'العربية', title: 'شهادة إنجاز', certifies: 'تُقرّ هذه الشهادة بأن', completed: 'قد أتمّ بنجاح', teacher: 'المعلم', date: 'التاريخ', congrats: '!مبروك', dir: 'rtl', locale: 'ar' },
  it: { flag: '🇮🇹', label: 'Italiano', title: 'Certificato di Completamento', certifies: 'Si certifica che', completed: 'ha completato con successo', teacher: 'Tutor', date: 'Data', congrats: 'Congratulazioni!', dir: 'ltr', locale: 'it-IT' },
  pt: { flag: '🇧🇷', label: 'Português', title: 'Certificado de Conclusão', certifies: 'Certificamos que', completed: 'concluiu com sucesso', teacher: 'Tutor', date: 'Data', congrats: 'Parabéns!', dir: 'ltr', locale: 'pt-BR' },
  ja: { flag: '🇯🇵', label: '日本語', title: '修了証書', certifies: 'これは以下の方が', completed: 'を修了したことを証明します', teacher: '指導者', date: '日付', congrats: 'おめでとうございます！', dir: 'ltr', locale: 'ja-JP' },
};

// ── Design themes ─────────────────────────────────────────────
const THEMES = [
  {
    id: 'classic',
    labelEn: 'Classic Gold',
    labelTr: 'Klasik Altın',
    preview: 'linear-gradient(135deg, #fdfbf7, #fef3d0)',
    accent: '#c9a84c',
    accentDark: '#a88a2e',
    bg: 'linear-gradient(135deg, #fdfbf7 0%, #fef9f0 100%)',
    border: '12px double #c9a84c',
    titleColor: '#7c5c10',
    bodyColor: '#6b5c3e',
    nameColor: '#3d2b00',
    fontFamily: '"Georgia", "Times New Roman", serif',
    nameBorder: '2px solid #c9a84c',
    shadow: '0 12px 48px rgba(201,168,76,0.25)',
    icon: '🏅',
    sealBg: 'linear-gradient(135deg, #c9a84c, #a88a2e)',
  },
  {
    id: 'royal',
    labelEn: 'Royal Blue',
    labelTr: 'Kraliyet Mavisi',
    preview: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    accent: '#a78bfa',
    accentDark: '#8b5cf6',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    border: '8px solid #a78bfa',
    titleColor: '#e9d5ff',
    bodyColor: '#c4b5fd',
    nameColor: '#ffffff',
    fontFamily: '"Georgia", serif',
    nameBorder: '2px solid #a78bfa',
    shadow: '0 12px 48px rgba(79,70,229,0.45)',
    icon: '👑',
    sealBg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  },
  {
    id: 'modern',
    labelEn: 'Modern Minimal',
    labelTr: 'Modern Minimal',
    preview: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    accent: '#0ea5e9',
    accentDark: '#0284c7',
    bg: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: '3px solid #0ea5e9',
    titleColor: '#0c4a6e',
    bodyColor: '#0369a1',
    nameColor: '#0c4a6e',
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    nameBorder: '3px solid #0ea5e9',
    shadow: '0 12px 48px rgba(14,165,233,0.25)',
    icon: '🎓',
    sealBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  },
  {
    id: 'nature',
    labelEn: 'Nature Green',
    labelTr: 'Doğa Yeşili',
    preview: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    accent: '#16a34a',
    accentDark: '#15803d',
    bg: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '8px solid #16a34a',
    titleColor: '#14532d',
    bodyColor: '#166534',
    nameColor: '#14532d',
    fontFamily: '"Georgia", serif',
    nameBorder: '2px solid #16a34a',
    shadow: '0 12px 48px rgba(22,163,74,0.25)',
    icon: '🌿',
    sealBg: 'linear-gradient(135deg, #16a34a, #15803d)',
  },
  {
    id: 'rose',
    labelEn: 'Rose Elegance',
    labelTr: 'Gül Zarafeti',
    preview: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    accent: '#e11d48',
    accentDark: '#be123c',
    bg: 'linear-gradient(160deg, #fff1f2 0%, #ffe4e6 100%)',
    border: '8px solid #e11d48',
    titleColor: '#881337',
    bodyColor: '#9f1239',
    nameColor: '#881337',
    fontFamily: '"Georgia", serif',
    nameBorder: '2px solid #e11d48',
    shadow: '0 12px 48px rgba(225,29,72,0.25)',
    icon: '🌹',
    sealBg: 'linear-gradient(135deg, #e11d48, #be123c)',
  },
  {
    id: 'midnight',
    labelEn: 'Midnight Dark',
    labelTr: 'Gece Yarısı',
    preview: 'linear-gradient(135deg, #0f172a, #1e293b)',
    accent: '#38bdf8',
    accentDark: '#0ea5e9',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: '6px solid #38bdf8',
    titleColor: '#7dd3fc',
    bodyColor: '#94a3b8',
    nameColor: '#f1f5f9',
    fontFamily: '"Inter", sans-serif',
    nameBorder: '2px solid #38bdf8',
    shadow: '0 12px 48px rgba(56,189,248,0.35)',
    icon: '🌙',
    sealBg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
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

// ── Generate certificate serial number ──────────────────────
function generateSerial() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EDT-${y}${m}${day}-${rand}`;
}

// ── StudentSelect ─────────────────────────────────────────────
function StudentSelect({ students, value, onChange, isEn, inputStyle }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          style={{ ...inputStyle, paddingRight: '2.2rem' }}
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={isEn ? 'Type or select a student...' : 'Yazın veya öğrenci seçin...'}
        />
        {students.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{
              position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto', marginTop: 4,
        }}>
          {filtered.map(s => (
            <div
              key={s.id}
              onMouseDown={() => { onChange(s.name); setOpen(false); setQuery(''); }}
              style={{
                padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#374151',
                cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={13} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                {s.subject && <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{s.subject}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', maxHeight: 260, overflowY: 'auto', marginTop: 4 }}>
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
function CertificatePreview({ form, certLang, theme, customTheme, serial }) {
  const c = CERT_LANGS[certLang];
  const t = theme === '__custom__' && customTheme ? customTheme : (THEMES.find(t => t.id === theme) || THEMES[0]);
  const isRTL = c.dir === 'rtl';
  const isDark = theme === 'royal' || theme === 'midnight';

  const formatDate = () => {
    if (!form.date) return '___________';
    try {
      return new Date(form.date).toLocaleDateString(c.locale, { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return form.date;
    }
  };

  return (
    <div id="certificate-preview" style={{
      background: t.bg,
      border: t.border,
      borderRadius: 12,
      padding: '3rem 2.5rem',
      minHeight: 440,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: t.fontFamily,
      direction: c.dir,
      textAlign: 'center',
      boxShadow: t.shadow,
    }}>
      {/* Corner ornaments */}
      {['top:16px;left:16px', 'top:16px;right:16px', 'bottom:16px;left:16px', 'bottom:16px;right:16px'].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...Object.fromEntries(pos.split(';').map(s => s.split(':'))), width: 32, height: 32, opacity: isDark ? 0.6 : 0.35, pointerEvents: 'none', color: t.accent, fontSize: 26, lineHeight: 1 }}>❧</div>
      ))}

      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          fontSize: '4.5rem', fontWeight: 900,
          color: isDark ? 'rgba(255,255,255,0.04)' : `${t.accent}10`,
          letterSpacing: '-2px', userSelect: 'none', transform: 'rotate(-15deg)',
          fontFamily: '"Georgia", serif',
        }}>
          EduTakip
        </div>
      </div>

      {/* Logo + Icon header */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: t.sealBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${t.accent}40`,
          marginBottom: '0.5rem',
        }}>
          <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
        </div>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: t.titleColor, margin: '0 0 0.5rem', letterSpacing: '1.5px', textTransform: 'uppercase', position: 'relative' }}>
        {c.title}
      </h1>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.75rem 0', position: 'relative' }}>
        <div style={{ flex: 1, maxWidth: 120, height: 1, background: `linear-gradient(90deg, transparent, ${t.accent})` }} />
        <span style={{ color: t.accent, fontSize: '1.1rem' }}>❦</span>
        <div style={{ flex: 1, maxWidth: 120, height: 1, background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />
      </div>

      {/* Certifies */}
      <p style={{ fontSize: '0.95rem', color: t.bodyColor, margin: '0.5rem 0', fontStyle: 'italic', position: 'relative' }}>{c.certifies}</p>

      {/* Student name */}
      <h2 style={{ fontSize: '2.1rem', fontWeight: 700, color: t.nameColor, margin: '0.75rem 0', borderBottom: t.nameBorder, display: 'inline-block', padding: '0 1.5rem 0.25rem', position: 'relative' }}>
        {form.studentName || '___________'}
      </h2>

      {/* Completed */}
      <p style={{ fontSize: '0.95rem', color: t.bodyColor, margin: '0.75rem 0 0.25rem', fontStyle: 'italic', position: 'relative' }}>{c.completed}</p>

      {/* Course */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: t.titleColor, margin: '0.1rem 0 1.25rem', position: 'relative' }}>
        {form.course || '___________'}
      </h3>

      {/* Personal message */}
      {form.message && (
        <p style={{ fontSize: '0.85rem', color: t.bodyColor, fontStyle: 'italic', margin: '0 auto 1.25rem', padding: '0.6rem 1.25rem', borderLeft: isRTL ? 'none' : `3px solid ${t.accent}`, borderRight: isRTL ? `3px solid ${t.accent}` : 'none', textAlign: isRTL ? 'right' : 'left', background: `${t.accent}10`, borderRadius: 6, maxWidth: 400, position: 'relative' }}>
          "{form.message}"
        </p>
      )}

      {/* Seal */}
      <div style={{ position: 'absolute', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: `2.5px solid ${t.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${t.accent}08`,
          opacity: 0.7,
        }}>
          <Award size={28} color={t.accent} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', gap: '1rem', flexDirection: isRTL ? 'row-reverse' : 'row', position: 'relative' }}>
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
              {formatDate()}
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: t.bodyColor, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>{c.date}</p>
          </div>
        </div>
      </div>

      {/* Serial number */}
      <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: `1px dashed ${t.accent}40`, position: 'relative' }}>
        <span style={{ fontSize: '0.62rem', color: t.bodyColor, opacity: 0.5, letterSpacing: '1.5px', fontWeight: 600 }}>
          {isRTL ? 'رقم' : 'No.'}: {serial}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CertificateGenerator() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [form, setForm] = useState({ studentName: '', tutorName: '', course: '', date: new Date().toISOString().slice(0, 10), message: '' });
  const [certLang, setCertLang] = useState('en');
  const [theme, setTheme] = useState('classic');
  const [customTheme, setCustomTheme] = useState(null);
  const [students, setStudents] = useState([]);
  const [serial, setSerial] = useState(generateSerial());
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const s = await base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' });
        setStudents(s);
      } catch {}
    })();
  }, []);

  if (windowWidth < 768) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
            {isEn ? 'Desktop Only Feature' : 'Masaüstü / Tablet Gerekli'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: 280, margin: '0 auto' }}>
            {isEn
              ? 'The Certificate Generator is available on tablets and desktops. Please switch to a larger device.'
              : 'Sertifika Oluşturucu yalnızca tablet ve masaüstü cihazlarda kullanılabilir. Lütfen daha büyük bir ekrana geçin.'}
          </p>
        </div>
      </div>
    );
  }

  const u = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePrint = () => {
    const node = document.getElementById('certificate-preview');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Certificate - ${form.studentName || 'Student'}</title><style>
      body{margin:0;padding:40px;background:white;display:flex;align-items:center;justify-content:center;min-height:100vh;}
      @media print{body{padding:0;}}
      *{box-sizing:border-box;}
    </style></head><body>${node.outerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  const handleDownload = async () => {
    const node = document.getElementById('certificate-preview');
    if (!node) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      const fileName = `sertifika-${(form.studentName || 'ogrenci').replace(/\s+/g, '-').toLowerCase()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleNewSerial = () => setSerial(generateSerial());

  const UI = {
    title: isEn ? 'Certificate Generator' : 'Sertifika Oluşturucu',
    subtitle: isEn ? 'Create and download professional certificates for your students.' : 'Öğrencileriniz için profesyonel sertifikalar oluşturun ve indirin.',
    studentName: isEn ? 'Student Name' : 'Öğrenci Adı',
    tutorName: isEn ? 'Tutor Name' : 'Öğretmen Adı',
    course: isEn ? 'Subject / Course Completed' : 'Ders / Tamamlanan Kurs',
    date: isEn ? 'Completion Date' : 'Tamamlanma Tarihi',
    certLangLabel: isEn ? 'Certificate Language' : 'Sertifika Dili',
    message: isEn ? 'Personal Message (optional)' : 'Kişisel Mesaj (isteğe bağlı)',
    messagePlaceholder: isEn ? 'e.g. Your dedication and hard work have truly paid off!' : 'Ör: Azmin ve çalışkanlığın meyvesini aldın!',
    designLabel: isEn ? 'Design Theme' : 'Tasarım Teması',
    preview: isEn ? 'Live Preview' : 'Canlı Önizleme',
    print: isEn ? 'Print / Save PDF' : 'Yazdır / PDF Kaydet',
    download: isEn ? 'Download PNG' : 'PNG İndir',
    serial: isEn ? 'Certificate No.' : 'Sertifika No.',
    regenerate: isEn ? 'Regenerate' : 'Yeniden Oluştur',
    sectionDetails: isEn ? 'Certificate Details' : 'Sertifika Detayları',
    sectionDesign: isEn ? 'Design & Language' : 'Tasarım & Dil',
  };

  const inpStyle = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#111827', outline: 'none', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'Inter, sans-serif' };
  const labelStyle = { fontSize: '0.72rem', color: '#6b7280', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.4px' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
      <style>{`
        .cert-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .theme-card { transition: all 0.2s; cursor: pointer; }
        .theme-card:hover { transform: translateY(-3px); }
        .lang-btn { transition: all 0.15s; }
        .lang-btn:hover { transform: scale(1.05); }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .action-btn:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #c7d2fe', borderRadius: 20, padding: '0.35rem 1.1rem', marginBottom: '0.75rem' }}>
            <Award size={14} color="#4f46e5" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5' }}>EduTakip</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>{UI.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>{UI.subtitle}</p>
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '1.75rem', alignItems: 'start' }}>

          {/* ── FORM ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Details Section */}
            <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={15} color="#6366f1" />
                </div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', margin: 0 }}>{UI.sectionDetails}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Student Name */}
                <div>
                  <label style={labelStyle}><User size={11} /> {UI.studentName}</label>
                  <StudentSelect students={students} value={form.studentName} onChange={v => u('studentName', v)} isEn={isEn} inputStyle={{ ...inpStyle, className: 'cert-input' }} />
                </div>

                {/* Tutor Name */}
                <div>
                  <label style={labelStyle}><User size={11} /> {UI.tutorName}</label>
                  <input className="cert-input" style={inpStyle} value={form.tutorName} onChange={e => u('tutorName', e.target.value)} placeholder={isEn ? 'e.g. Sarah Connor' : 'Örn: Ayşe Kaya'} />
                </div>

                {/* Subject */}
                <div>
                  <label style={labelStyle}><BookOpen size={11} /> {UI.course}</label>
                  <SubjectInput value={form.course} onChange={v => u('course', v)} isEn={isEn} inputStyle={{ ...inpStyle, className: 'cert-input' }} />
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}><Calendar size={11} /> {UI.date}</label>
                  <input className="cert-input" style={inpStyle} type="date" value={form.date} onChange={e => u('date', e.target.value)} />
                </div>

                {/* Personal Message */}
                <div>
                  <label style={labelStyle}><MessageSquare size={11} /> {UI.message}</label>
                  <textarea className="cert-input" style={{ ...inpStyle, resize: 'vertical', minHeight: 65, fontFamily: 'Inter, sans-serif' }}
                    value={form.message} onChange={e => u('message', e.target.value)} placeholder={UI.messagePlaceholder} />
                </div>
              </div>
            </div>

            {/* Design & Language Section */}
            <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Palette size={15} color="#8b5cf6" />
                </div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', margin: 0 }}>{UI.sectionDesign}</h3>
              </div>

              {/* Theme grid */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={labelStyle}>{UI.designLabel}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
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
                      <div style={{ height: 40, background: t.preview, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                        {theme === t.id && (
                          <div style={{ position: 'absolute', top: 3, right: 5, background: '#6366f1', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={9} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.35rem 0.3rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: theme === t.id ? 800 : 600, color: theme === t.id ? '#4f46e5' : '#374151', lineHeight: 1.1, display: 'block' }}>
                          {isEn ? t.labelEn : t.labelTr}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Language */}
              <div>
                <label style={labelStyle}><Globe size={11} /> {UI.certLangLabel}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {Object.entries(CERT_LANGS).map(([code, lang]) => (
                    <button key={code} className="lang-btn" onClick={() => setCertLang(code)}
                      style={{
                        padding: '0.45rem 0.3rem', borderRadius: 8, border: `1.5px solid ${certLang === code ? '#6366f1' : '#e5e7eb'}`,
                        background: certLang === code ? '#eef2ff' : 'white',
                        cursor: 'pointer', fontSize: '0.68rem', fontWeight: certLang === code ? 700 : 500,
                        color: certLang === code ? '#4f46e5' : '#374151',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
                      }}>
                      <span style={{ fontSize: '1.05rem' }}>{lang.flag}</span>
                      <span style={{ lineHeight: 1.1, textAlign: 'center' }}>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="action-btn"
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: 14, border: 'none',
                  background: downloaded ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: downloading ? 'wait' : 'pointer',
                  boxShadow: downloaded ? '0 4px 16px rgba(16,185,129,0.35)' : '0 4px 16px rgba(79,70,229,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : downloaded ? <Check size={16} /> : <Download size={16} />}
                {downloading ? (isEn ? 'Saving...' : 'Kaydediliyor...') : downloaded ? (isEn ? 'Saved!' : 'İndirildi!') : UI.download}
              </button>
              <button
                className="action-btn"
                onClick={handlePrint}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: 14, border: '1.5px solid #e5e7eb',
                  background: 'white', color: '#374151', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Printer size={16} />
                {UI.print}
              </button>
            </div>
          </div>

          {/* ── PREVIEW ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{UI.preview}</span>
              <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {CERT_LANGS[certLang].flag} {CERT_LANGS[certLang].label}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {THEMES.find(t => t.id === theme)?.icon} {isEn ? THEMES.find(t => t.id === theme)?.labelEn : THEMES.find(t => t.id === theme)?.labelTr}
              </span>
            </div>

            <CertificatePreview form={form} certLang={certLang} theme={theme} customTheme={customTheme} serial={serial} />

            {/* Serial number control */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0.75rem 1.25rem', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{UI.serial}:</span>
              <code style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '1px' }}>{serial}</code>
              <button onClick={handleNewSerial} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.35rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={12} /> {UI.regenerate}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}