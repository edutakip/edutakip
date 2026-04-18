import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Upload, X, BookOpen, ChevronDown, Loader2, CheckCircle, Send, Pencil, FileText, Zap, RotateCcw, Gamepad2, Save, FileDown, ArrowLeft, Database, Image as ImageIcon, ClipboardList } from 'lucide-react';
import GamePoolPage, { SaveToPoolModal } from './GamePoolPage';
import { showToast } from '@/lib/toast';
import { jsPDF } from 'jspdf';

const GRADE_LEVELS = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];
const STEP_LABELS = ['Ders Seçimi', 'Ders Notları', 'Görsel Yükleme', 'AI Analizi', 'Ödev'];

// ── Helpers ───────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#10b981' : active ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: active ? '0 4px 12px rgba(99,102,241,0.4)' : 'none' }}>
                {done ? <CheckCircle size={16} color='white' /> : <span style={{ fontSize: '0.75rem', fontWeight: 800, color: active ? 'white' : '#9ca3af' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: active ? 700 : 500, color: active ? '#6366f1' : done ? '#10b981' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 32, height: 2, background: done ? '#10b981' : '#e5e7eb', marginBottom: 18, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = '#6366f1', iconBg = '#eef2ff', children, step, current }) {
  const isActive = step === current;
  const isDone = step < current;
  return (
    <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${isActive ? '#c7d2fe' : isDone ? '#bbf7d0' : '#f1f5f9'}`, boxShadow: isActive ? '0 4px 24px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', transition: 'all 0.25s', opacity: step > current ? 0.5 : 1 }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${isActive ? '#e5e7eb' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: '0.75rem', background: isDone ? '#f0fdf4' : isActive ? '#fafbff' : 'white' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: isDone ? '#d1fae5' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isDone ? <CheckCircle size={18} color='#10b981' /> : <Icon size={18} color={isDone ? '#10b981' : iconColor} />}
        </div>
        <h2 style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', margin: 0 }}>{title}</h2>
        {isDone && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: 20 }}>✓ Tamamlandı</span>}
      </div>
      {(isActive || isDone) && <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '0.65rem 2.2rem 0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: value ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
          <option value=''>{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} color='#9ca3af' style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
    </div>
  );
}

// ── Turkish character fixer for jsPDF (helvetica doesn't support ğüşıöç) ──
function fixTR(str) {
  if (!str) return '';
  return str
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

// ── Mode Selection Screen ─────────────────────────────────────
function ModeSelection({ onSelect }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
          <Sparkles size={30} color='white' />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>AI Ödev Oluşturucu</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>Hangi tür ödev oluşturmak istersiniz?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* PDF Ödev */}
        <button onClick={() => onSelect('pdf')} style={{
          background: 'white', borderRadius: 20, padding: '2rem 1.5rem',
          border: '2px solid #e5e7eb', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
            <FileDown size={26} color='white' />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem' }}>PDF Ödev</h2>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Ders notlarına göre AI ödev içeriği oluşturur, PDF olarak indirir ve PDF Havuzuna kaydeder.
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '0.3rem 0.75rem', borderRadius: 20 }}>
            <FileDown size={12} /> PDF Oluştur & Kaydet
          </span>
        </button>

        {/* Deneme / Quiz */}
        <button onClick={() => onSelect('quiz')} style={{
          background: 'white', borderRadius: 20, padding: '2rem 1.5rem',
          border: '2px solid #e5e7eb', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
            <ClipboardList size={26} color='white' />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem' }}>Deneme Sınavı / Quiz</h2>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Soru sayısı ve zorluk derecesi seçin, ünite ve konuya özel test oluşturun, PDF olarak indirin.
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', padding: '0.3rem 0.75rem', borderRadius: 20 }}>
            <ClipboardList size={12} /> Test & Deneme Sınavı
          </span>
        </button>

        {/* Oyun Ödev */}
        <button onClick={() => onSelect('game')} style={{
          background: 'white', borderRadius: 20, padding: '2rem 1.5rem',
          border: '2px solid #e5e7eb', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Gamepad2 size={26} color='white' />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: '0 0 0.4rem' }}>Oyun Ödev</h2>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Çoktan seçmeli, doğru/yanlış ve boşluk doldurma sorularıyla interaktif ödev oluşturur.
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '0.3rem 0.75rem', borderRadius: 20 }}>
            <Gamepad2 size={12} /> İnteraktif & Oyunlaştırılmış
          </span>
        </button>
      </div>
    </div>
  );
}

// ── PDF Mode ──────────────────────────────────────────────────
function PDFMode({ me, onBack }) {
  const [form, setForm] = useState({ grade: '', topic: '', unit: '', book: '', pages: '' });
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfContent, setPdfContent] = useState(null);
  const [savedToPool, setSavedToPool] = useState(false);

  const formReady = form.grade && form.topic;

  const handleGenerate = async () => {
    setGenerating(true);
    setPdfReady(false);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an experienced English teacher. Create a detailed homework assignment as a printable worksheet.

LESSON INFO:
Class: ${form.grade}
${form.unit ? `Unit: ${form.unit}` : ''}
Topic: ${form.topic}
${form.book ? `Book: ${form.book}` : ''}
${form.pages ? `Pages: ${form.pages}` : ''}
${notes ? `\nTeacher Notes:\n${notes}` : ''}

Create a comprehensive homework worksheet with the following sections. Write in clear, student-friendly English. Make exercises relevant to the topic.

Return JSON with:
{
  "title": "worksheet title",
  "subtitle": "e.g. Name: _________ Date: _________  Class: _________",
  "instructions": "General instructions (1-2 sentences)",
  "sections": [
    {
      "heading": "Exercise 1 – Vocabulary",
      "content": "Full exercise text with numbered items, blanks, word banks etc."
    },
    {
      "heading": "Exercise 2 – Grammar",
      "content": "Full grammar exercise with clear instructions and numbered items"
    },
    {
      "heading": "Exercise 3 – Reading",
      "content": "Short reading text (60-80 words) followed by 3 comprehension questions"
    },
    {
      "heading": "Exercise 4 – Writing",
      "content": "Writing prompt with clear instructions (30-50 word task)"
    }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            instructions: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (res?.title && res?.sections?.length > 0) {
        setPdfContent(res);
        setPdfReady(true);
        showToast({ message: '✅ Ödev içeriği oluşturuldu!' });
      } else {
        showToast({ message: 'İçerik oluşturulamadı', type: 'error' });
      }
    } catch (e) {
      showToast({ message: 'Hata: ' + e.message, type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const buildAndDownloadPDF = () => {
    if (!pdfContent) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 18;
    const usableW = pageW - margin * 2;
    let y = 20;

    const addText = (text, opts = {}) => {
      const { fontSize = 10, fontStyle = 'normal', color = [30, 30, 30], lineHeight = 6 } = opts;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(fixTR(text), usableW);
      lines.forEach(line => {
        if (y > 272) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      return y;
    };

    // Header bar
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(fixTR('EduTakip – AI Odev'), margin, 9);
    doc.text(new Date().toLocaleDateString('tr-TR'), pageW - margin, 9, { align: 'right' });
    y = 24;

    // Title
    addText(pdfContent.title, { fontSize: 16, fontStyle: 'bold', color: [30, 27, 75], lineHeight: 8 });
    y += 2;

    // Subtitle line
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
    doc.text(fixTR(pdfContent.subtitle || 'Name: ________________________  Date: ___________  Class: ___________'), margin, y);
    y += 4;
    doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Instructions
    if (pdfContent.instructions) {
      addText(pdfContent.instructions, { fontSize: 9.5, color: [80, 80, 80], lineHeight: 5.5 });
      y += 3;
    }

    // Sections
    pdfContent.sections?.forEach((sec, idx) => {
      if (y > 255) { doc.addPage(); y = 20; }
      // Section header
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(margin, y - 4, usableW, 9, 2, 2, 'F');
      addText(sec.heading, { fontSize: 10.5, fontStyle: 'bold', color: [79, 70, 229], lineHeight: 7 });
      y += 2;
      addText(sec.content, { fontSize: 9.5, color: [50, 50, 50], lineHeight: 5.5 });
      y += 5;
    });

    // Footer
    if (y < 272) {
      doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(160, 160, 160);
      doc.text('Prepared with EduTakip AI Homework Generator', pageW / 2, 287, { align: 'center' });
    }

    const fileName = `${pdfContent.title.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').trim()}.pdf`;
    doc.save(fileName);
    return doc;
  };

  const handleSaveToPool = async () => {
    if (!pdfContent || !me) return;
    setSaving(true);
    try {
      // Generate PDF as blob and upload
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210;
      const margin = 18;
      const usableW = pageW - margin * 2;
      let y = 20;

      const addText = (text, opts = {}) => {
        const { fontSize = 10, fontStyle = 'normal', color = [30, 30, 30], lineHeight = 6 } = opts;
        doc.setFontSize(fontSize); doc.setFont('helvetica', fontStyle); doc.setTextColor(...color);
        const lines = doc.splitTextToSize(fixTR(text), usableW);
        lines.forEach(line => {
          if (y > 272) { doc.addPage(); y = 20; }
          doc.text(line, margin, y); y += lineHeight;
        });
      };

      doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 14, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
      doc.text('EduTakip – AI Ödev', margin, 9);
      doc.text(new Date().toLocaleDateString('tr-TR'), pageW - margin, 9, { align: 'right' });
      y = 24;

      addText(pdfContent.title, { fontSize: 16, fontStyle: 'bold', color: [30, 27, 75], lineHeight: 8 }); y += 2;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
      doc.text(pdfContent.subtitle || 'Name: ________________________  Date: ___________', margin, y); y += 4;
      doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y); y += 6;
      if (pdfContent.instructions) { addText(pdfContent.instructions, { fontSize: 9.5, color: [80, 80, 80], lineHeight: 5.5 }); y += 3; }

      pdfContent.sections?.forEach(sec => {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, y - 4, usableW, 9, 2, 2, 'F');
        addText(sec.heading, { fontSize: 10.5, fontStyle: 'bold', color: [79, 70, 229], lineHeight: 7 }); y += 2;
        addText(sec.content, { fontSize: 9.5, color: [50, 50, 50], lineHeight: 5.5 }); y += 5;
      });

      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `${pdfContent.title}.pdf`, { type: 'application/pdf' });
      const uploadRes = await base44.integrations.Core.UploadFile({ file: pdfFile });

      await base44.entities.PDFHomework.create({
        title: pdfContent.title,
        className: form.grade,
        subject: form.topic,
        teacherEmail: me.email,
        fileUrl: uploadRes.file_url,
        notes: notes,
      });

      setSavedToPool(true);
      showToast({ message: '📁 PDF Havuzuna kaydedildi!' });
    } catch (e) {
      showToast({ message: 'Kayıt hatası: ' + e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Geri
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(239,68,68,0.3)' }}>
            <FileDown size={20} color='white' />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', margin: 0 }}>PDF Ödev Oluştur</h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>AI ile ödev içeriği oluştur, PDF olarak kaydet</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
          <SelectField label='Sınıf Seviyesi *' value={form.grade} onChange={v => setForm(p => ({ ...p, grade: v }))} options={GRADE_LEVELS} placeholder='Sınıf seçin...' />
          <InputField label='Ünite' value={form.unit} onChange={v => setForm(p => ({ ...p, unit: v }))} placeholder='Ör: Unit 3 – Free Time' />
          <InputField label='Konu *' value={form.topic} onChange={v => setForm(p => ({ ...p, topic: v }))} placeholder='Ör: Present Perfect Tense' />
          <InputField label='Kitap' value={form.book} onChange={v => setForm(p => ({ ...p, book: v }))} placeholder='Ör: Speak Out B1' />
          <InputField label='Sayfalar' value={form.pages} onChange={v => setForm(p => ({ ...p, pages: v }))} placeholder='Ör: 48-52' />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Ders Notları (isteğe bağlı)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder='Bu derste neler işlendi? Öğrencilerin zorlandığı noktalar, öğretilen kelimeler...'
            rows={4}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.85rem', fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.65, background: '#fafafa' }}
            onFocus={e => e.target.style.borderColor = '#ef4444'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <button onClick={handleGenerate} disabled={!formReady || generating}
          style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.75rem', borderRadius: 12, border: 'none', background: formReady && !generating ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#e5e7eb', color: formReady && !generating ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.9rem', cursor: formReady && !generating ? 'pointer' : 'default', boxShadow: formReady && !generating ? '0 4px 14px rgba(239,68,68,0.3)' : 'none' }}>
          {generating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
          {generating ? 'Ödev Oluşturuluyor...' : 'AI ile Ödev Oluştur'}
        </button>
      </div>

      {/* PDF Preview & Actions */}
      {pdfReady && pdfContent && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #bbf7d0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(16,185,129,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <CheckCircle size={20} color='#10b981' />
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', margin: 0 }}>Ödev Oluşturuldu!</h2>
          </div>

          {/* Preview */}
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
            <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1rem', color: 'white' }}>
              <p style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.25rem' }}>Ödev Başlığı</p>
              <h3 style={{ fontWeight: 900, fontSize: '1rem', margin: 0 }}>{pdfContent.title}</h3>
              <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: '0.3rem 0 0' }}>{form.grade} • {form.topic}</p>
            </div>
            {pdfContent.sections?.map((sec, i) => (
              <div key={i} style={{ marginBottom: '0.65rem', padding: '0.75rem 1rem', background: 'white', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <p style={{ fontWeight: 800, fontSize: '0.82rem', color: '#4f46e5', marginBottom: '0.35rem' }}>{sec.heading}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>{sec.content.slice(0, 180)}{sec.content.length > 180 ? '...' : ''}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={buildAndDownloadPDF}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              <FileDown size={16} /> PDF İndir
            </button>
            <button onClick={handleSaveToPool} disabled={saving || savedToPool}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: savedToPool ? '#d1fae5' : saving ? '#e5e7eb' : 'linear-gradient(135deg,#10b981,#059669)', color: savedToPool ? '#065f46' : saving ? '#9ca3af' : 'white', fontWeight: 800, fontSize: '0.88rem', cursor: saving || savedToPool ? 'default' : 'pointer', boxShadow: saving || savedToPool ? 'none' : '0 4px 14px rgba(16,185,129,0.3)' }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : savedToPool ? <CheckCircle size={16} /> : <Database size={16} />}
              {savedToPool ? 'Havuza Kaydedildi!' : saving ? 'Kaydediliyor...' : 'PDF Havuzuna Kaydet'}
            </button>
            <button onClick={() => { setPdfReady(false); setPdfContent(null); setSavedToPool(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              <RotateCcw size={14} /> Yeniden Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz Mode ─────────────────────────────────────────────────
function QuizMode({ onBack }) {
  const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];
  const DIFFICULTIES = ['Kolay', 'Orta', 'Zor', 'Karışık'];
  const QUESTION_TYPES = ['Çoktan Seçmeli', 'Doğru / Yanlış', 'Boşluk Doldurma', 'Kısa Cevap', 'Karma'];

  const [form, setForm] = useState({ grade: '', unit: '', topic: '', book: '' });
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Orta');
  const [questionType, setQuestionType] = useState('Karma');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);

  const formReady = form.grade && form.topic;

  const handleGenerate = async () => {
    setGenerating(true);
    setQuizData(null);
    try {
      const typeInstructions = {
        'Çoktan Seçmeli': 'ALL questions must be multiple choice with 4 options (A, B, C, D) and clearly marked correct answer.',
        'Doğru / Yanlış': 'ALL questions must be True/False statements with clearly marked correct answer (True or False).',
        'Boşluk Doldurma': 'ALL questions must be fill-in-the-blank sentences with the answer key provided.',
        'Kısa Cevap': 'ALL questions must be short answer questions with expected answer provided.',
        'Karma': `Mix the ${questionCount} questions across these types: multiple choice (4 options), True/False, and fill-in-the-blank. Clearly mark the type of each question.`,
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an experienced English teacher creating a test/quiz for students.

EXAM DETAILS:
- Class: ${form.grade}
${form.unit ? `- Unit: ${form.unit}` : ''}
- Topic: ${form.topic}
${form.book ? `- Book: ${form.book}` : ''}
- Number of questions: ${questionCount}
- Difficulty: ${difficulty}
- Question type: ${questionType}
${notes ? `\nAdditional notes: ${notes}` : ''}

INSTRUCTIONS:
${typeInstructions[questionType]}

Create exactly ${questionCount} questions. Make them relevant to the topic and appropriate for the difficulty level.
For difficulty "${difficulty}":
- Kolay (Easy): basic recall, simple structures, common vocabulary
- Orta (Medium): application of rules, moderate complexity
- Zor (Hard): complex analysis, advanced vocabulary, nuanced understanding
- Karışık (Mixed): mix of all levels

Return JSON:
{
  "title": "exam title (e.g. 'Present Perfect Tense – Unit 3 Quiz')",
  "subtitle": "Name: _________________  Date: ___________  Class: ___________  Score: ___/100",
  "instructions": "General instructions for the student (2-3 sentences)",
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice | truefalse | fill | short_answer",
      "question": "the question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "the correct answer"
    }
  ],
  "answerKey": "Full answer key as a readable string, e.g. '1-A, 2-True, 3-has gone, ...'"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            instructions: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  number: { type: 'number' },
                  type: { type: 'string' },
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  answer: { type: 'string' }
                }
              }
            },
            answerKey: { type: 'string' }
          }
        }
      });

      if (res?.title && res?.questions?.length > 0) {
        setQuizData(res);
        showToast({ message: `✅ ${res.questions.length} soruluk test oluşturuldu!` });
      } else {
        showToast({ message: 'Test oluşturulamadı', type: 'error' });
      }
    } catch (e) {
      showToast({ message: 'Hata: ' + e.message, type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const buildPDF = (includeAnswers) => {
    if (!quizData) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 18;
    const usableW = pageW - margin * 2;
    let y = 20;

    const addText = (text, opts = {}) => {
      const { fontSize = 10, fontStyle = 'normal', color = [30, 30, 30], lineHeight = 6 } = opts;
      doc.setFontSize(fontSize); doc.setFont('helvetica', fontStyle); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(fixTR(String(text)), usableW);
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y); y += lineHeight;
      });
    };

    // Header
    const headerColor = includeAnswers ? [16, 185, 129] : [245, 158, 11];
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(fixTR(`EduTakip – ${includeAnswers ? 'Cevap Anahtari' : 'Deneme Sinavi'}`), margin, 9);
    doc.text(new Date().toLocaleDateString('tr-TR'), pageW - margin, 9, { align: 'right' });
    y = 24;

    // Title
    addText(quizData.title, { fontSize: 15, fontStyle: 'bold', color: [30, 27, 75], lineHeight: 8 });
    // Meta badges
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
    doc.text(fixTR(`${form.grade}  •  Zorluk: ${difficulty}  •  ${questionCount} Soru  •  ${questionType}`), margin, y);
    y += 5;
    // Subtitle (student info line)
    doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text(fixTR(quizData.subtitle || 'Name: _________________  Date: ___________  Score: ___/100'), margin, y);
    y += 4;
    doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y); y += 7;

    // Instructions
    if (quizData.instructions) {
      addText(quizData.instructions, { fontSize: 9, color: [80, 80, 80], lineHeight: 5 });
      y += 4;
    }

    if (includeAnswers) {
      // Answer key only
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin, y - 4, usableW, 10, 2, 2, 'F');
      addText('CEVAP ANAHTARI', { fontSize: 11, fontStyle: 'bold', color: [5, 150, 105], lineHeight: 8 });
      y += 2;
      addText(quizData.answerKey || '', { fontSize: 9.5, color: [30, 30, 30], lineHeight: 6 });
    } else {
      // Questions
      quizData.questions?.forEach((q, idx) => {
        if (y > 258) { doc.addPage(); y = 20; }

        // Question number + type badge
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(margin, y - 3.5, usableW, 8, 2, 2, 'F');
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 100, 0);
        doc.text(`${q.number}.`, margin + 2, y + 1);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
        const qText = doc.splitTextToSize(fixTR(q.question), usableW - 14);
        doc.text(qText, margin + 8, y + 1);
        y += qText.length * 5.5 + 3;

        // Options
        if (q.options?.length > 0) {
          q.options.forEach(opt => {
            if (y > 278) { doc.addPage(); y = 20; }
            const optLines = doc.splitTextToSize(fixTR(opt), usableW - 8);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
            doc.text(optLines, margin + 8, y);
            y += optLines.length * 5.5;
          });
        } else if (q.type === 'fill') {
          doc.setFontSize(9); doc.setTextColor(150, 150, 150);
          doc.text('Cevap: __________________________', margin + 8, y);
          y += 6;
        } else if (q.type === 'truefalse') {
          doc.setFontSize(9); doc.setTextColor(60, 60, 60);
          doc.text('O True (Dogru)     O False (Yanlis)', margin + 8, y);
          y += 6;
        } else {
          doc.setFontSize(9); doc.setTextColor(150, 150, 150);
          doc.text('Cevap: _________________________________________________', margin + 8, y);
          y += 6;
        }
        y += 3;
      });
    }

    // Footer
    doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(160, 160, 160);
    doc.text('EduTakip AI Quiz Generator', pageW / 2, 289, { align: 'center' });

    const suffix = includeAnswers ? '_cevap_anahtari' : '_test';
    doc.save(`${quizData.title.replace(/[^a-zA-Z0-9\s]/g, '').trim()}${suffix}.pdf`);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Geri
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(245,158,11,0.3)' }}>
            <ClipboardList size={20} color='white' />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', margin: 0 }}>Deneme Sınavı / Quiz Oluştur</h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Konuya özel test oluştur ve PDF olarak indir</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          📋 Ders Bilgileri
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <SelectField label='Sınıf Seviyesi *' value={form.grade} onChange={v => setForm(p => ({ ...p, grade: v }))} options={GRADE_LEVELS} placeholder='Sınıf seçin...' />
          <InputField label='Ünite' value={form.unit} onChange={v => setForm(p => ({ ...p, unit: v }))} placeholder='Ör: Unit 3 – Free Time' />
          <InputField label='Konu *' value={form.topic} onChange={v => setForm(p => ({ ...p, topic: v }))} placeholder='Ör: Present Perfect Tense' />
          <InputField label='Kitap' value={form.book} onChange={v => setForm(p => ({ ...p, book: v }))} placeholder='Ör: Speak Out B1' />
        </div>

        <div style={{ height: 1, background: '#f3f4f6', margin: '1rem 0' }} />

        <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ⚙️ Test Ayarları
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Soru sayısı */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>Soru Sayısı</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {QUESTION_COUNTS.map(n => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: 8, border: '1.5px solid', borderColor: questionCount === n ? '#f59e0b' : '#e5e7eb', background: questionCount === n ? '#fffbeb' : 'white', color: questionCount === n ? '#d97706' : '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* Zorluk */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>Zorluk Derecesi</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {DIFFICULTIES.map(d => {
                const colors = { 'Kolay': '#10b981', 'Orta': '#f59e0b', 'Zor': '#ef4444', 'Karışık': '#6366f1' };
                const bgs = { 'Kolay': '#d1fae5', 'Orta': '#fef3c7', 'Zor': '#fee2e2', 'Karışık': '#eef2ff' };
                const sel = difficulty === d;
                return (
                  <button key={d} onClick={() => setDifficulty(d)}
                    style={{ padding: '0.4rem 0.85rem', borderRadius: 8, border: `1.5px solid ${sel ? colors[d] : '#e5e7eb'}`, background: sel ? bgs[d] : 'white', color: sel ? colors[d] : '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Soru türü */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>Soru Türü</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {QUESTION_TYPES.map(t => (
                <button key={t} onClick={() => setQuestionType(t)}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: 8, border: '1.5px solid', borderColor: questionType === t ? '#6366f1' : '#e5e7eb', background: questionType === t ? '#eef2ff' : 'white', color: questionType === t ? '#4f46e5' : '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ek notlar */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Ek Notlar (isteğe bağlı)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder='Öğrencilerin zorlandığı konular, özellikle sorulmasını istediğiniz kavramlar...' rows={3}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, background: '#fafafa' }}
            onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        <button onClick={handleGenerate} disabled={!formReady || generating}
          style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 12, border: 'none', background: formReady && !generating ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#e5e7eb', color: formReady && !generating ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.9rem', cursor: formReady && !generating ? 'pointer' : 'default', boxShadow: formReady && !generating ? '0 4px 14px rgba(245,158,11,0.35)' : 'none' }}>
          {generating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
          {generating ? `${questionCount} Soruluk Test Oluşturuluyor...` : `${questionCount} Soruluk Test Oluştur`}
        </button>
      </div>

      {/* Quiz Result */}
      {quizData && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #fde68a', padding: '1.5rem', boxShadow: '0 4px 16px rgba(245,158,11,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <CheckCircle size={20} color='#f59e0b' />
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', margin: 0 }}>Test Hazır! ({quizData.questions?.length} Soru)</h2>
          </div>

          {/* Preview */}
          <div style={{ background: '#fffbeb', borderRadius: 14, padding: '1rem', marginBottom: '1.25rem', border: '1px solid #fde68a', maxHeight: 320, overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1rem', color: 'white' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.95rem', margin: '0 0 0.3rem' }}>{quizData.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: 12 }}>{form.grade}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: 12 }}>⚡ {difficulty}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: 12 }}>{quizData.questions?.length} Soru</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: 12 }}>{questionType}</span>
              </div>
            </div>
            {quizData.questions?.slice(0, 5).map((q, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 10, padding: '0.65rem 0.85rem', marginBottom: '0.5rem', border: '1px solid #fde68a' }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', margin: '0 0 0.25rem' }}>{q.number}. {q.question}</p>
                {q.options?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    {q.options.map((opt, j) => <p key={j} style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, paddingLeft: '0.5rem' }}>{opt}</p>)}
                  </div>
                )}
              </div>
            ))}
            {quizData.questions?.length > 5 && (
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', margin: '0.5rem 0 0' }}>... ve {quizData.questions.length - 5} soru daha (PDF'te görünecek)</p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => buildPDF(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
              <FileDown size={16} /> Test PDF İndir
            </button>
            <button onClick={() => buildPDF(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
              <CheckCircle size={16} /> Cevap Anahtarı PDF
            </button>
            <button onClick={() => { setQuizData(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              <RotateCcw size={14} /> Yeniden Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Game Mode (existing flow) ─────────────────────────────────
function HomeworkPreview({ homework, editing, onEditChange, students, onAssign, assigning, onLastAssignedId }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  if (!homework) return null;
  const sections = [
    { key: 'vocabulary', title: 'Exercise 1 – Vocabulary Practice', icon: '📖' },
    { key: 'grammar', title: 'Exercise 2 – Grammar Exercise', icon: '✏️' },
    { key: 'reading', title: 'Exercise 3 – Reading Activity', icon: '📚' },
    { key: 'writing', title: 'Exercise 4 – Writing Task', icon: '🖊️' },
    { key: 'speaking', title: 'Exercise 5 – Speaking Activity (Optional)', icon: '🎤', optional: true },
  ];
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', color: 'white' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.4rem' }}>Homework</div>
        {editing ? (
          <input value={homework.title} onChange={e => onEditChange({ ...homework, title: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'white', fontSize: '1.1rem', fontWeight: 800, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} />
        ) : (
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{homework.title}</h2>
        )}
        {homework.instructions && <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.5 }}>{homework.instructions}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {homework.grade && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>📚 {homework.grade}</span>}
          {homework.difficulty && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>⚡ {homework.difficulty}</span>}
        </div>
      </div>
      {sections.map(sec => {
        const content = homework[sec.key];
        if (!content && sec.optional) return null;
        return (
          <div key={sec.key} style={{ background: '#f8fafc', borderRadius: 14, padding: '1.1rem', marginBottom: '0.75rem', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{sec.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#374151' }}>{sec.title}</span>
            </div>
            {editing ? (
              <textarea value={content || ''} onChange={e => onEditChange({ ...homework, [sec.key]: e.target.value })} rows={4}
                style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.65rem', fontSize: '0.85rem', color: '#374151', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{content || <span style={{ color: '#9ca3af' }}>—</span>}</p>
            )}
          </div>
        );
      })}
      {onLastAssignedId && (
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 14, padding: '1.1rem', border: '1.5px solid #6366f1', marginTop: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.88rem', color: 'white', margin: '0 0 0.2rem' }}>✅ Ödev Atandı!</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Öğrenci interaktif sorularla çözebilir</p>
          </div>
          <a href={`/HomeworkSolver?id=${onLastAssignedId}`} target="_blank" rel="noopener noreferrer"
            style={{ padding: '0.55rem 1.1rem', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            🎮 Önizle
          </a>
        </div>
      )}
      <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '1.1rem', border: '1.5px solid #bbf7d0', marginTop: '0.5rem' }}>
        <p style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065f46', marginBottom: '0.75rem' }}>📤 Ödevi Öğrenciye Ata</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>Öğrenci</label>
            <div style={{ position: 'relative' }}>
              <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 2rem 0.65rem 0.85rem', borderRadius: 10, border: '1.5px solid #a7f3d0', fontSize: '0.88rem', color: selectedStudentId ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                <option value=''>Öğrenci seçin...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={14} color='#9ca3af' style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <button onClick={() => onAssign(selectedStudentId, students.find(s => s.id === selectedStudentId))} disabled={!selectedStudentId || assigning}
            style={{ padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: selectedStudentId ? 'linear-gradient(135deg,#10b981,#059669)' : '#e5e7eb', color: selectedStudentId ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.88rem', cursor: selectedStudentId ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            {assigning ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {assigning ? 'Atanıyor...' : 'Ödevi Ata'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GameMode({ me, students, onBack }) {
  const [step, setStep] = useState(0);
  const [lessonInfo, setLessonInfo] = useState({ grade: '', unit: '', topic: '', book: '', pages: '' });
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [lastAssignedHwId, setLastAssignedHwId] = useState(null);
  const [homework, setHomework] = useState(null);
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showGamePool, setShowGamePool] = useState(false);
  const [showSaveToPool, setShowSaveToPool] = useState(false);
  const [revisePrompt, setRevisePrompt] = useState('');
  const [revising, setRevising] = useState(false);

  const lessonReady = lessonInfo.grade && lessonInfo.topic;

  const handleImageUpload = async (files) => {
    setUploading(true);
    const newImgs = Array.from(files).slice(0, 5);
    setImages(prev => [...prev, ...newImgs].slice(0, 5));
    const urls = [];
    for (const f of newImgs) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        if (res?.file_url) urls.push(res.file_url);
      } catch { }
    }
    setUploadedUrls(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, j) => j !== i));
    setUploadedUrls(prev => prev.filter((_, j) => j !== i));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true); setOverlayVisible(true); setShowSuccess(false); setStep(3);
    try {
      const res = await base44.functions.invoke('generateAIHomework', { lessonInfo, notes, imageUrls: uploadedUrls });
      if (res.data?.homework) {
        setHomework(res.data.homework); setAnalysis(res.data.analysis); setQuestions(res.data.questions || []);
        setAnalyzing(false); setShowSuccess(true);
        setTimeout(() => { setOverlayVisible(false); setTimeout(() => { setShowSuccess(false); setStep(4); }, 500); }, 1900);
      } else {
        showToast({ message: 'AI analizi başarısız oldu', type: 'error' }); setOverlayVisible(false); setStep(2);
      }
    } catch (e) {
      showToast({ message: 'Bir hata oluştu: ' + e.message, type: 'error' }); setOverlayVisible(false); setStep(2);
    } finally { setAnalyzing(false); }
  };

  const handleAssign = async (studentId, student) => {
    if (!studentId || !homework) return;
    setAssigning(true);
    try {
      const homeworkText = [homework.title, '', homework.instructions || '', '',
        homework.vocabulary ? `📖 Vocabulary Practice:\n${homework.vocabulary}` : '',
        homework.grammar ? `\n✏️ Grammar Exercise:\n${homework.grammar}` : '',
        homework.reading ? `\n📚 Reading Activity:\n${homework.reading}` : '',
        homework.writing ? `\n🖊️ Writing Task:\n${homework.writing}` : '',
        homework.speaking ? `\n🎤 Speaking Activity:\n${homework.speaking}` : '',
      ].filter(Boolean).join('\n');
      const created = await base44.entities.Homework.create({ studentId, studentName: student?.name || '', teacherEmail: me.email, title: homework.title, description: homeworkText, status: 'verildi', questions });
      setLastAssignedHwId(created?.id);
      showToast({ message: `📚 Ödev atandı — ${student?.name}` });
    } catch (e) { showToast({ message: 'Ödev atanırken hata oluştu', type: 'error' }); }
    finally { setAssigning(false); }
  };

  const handleRevise = async () => {
    if (!revisePrompt.trim() || !homework) return;
    setRevising(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an English teacher. You have an existing homework assignment and the teacher wants to revise it.\n\nCURRENT HOMEWORK:\nTitle: ${homework.title}\nInstructions: ${homework.instructions || ''}\nVocabulary Section: ${homework.vocabulary || ''}\nGrammar Section: ${homework.grammar || ''}\nReading Section: ${homework.reading || ''}\nWriting Section: ${homework.writing || ''}\nSpeaking Section: ${homework.speaking || ''}\n\nTEACHER'S REVISION REQUEST:\n"${revisePrompt}"\n\nApply the teacher's requested changes. Return ONLY valid JSON with the same structure, updating only relevant sections. Keep unchanged sections exactly as they are.`,
        response_json_schema: {
          type: 'object',
          properties: { title: { type: 'string' }, grade: { type: 'string' }, difficulty: { type: 'string' }, instructions: { type: 'string' }, vocabulary: { type: 'string' }, grammar: { type: 'string' }, reading: { type: 'string' }, writing: { type: 'string' }, speaking: { type: 'string' } }
        }
      });
      if (res?.title) { setHomework(prev => ({ ...prev, ...res })); setRevisePrompt(''); showToast({ message: '✅ Ödev güncellendi!' }); }
      else showToast({ message: 'Güncelleme başarısız oldu', type: 'error' });
    } catch (e) { showToast({ message: 'Hata: ' + e.message, type: 'error' }); }
    finally { setRevising(false); }
  };

  const resetAll = () => {
    setStep(0); setLessonInfo({ grade: '', unit: '', topic: '', book: '', pages: '' }); setNotes('');
    setImages([]); setUploadedUrls([]); setAnalysis(null); setHomework(null); setQuestions([]);
    setLastAssignedHwId(null); setEditing(false); setOverlayVisible(false); setShowSuccess(false);
    setRevisePrompt(''); setRevising(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
        @keyframes pulse-ring { 0%{transform:scale(0.85);opacity:0.6} 50%{transform:scale(1.15);opacity:0} 100%{transform:scale(0.85);opacity:0} }
        @keyframes shimmer-text { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-8px);opacity:1} }
        @keyframes success-pop { 0%{transform:scale(0.4);opacity:0} 65%{transform:scale(1.12)} 85%{transform:scale(0.97)} 100%{transform:scale(1);opacity:1} }
        @keyframes check-draw { 0%{stroke-dashoffset:50} 100%{stroke-dashoffset:0} }
        @keyframes fade-in-up { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>

      {(analyzing || showSuccess) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', background: showSuccess ? 'linear-gradient(135deg,#0a1628,#0d2137,#0a1628)' : 'linear-gradient(135deg,#0f0c29,#1a1a3e,#0f0c29)', opacity: overlayVisible ? 1 : 0, transition: 'background 0.6s ease, opacity 0.45s ease', pointerEvents: overlayVisible ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', opacity: showSuccess ? 0 : 1, transform: showSuccess ? 'scale(0.9)' : 'scale(1)', transition: 'opacity 0.4s ease, transform 0.4s ease', position: showSuccess ? 'absolute' : 'relative', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.5)', animation: 'pulse-ring 1.8s ease-out infinite' }} />
              <div style={{ position: 'absolute', width: 108, height: 108, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.4)', animation: 'pulse-ring 1.8s ease-out 0.5s infinite' }} />
              <div style={{ width: 84, height: 84, borderRadius: '24px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.5)', animation: 'heartbeat 1.8s ease-in-out infinite' }}>
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 56, height: 56, borderRadius: '14px', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem' }}>EduTakip</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0, animation: 'shimmer-text 2s ease-in-out infinite' }}>AI ile ödev oluşturuluyor...</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[0, 0.2, 0.4].map(d => <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: `dot-bounce 1.2s ease-in-out ${d}s infinite` }} />)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', opacity: showSuccess ? 1 : 0, transform: showSuccess ? 'scale(1)' : 'scale(1.05)', transition: 'opacity 0.45s ease 0.15s, transform 0.45s ease 0.15s', position: showSuccess ? 'relative' : 'absolute', pointerEvents: showSuccess ? 'auto' : 'none' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: showSuccess ? 'success-pop 0.55s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both' : 'none' }}>
              <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.35)', animation: showSuccess ? 'pulse-ring 1.6s ease-out 0.5s infinite' : 'none' }} />
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34,197,94,0.45)' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <polyline points="9,20 17,28 31,12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" style={{ animation: showSuccess ? 'check-draw 0.45s ease 0.4s both' : 'none' }} />
                </svg>
              </div>
            </div>
            <div style={{ textAlign: 'center', animation: showSuccess ? 'fade-in-up 0.4s ease 0.5s both' : 'none' }}>
              <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Ödev Oluşturuldu!</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>AI ödevinizi hazırladı, düzenleyebilirsiniz.</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Geri
            </button>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(99,102,241,0.3)' }}>
              <Gamepad2 size={20} color='white' />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', margin: 0 }}>Oyun Ödev Oluştur</h1>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>İnteraktif sorularla ödev hazırla</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowGamePool(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <Gamepad2 size={14} /> Oyun Havuzu
            </button>
            {step > 0 && (
              <button onClick={resetAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                <RotateCcw size={14} /> Yeniden Başla
              </button>
            )}
          </div>
        </div>

        <StepIndicator current={step} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <SectionCard title='Ders Seçimi' icon={BookOpen} iconColor='#6366f1' iconBg='#eef2ff' step={0} current={step}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <SelectField label='Sınıf Seviyesi *' value={lessonInfo.grade} onChange={v => setLessonInfo(p => ({ ...p, grade: v }))} options={GRADE_LEVELS} placeholder='Sınıf seçin...' />
              <InputField label='Ünite Adı' value={lessonInfo.unit} onChange={v => setLessonInfo(p => ({ ...p, unit: v }))} placeholder='Ör: Unit 3 – Free Time' />
              <InputField label='Konu Başlığı *' value={lessonInfo.topic} onChange={v => setLessonInfo(p => ({ ...p, topic: v }))} placeholder='Ör: Present Perfect Tense' />
              <InputField label='Kullanılan Kitap' value={lessonInfo.book} onChange={v => setLessonInfo(p => ({ ...p, book: v }))} placeholder='Ör: Speak Out B1' />
              <InputField label='Sayfa Numaraları' value={lessonInfo.pages} onChange={v => setLessonInfo(p => ({ ...p, pages: v }))} placeholder='Ör: 48-52' />
            </div>
            <button onClick={() => setStep(1)} disabled={!lessonReady}
              style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: lessonReady ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb', color: lessonReady ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.9rem', cursor: lessonReady ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: lessonReady ? '0 4px 14px rgba(99,102,241,0.3)' : 'none' }}>
              Devam Et →
            </button>
          </SectionCard>

          <SectionCard title='Ders Notları' icon={FileText} iconColor='#f97316' iconBg='#fff7ed' step={1} current={step}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>Bu derste neler yaptınız? Öğrencilerin zorlandığı noktalar, etkinlikler, öğretilen kelimeler...</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder='Örnek: Bugün Present Perfect Tense konusunu işledik...' rows={7}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.85rem', fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.65, background: '#fafafa' }}
              onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setStep(0)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>← Geri</button>
              <button onClick={() => setStep(2)} style={{ padding: '0.65rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}>Devam Et →</button>
            </div>
          </SectionCard>

          <SectionCard title='Görsel Yükleme' icon={Upload} iconColor='#10b981' iconBg='#d1fae5' step={2} current={step}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.85rem', lineHeight: 1.5 }}>Kitap sayfaları, tahta fotoğrafları gibi görselleri yükleyin. (İsteğe bağlı, max 5)</p>
            <input ref={fileRef} type='file' multiple accept='image/*' style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files)} />
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #a7f3d0', borderRadius: 14, padding: '2rem', textAlign: 'center', background: '#f0fdf4', cursor: 'pointer', transition: 'all 0.2s', marginBottom: images.length ? '1rem' : 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#dcfce7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.background = '#f0fdf4'; }}>
              {uploading ? <Loader2 size={28} color='#10b981' style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} /> : <Upload size={28} color='#10b981' style={{ marginBottom: '0.5rem' }} />}
              <p style={{ fontWeight: 700, color: '#065f46', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}</p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Kitap sayfası, tahta, çalışma kağıdı (max 5)</p>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', border: '2px solid #a7f3d0' }}>
                    <img src={URL.createObjectURL(img)} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} color='white' />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>← Geri</button>
              <button onClick={handleAnalyze} disabled={uploading}
                style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: uploading ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#7c3aed)', color: uploading ? '#9ca3af' : 'white', fontWeight: 800, fontSize: '0.9rem', cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: uploading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)' }}>
                <Sparkles size={18} /> AI ile Analiz Et & Ödev Oluştur
              </button>
            </div>
          </SectionCard>

          <SectionCard title='AI Analizi' icon={Zap} iconColor='#7c3aed' iconBg='#f5f3ff' step={3} current={step}>
            {analyzing && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
                  <Sparkles size={28} color='white' style={{ animation: 'spin 2s linear infinite' }} />
                </div>
                <p style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', marginBottom: '0.35rem' }}>Ders analiz ediliyor...</p>
                <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>AI ders bilgilerini, notları ve görselleri inceliyor</p>
              </div>
            )}
            {analysis && !analyzing && (
              <div>
                {[{ label: '📚 Öğrenilen Konular', value: analysis.learnedTopics }, { label: '🔁 Pekiştirilmesi Gerekenler', value: analysis.needsReinforcement }, { label: '📝 Tekrar Edilecek Kelimeler', value: analysis.vocabulary }, { label: '⚡ Zorluk Seviyesi', value: analysis.difficulty }].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ marginBottom: '0.65rem', background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{row.label}</p>
                    <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title='Oluşturulan Ödev' icon={BookOpen} iconColor='#059669' iconBg='#d1fae5' step={4} current={step}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              {questions?.length > 0 && (
                <button onClick={() => setShowSaveToPool(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <Save size={13} /> Havuza Kaydet
                </button>
              )}
              <button onClick={() => setEditing(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: editing ? '#eef2ff' : 'white', color: editing ? '#4f46e5' : '#374151', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                <Pencil size={13} /> {editing ? 'Düzenlemeyi Bitir' : 'Ödevi Düzenle'}
              </button>
            </div>

            {/* AI Revize Kutusu */}
            <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f0f4ff)', borderRadius: 14, padding: '1rem 1.1rem', border: '1.5px solid #e0d7ff', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 800, fontSize: '0.82rem', color: '#5b21b6', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> Değişiklik yapmak istediğiniz bir yer var mı?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <textarea value={revisePrompt} onChange={e => setRevisePrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && revisePrompt.trim() && !revising) { e.preventDefault(); handleRevise(); } }}
                  placeholder='Örn: Grammar bölümünü daha kolay yap, 5 soru yerine 3 soru olsun...' rows={2} disabled={revising}
                  style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: 10, border: '1.5px solid #c4b5fd', fontSize: '0.85rem', color: '#111827', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.55, background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#c4b5fd'} />
                <button onClick={handleRevise} disabled={!revisePrompt.trim() || revising}
                  style={{ padding: '0.65rem 1rem', borderRadius: 10, border: 'none', background: revisePrompt.trim() && !revising ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : '#e5e7eb', color: revisePrompt.trim() && !revising ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.82rem', cursor: revisePrompt.trim() && !revising ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: revisePrompt.trim() && !revising ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}>
                  {revising ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                  {revising ? 'Güncelleniyor...' : 'Uygula'}
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#7c3aed', opacity: 0.7, marginTop: '0.4rem', marginBottom: 0 }}>Enter tuşuyla da gönderebilirsiniz</p>
            </div>

            <HomeworkPreview homework={homework} editing={editing} onEditChange={setHomework} students={students} onAssign={handleAssign} assigning={assigning} onLastAssignedId={lastAssignedHwId} />
          </SectionCard>
        </div>
      </div>

      {showGamePool && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, overflowY: 'auto', background: '#f8fafc' }}>
          <GamePoolPage onClose={() => setShowGamePool(false)} onSelectGame={(game) => { setQuestions(game.questions || []); setShowGamePool(false); showToast({ message: `"${game.title}" oyunundan ${game.questions?.length} soru yüklendi` }); }} />
        </div>
      )}
      {showSaveToPool && <SaveToPoolModal questions={questions} teacherEmail={me?.email} onClose={() => setShowSaveToPool(false)} onSaved={() => {}} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AIHomeworkGenerator() {
  const [mode, setMode] = useState(null); // null | 'pdf' | 'game'
  const [me, setMe] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setMe(u);
      base44.entities.Student.filter({ teacherEmail: u.email, status: 'active' }).then(setStudents);
    });
  }, []);

  if (mode === 'pdf') return <PDFMode me={me} onBack={() => setMode(null)} />;
  if (mode === 'quiz') return <QuizMode onBack={() => setMode(null)} />;
  if (mode === 'game') return <GameMode me={me} students={students} onBack={() => setMode(null)} />;
  return <ModeSelection onSelect={setMode} />;
}