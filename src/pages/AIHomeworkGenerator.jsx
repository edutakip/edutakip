import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Upload, X, BookOpen, ChevronDown, Loader2, CheckCircle, Send, Pencil, User, Image as ImageIcon, FileText, Zap, RotateCcw, Gamepad2, Save } from 'lucide-react';
import GamePoolPage, { SaveToPoolModal } from './GamePoolPage';
import { showToast } from '@/lib/toast';

const GRADE_LEVELS = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];

const STEP_LABELS = ['Ders Seçimi', 'Ders Notları', 'Görsel Yükleme', 'AI Analizi', 'Ödev'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#10b981' : active ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: active ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}>
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
    <div style={{
      background: 'white', borderRadius: 20,
      border: `1.5px solid ${isActive ? '#c7d2fe' : isDone ? '#bbf7d0' : '#f1f5f9'}`,
      boxShadow: isActive ? '0 4px 24px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden', transition: 'all 0.25s',
      opacity: step > current ? 0.5 : 1,
    }}>
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
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 2.2rem 0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: value ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
        >
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
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
  );
}

// ── Homework Preview ──────────────────────────────────────────
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
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', color: 'white' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.4rem' }}>Homework</div>
        {editing ? (
          <input
            value={homework.title}
            onChange={e => onEditChange({ ...homework, title: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'white', fontSize: '1.1rem', fontWeight: 800, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
          />
        ) : (
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{homework.title}</h2>
        )}
        {homework.instructions && (
          <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.5 }}>{homework.instructions}</p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {homework.grade && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>📚 {homework.grade}</span>}
          {homework.difficulty && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>⚡ {homework.difficulty}</span>}
        </div>
      </div>

      {/* Sections */}
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
              <textarea
                value={content || ''}
                onChange={e => onEditChange({ ...homework, [sec.key]: e.target.value })}
                rows={4}
                style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.65rem', fontSize: '0.85rem', color: '#374151', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{content || <span style={{ color: '#9ca3af' }}>—</span>}</p>
            )}
          </div>
        );
      })}

      {/* Assign section */}
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
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 2rem 0.65rem 0.85rem', borderRadius: 10, border: '1.5px solid #a7f3d0', fontSize: '0.88rem', color: selectedStudentId ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <option value=''>Öğrenci seçin...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={14} color='#9ca3af' style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <button
            onClick={() => onAssign(selectedStudentId, students.find(s => s.id === selectedStudentId))}
            disabled={!selectedStudentId || assigning}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none',
              background: selectedStudentId ? 'linear-gradient(135deg,#10b981,#059669)' : '#e5e7eb',
              color: selectedStudentId ? 'white' : '#9ca3af',
              fontWeight: 800, fontSize: '0.88rem', cursor: selectedStudentId ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap',
            }}
          >
            {assigning ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {assigning ? 'Atanıyor...' : 'Ödevi Ata'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AIHomeworkGenerator() {
  const [me, setMe] = useState(null);
  const [students, setStudents] = useState([]);
  const [step, setStep] = useState(0);

  // Step 0: Lesson info
  const [lessonInfo, setLessonInfo] = useState({ grade: '', unit: '', topic: '', book: '', pages: '' });

  // Step 1: Notes
  const [notes, setNotes] = useState('');

  // Step 2: Images
  const [images, setImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Step 3: Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [lastAssignedHwId, setLastAssignedHwId] = useState(null);

  // Step 4: Homework
  const [homework, setHomework] = useState(null);
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showGamePool, setShowGamePool] = useState(false);
  const [showSaveToPool, setShowSaveToPool] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setMe(u);
      base44.entities.Student.filter({ teacherEmail: u.email, status: 'active' }).then(setStudents);
    });
  }, []);

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
      } catch { /* ignore */ }
    }
    setUploadedUrls(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, j) => j !== i));
    setUploadedUrls(prev => prev.filter((_, j) => j !== i));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setOverlayVisible(true);
    setShowSuccess(false);
    setStep(3);
    try {
      const res = await base44.functions.invoke('generateAIHomework', {
        lessonInfo,
        notes,
        imageUrls: uploadedUrls,
      });
      if (res.data?.homework) {
        setHomework(res.data.homework);
        setAnalysis(res.data.analysis);
        setQuestions(res.data.questions || []);
        setAnalyzing(false);
        setShowSuccess(true);
        setTimeout(() => {
          setOverlayVisible(false);
          setTimeout(() => {
            setShowSuccess(false);
            setStep(4);
          }, 500);
        }, 1900);
      } else {
        showToast({ message: 'AI analizi başarısız oldu', type: 'error' });
        setOverlayVisible(false);
        setStep(2);
      }
    } catch (e) {
      showToast({ message: 'Bir hata oluştu: ' + e.message, type: 'error' });
      setOverlayVisible(false);
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAssign = async (studentId, student) => {
    if (!studentId || !homework) return;
    setAssigning(true);
    try {
      const homeworkText = [
        homework.title,
        '',
        homework.instructions || '',
        '',
        homework.vocabulary ? `📖 Vocabulary Practice:\n${homework.vocabulary}` : '',
        homework.grammar ? `\n✏️ Grammar Exercise:\n${homework.grammar}` : '',
        homework.reading ? `\n📚 Reading Activity:\n${homework.reading}` : '',
        homework.writing ? `\n🖊️ Writing Task:\n${homework.writing}` : '',
        homework.speaking ? `\n🎤 Speaking Activity:\n${homework.speaking}` : '',
      ].filter(Boolean).join('\n');

      const created = await base44.entities.Homework.create({
        studentId,
        studentName: student?.name || '',
        teacherEmail: me.email,
        title: homework.title,
        description: homeworkText,
        status: 'verildi',
        questions: questions,
      });
      setLastAssignedHwId(created?.id);
      showToast({ message: `📚 Ödev atandı — ${student?.name}` });
    } catch (e) {
      showToast({ message: 'Ödev atanırken hata oluştu', type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setLessonInfo({ grade: '', unit: '', topic: '', book: '', pages: '' });
    setNotes('');
    setImages([]);
    setUploadedUrls([]);
    setAnalysis(null);
    setHomework(null);
    setQuestions([]);
    setLastAssignedHwId(null);
    setEditing(false);
    setOverlayVisible(false);
    setShowSuccess(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} }
        @keyframes pulse-ring { 0%{transform:scale(0.85);opacity:0.6} 50%{transform:scale(1.15);opacity:0} 100%{transform:scale(0.85);opacity:0} }
        @keyframes shimmer-text { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-8px);opacity:1} }
        @keyframes success-pop { 0%{transform:scale(0.4);opacity:0} 65%{transform:scale(1.12)} 85%{transform:scale(0.97)} 100%{transform:scale(1);opacity:1} }
        @keyframes check-draw { 0%{stroke-dashoffset:50} 100%{stroke-dashoffset:0} }
        @keyframes fade-in-up { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Loading / Success Overlay ── */}
      {(analyzing || showSuccess) && (
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
          {/* LOADING içeriği */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
            opacity: showSuccess ? 0 : 1,
            transform: showSuccess ? 'scale(0.9)' : 'scale(1)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            position: showSuccess ? 'absolute' : 'relative',
            pointerEvents: 'none',
          }}>
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
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0, animation: 'shimmer-text 1.5s ease-in-out 0.3s infinite' }}>AI ile ödev oluşturuluyor...</p>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: showSuccess ? 'success-pop 0.55s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both' : 'none' }}>
              <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.35)', animation: showSuccess ? 'pulse-ring 1.6s ease-out 0.5s infinite' : 'none' }} />
              <div style={{ position: 'absolute', width: 96, height: 96, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.2)', animation: showSuccess ? 'pulse-ring 1.6s ease-out 0.85s infinite' : 'none' }} />
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34,197,94,0.45)' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <polyline points="9,20 17,28 31,12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50"
                    style={{ strokeDashoffset: showSuccess ? undefined : '50', animation: showSuccess ? 'check-draw 0.45s ease 0.4s both' : 'none' }} />
                </svg>
              </div>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem',
              animation: showSuccess ? 'fade-in-up 0.4s ease 0.5s both' : 'none' }}>
              <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Ödev Oluşturuldu!</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0 }}>AI ödevinizi hazırladı, düzenleyebilirsiniz.</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(1rem,4vw,2rem)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}>
              <Sparkles size={24} color='white' />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>AI Ödev Oluşturucu</h1>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.15rem 0 0' }}>Dersi analiz et, otomatik ödev oluştur</p>
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

          {/* ── STEP 0: Ders Seçimi ── */}
          <SectionCard title='Ders Seçimi' icon={BookOpen} iconColor='#6366f1' iconBg='#eef2ff' step={0} current={step}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <SelectField label='Sınıf Seviyesi *' value={lessonInfo.grade} onChange={v => setLessonInfo(p => ({ ...p, grade: v }))} options={GRADE_LEVELS} placeholder='Sınıf seçin...' />
              <InputField label='Ünite Adı' value={lessonInfo.unit} onChange={v => setLessonInfo(p => ({ ...p, unit: v }))} placeholder='Ör: Unit 3 – Free Time' />
              <InputField label='Konu Başlığı *' value={lessonInfo.topic} onChange={v => setLessonInfo(p => ({ ...p, topic: v }))} placeholder='Ör: Present Perfect Tense' />
              <InputField label='Kullanılan Kitap' value={lessonInfo.book} onChange={v => setLessonInfo(p => ({ ...p, book: v }))} placeholder='Ör: Speak Out B1' />
              <InputField label='Sayfa Numaraları' value={lessonInfo.pages} onChange={v => setLessonInfo(p => ({ ...p, pages: v }))} placeholder='Ör: 48-52' />
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!lessonReady}
              style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: lessonReady ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb', color: lessonReady ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.9rem', cursor: lessonReady ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: lessonReady ? '0 4px 14px rgba(99,102,241,0.3)' : 'none' }}
            >
              Devam Et →
            </button>
          </SectionCard>

          {/* ── STEP 1: Ders Notları ── */}
          <SectionCard title='Ders Notları' icon={FileText} iconColor='#f97316' iconBg='#fff7ed' step={1} current={step}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Bu derste neler yaptınız? Öğrencilerin zorlandığı noktalar, etkinlikler, öğretilen kelimeler, dil bilgisi yapıları gibi bilgileri yazın.
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Örnek: Bugün Present Perfect Tense konusunu işledik. Öğrenciler "have/has + past participle" yapısını öğrendi. "ever", "never", "already", "yet" zarflarını cümle içinde kullandık. Öğrenciler "yet" ve "already" kullanımında zorlandı. Kitabın 48. sayfasındaki diyalog aktivitesini yaptık. Kelimeler: experience, achievement, lately, recently...'
              rows={7}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.85rem', fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.65, background: '#fafafa' }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setStep(0)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>← Geri</button>
              <button onClick={() => setStep(2)} style={{ padding: '0.65rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}>
                Devam Et →
              </button>
            </div>
          </SectionCard>

          {/* ── STEP 2: Görsel Yükleme ── */}
          <SectionCard title='Görsel Yükleme' icon={ImageIcon} iconColor='#10b981' iconBg='#d1fae5' step={2} current={step}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.85rem', lineHeight: 1.5 }}>
              Kitap sayfaları, tahta fotoğrafları, çalışma kağıtları gibi görselleri yükleyin. AI bu görselleri de analiz edecek. (İsteğe bağlı, max 5 görsel)
            </p>

            <input ref={fileRef} type='file' multiple accept='image/*' style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files)} />

            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #a7f3d0', borderRadius: 14, padding: '2rem', textAlign: 'center', background: '#f0fdf4', cursor: 'pointer', transition: 'all 0.2s', marginBottom: images.length ? '1rem' : 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#dcfce7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.background = '#f0fdf4'; }}
            >
              {uploading ? (
                <Loader2 size={28} color='#10b981' style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
              ) : (
                <Upload size={28} color='#10b981' style={{ marginBottom: '0.5rem' }} />
              )}
              <p style={{ fontWeight: 700, color: '#065f46', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                {uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Kitap sayfası, tahta, çalışma kağıdı (max 5 adet)</p>
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
              <button
                onClick={handleAnalyze}
                disabled={uploading}
                style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: uploading ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#7c3aed)', color: uploading ? '#9ca3af' : 'white', fontWeight: 800, fontSize: '0.9rem', cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: uploading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)' }}
              >
                <Sparkles size={18} />
                AI ile Analiz Et & Ödev Oluştur
              </button>
            </div>
          </SectionCard>

          {/* ── STEP 3: AI Analizi ── */}
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
                {[
                  { label: '📚 Öğrenilen Konular', value: analysis.learnedTopics },
                  { label: '🔁 Pekiştirilmesi Gerekenler', value: analysis.needsReinforcement },
                  { label: '📝 Tekrar Edilecek Kelimeler', value: analysis.vocabulary },
                  { label: '⚡ Zorluk Seviyesi', value: analysis.difficulty },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ marginBottom: '0.65rem', background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{row.label}</p>
                    <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── STEP 4: Oluşturulan Ödev ── */}
          <SectionCard title='Oluşturulan Ödev' icon={BookOpen} iconColor='#059669' iconBg='#d1fae5' step={4} current={step}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              {questions?.length > 0 && (
                <button
                  onClick={() => setShowSaveToPool(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <Save size={13} /> Havuza Kaydet
                </button>
              )}
              <button
                onClick={() => setEditing(e => !e)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #e5e7eb', background: editing ? '#eef2ff' : 'white', color: editing ? '#4f46e5' : '#374151', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                <Pencil size={13} /> {editing ? 'Düzenlemeyi Bitir' : 'Ödevi Düzenle'}
              </button>
            </div>
            <HomeworkPreview
              homework={homework}
              editing={editing}
              onEditChange={setHomework}
              students={students}
              onAssign={handleAssign}
              assigning={assigning}
              onLastAssignedId={lastAssignedHwId}
            />
          </SectionCard>

        </div>
      </div>

      {showGamePool && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, overflowY: 'auto', background: '#f8fafc' }}>
          <GamePoolPage
            onClose={() => setShowGamePool(false)}
            onSelectGame={(game) => {
              setQuestions(game.questions || []);
              setShowGamePool(false);
              showToast({ message: `"${game.title}" oyunundan ${game.questions?.length} soru yüklendi` });
            }}
          />
        </div>
      )}

      {showSaveToPool && (
        <SaveToPoolModal
          questions={questions}
          teacherEmail={me?.email}
          onClose={() => setShowSaveToPool(false)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}