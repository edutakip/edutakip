import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, CheckCircle, Clock, AlertCircle, MessageSquare, X, Upload, Calendar } from 'lucide-react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { tr } from 'date-fns/locale';

// ── Countdown Timer ───────────────────────────────────────────
function Countdown({ dueDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!dueDate) return;
    const target = new Date(dueDate);
    const calc = () => {
      const diff = differenceInSeconds(target, new Date());
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0 }); return; }
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      setTimeLeft({ days, hours, mins });
    };
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [dueDate]);

  if (!timeLeft) return null;

  const Box = ({ val, label }) => (
    <div style={{
      background: '#2a2a2a', borderRadius: '10px', padding: '0.5rem 0.9rem',
      textAlign: 'center', minWidth: '52px',
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{ fontSize: '0.55rem', color: '#9ca3af', marginTop: '0.2rem', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
      <Box val={timeLeft.days} label="GÜN" />
      <span style={{ color: '#9ca3af', fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.8rem' }}>:</span>
      <Box val={timeLeft.hours} label="SAAT" />
      <span style={{ color: '#9ca3af', fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.8rem' }}>:</span>
      <Box val={timeLeft.mins} label="DAK" />
    </div>
  );
}

// ── Homework Modal ────────────────────────────────────────────
function HomeworkModal({ hw, student, onClose, onSubmitted }) {
  const [files, setFiles] = useState([]);
  const [teacherNote, setTeacherNote] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef();

  const MAX_PHOTOS = 25;
  const MAX_PHOTO_MB = 10;
  const MAX_PDF = 3;
  const MAX_PDF_MB = 50;

  let dueDateStr = '';
  let dueDateTimeStr = '';
  try {
    if (hw.dueDate) {
      dueDateStr = format(parseISO(hw.dueDate), "d MMMM EEEE", { locale: tr });
      dueDateTimeStr = format(parseISO(hw.dueDate), "d MMMM EEEE, HH:mm", { locale: tr });
    }
  } catch {}

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    const valid = [];
    arr.forEach(f => {
      const isImage = f.type.startsWith('image/');
      const isPdf = f.type === 'application/pdf';
      if (!isImage && !isPdf) return;
      if (isImage && f.size > MAX_PHOTO_MB * 1024 * 1024) return;
      if (isPdf && f.size > MAX_PDF_MB * 1024 * 1024) return;
      valid.push(f);
    });

    setFiles(prev => {
      const combined = [...prev, ...valid];
      const photos = combined.filter(f => f.type.startsWith('image/')).slice(0, MAX_PHOTOS);
      const pdfs = combined.filter(f => f.type === 'application/pdf').slice(0, MAX_PDF);
      return [...photos, ...pdfs];
    });
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Homework.update(hw.id, { parentNote: teacherNote || hw.parentNote });
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.25rem',
          fontFamily: 'Inter, sans-serif',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .file-zone:hover { border-color: #e07c2a !important; }
          .remove-btn:hover { background: #ef4444 !important; }
          .submit-btn:hover:not(:disabled) { background: #c96a1e !important; }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{
            background: '#e07c2a', color: 'white',
            borderRadius: '20px', padding: '0.35rem 0.9rem',
            fontWeight: '700', fontSize: '0.85rem',
          }}>
            {hw.teacherName || 'Öğretmen'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dueDateTimeStr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#9ca3af', fontSize: '0.72rem' }}>
                <Calendar size={12} />
                <span>{dueDateTimeStr}</span>
              </div>
            )}
            <button onClick={onClose} style={{
              background: '#2a2a2a', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} color="#9ca3af" />
            </button>
          </div>
        </div>

        {/* Countdown */}
        {hw.dueDate && (
          <div style={{ marginBottom: '1rem' }}>
            <Countdown dueDate={hw.dueDate} />
          </div>
        )}

        {/* Ödevin section */}
        <div style={{
          background: '#232323', borderRadius: '14px',
          padding: '1rem', marginBottom: '0.85rem',
          border: '1px solid #2e2e2e',
        }}>
          <div style={{ color: '#e07c2a', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            ÖDEVİN
          </div>
          <div style={{ color: '#e5e7eb', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {hw.description || hw.title}
          </div>
        </div>

        {/* Upload section */}
        <div style={{
          background: '#232323', borderRadius: '14px',
          padding: '1rem', marginBottom: '0.85rem',
          border: '1px solid #2e2e2e',
        }}>
          <div style={{ color: '#e07c2a', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            ÇÖZÜMLERİNİ YÜKLE
          </div>

          {/* Drop zone */}
          <div
            className="file-zone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#e07c2a' : '#3a3a3a'}`,
              borderRadius: '10px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              background: dragging ? 'rgba(224,124,42,0.05)' : 'transparent',
              marginBottom: files.length > 0 ? '0.75rem' : 0,
            }}
          >
            <Upload size={22} color="#6b7280" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              Dosyaları sürükleyin veya tıklayın
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
              Fotoğraf (maks {MAX_PHOTOS}, {MAX_PHOTO_MB}MB) veya PDF (maks {MAX_PDF}, {MAX_PDF_MB}MB)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#1a1a1a', borderRadius: '8px', padding: '0.4rem 0.6rem',
                  border: '1px solid #2e2e2e',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {f.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', flexShrink: 0 }}>
                      {(f.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(i)}
                    style={{
                      background: '#2e2e2e', border: 'none', borderRadius: '6px',
                      width: '22px', height: '22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.15s',
                    }}
                  >
                    <X size={11} color="#9ca3af" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note input */}
        <textarea
          value={teacherNote}
          onChange={e => setTeacherNote(e.target.value)}
          placeholder="Öğretmenine not bırak (isteğe bağlı)"
          rows={3}
          style={{
            width: '100%', background: '#232323', border: '1px solid #2e2e2e',
            borderRadius: '12px', padding: '0.75rem 1rem',
            color: '#e5e7eb', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif',
            resize: 'none', outline: 'none', marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        />

        {/* Submit button */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting || submitted}
          style={{
            width: '100%', background: submitted ? '#16a34a' : '#e07c2a',
            border: 'none', borderRadius: '14px',
            color: 'white', fontWeight: '700', fontSize: '1rem',
            padding: '0.85rem', cursor: submitting || submitted ? 'default' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {submitted ? '✓ Gönderildi!' : submitting ? 'Gönderiliyor...' : 'Tamamla'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ParentHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [noteHwId, setNoteHwId] = useState(null);
  const [note, setNote] = useState('');
  const [selectedHw, setSelectedHw] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const inviteCode = localStorage.getItem('tilki_invite_code');
      let students = [];
      if (inviteCode && inviteCode.trim()) {
        students = await base44.entities.Student.filter({ inviteCode: inviteCode.trim() });
      } else if (me.email) {
        students = await base44.entities.Student.filter({ parentEmail: me.email });
      }
      if (students.length === 0) { setLoading(false); return; }
      const s = students[0];
      setStudent(s);
      const h = await base44.entities.Homework.filter({ studentId: s.id }, '-created_date');
      setHomeworks(h);
      setLoading(false);
    })();
  }, []);

  const submitNote = async (hw) => {
    await base44.entities.Homework.update(hw.id, { parentNote: note });
    setNoteHwId(null);
    setNote('');
    const h = await base44.entities.Homework.filter({ studentId: student.id }, '-created_date');
    setHomeworks(h);
  };

  const refreshHomeworks = async () => {
    if (!student) return;
    const h = await base44.entities.Homework.filter({ studentId: student.id }, '-created_date');
    setHomeworks(h);
  };

  const statusCfg = {
    verildi: { label: 'Yapılacak', bg: '#e0e7ff', color: '#4338ca', icon: Clock },
    tamamlandı: { label: 'Tamamlandı', bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
    gecikmiş: { label: 'Gecikmiş', bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
  };

  const filtered = homeworks.filter(h => filter === 'all' || h.status === filter);
  const counts = {
    all: homeworks.length,
    verildi: homeworks.filter(h => h.status === 'verildi').length,
    tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length,
    gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!student) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af', flexDirection: 'column', gap: '0.75rem' }}>
      <AlertCircle size={40} style={{ opacity: 0.4 }} />
      <p>Bağlı öğrenci bulunamadı.</p>
    </div>
  );

  return (
    <div style={{ padding: '1rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', marginBottom: '0.2rem' }}>Ödevler</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{student.name} · {homeworks.length} ödev</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['verildi', 'Yapılacak'], ['tamamlandı', 'Tamamlandı'], ['gecikmiş', 'Gecikmiş']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: filter === val ? 'none' : '1.5px solid #e5e7eb', background: filter === val ? '#4f46e5' : 'white', color: filter === val ? 'white' : '#6b7280' }}>
            {label} ({counts[val]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>Ödev bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map(hw => {
            const cfg = statusCfg[hw.status] || statusCfg.verildi;
            const Icon = cfg.icon;
            let dueDateStr = '';
            try { dueDateStr = hw.dueDate ? format(parseISO(hw.dueDate), 'd MMMM yyyy', { locale: tr }) : ''; } catch {}
            const isEditingNote = noteHwId === hw.id;
            return (
              <div
                key={hw.id}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer' }}
                onClick={() => setSelectedHw(hw)}
              >
                <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.85rem' }}>{hw.title}</div>
                    {hw.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{hw.description}</div>}
                    {dueDateStr && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>Son Tarih: {dueDateStr}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '6px', background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setNoteHwId(isEditingNote ? null : hw.id); setNote(hw.parentNote || ''); }}
                      title="Not ekle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '0.2rem' }}>
                      <MessageSquare size={14} color={hw.parentNote ? '#6366f1' : '#d1d5db'} />
                    </button>
                  </div>
                </div>
                {hw.parentNote && !isEditingNote && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.65rem 1rem', background: '#fafafe', fontSize: '0.77rem', color: '#6366f1' }}>
                    💬 {hw.parentNote}
                  </div>
                )}
                {isEditingNote && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.75rem 1rem', background: '#fafafe', display: 'flex', gap: '0.4rem' }}
                    onClick={e => e.stopPropagation()}>
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notunuzu yazın..."
                      style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                    <button onClick={() => submitNote(hw)}
                      style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedHw && (
        <HomeworkModal
          hw={selectedHw}
          student={student}
          onClose={() => setSelectedHw(null)}
          onSubmitted={refreshHomeworks}
        />
      )}
    </div>
  );
}
