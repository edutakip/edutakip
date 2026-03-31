import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { base44 } from '@/api/base44Client';
import { BookOpen, CheckCircle, Clock, AlertCircle, MessageSquare, X, Upload, Calendar, Eye } from 'lucide-react';
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

  const isOverdue = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0;

  const Box = ({ val, label }) => (
    <div style={{
      background: isOverdue ? '#fee2e2' : '#eef2ff',
      borderRadius: '10px',
      padding: '0.5rem 0.9rem',
      textAlign: 'center',
      minWidth: '56px',
      border: `1.5px solid ${isOverdue ? '#fecaca' : '#c7d2fe'}`,
    }}>
      <div style={{
        fontSize: '1.4rem', fontWeight: '800', lineHeight: 1,
        color: isOverdue ? '#b91c1c' : '#4338ca',
      }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: '0.55rem', marginTop: '0.25rem',
        letterSpacing: '0.06em', fontWeight: '700',
        color: isOverdue ? '#ef4444' : '#6366f1',
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
      <Box val={timeLeft.days} label="GÜN" />
      <span style={{ color: '#c7d2fe', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.8rem' }}>:</span>
      <Box val={timeLeft.hours} label="SAAT" />
      <span style={{ color: '#c7d2fe', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.8rem' }}>:</span>
      <Box val={timeLeft.mins} label="DAK" />
    </div>
  );
}

// ── Homework Modal (Portal) ───────────────────────────────────
function HomeworkModal({ hw, student, onClose, onSubmitted }) {
  const [files, setFiles] = useState([]);
  const [teacherNote, setTeacherNote] = useState(hw.parentNote || '');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef();
  const modalContentRef = useRef();

  const MAX_PHOTOS = 25;
  const MAX_PHOTO_MB = 10;
  const MAX_PDF = 3;
  const MAX_PDF_MB = 50;

  let dueDateTimeStr = '';
  try {
    if (hw.dueDate) {
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

  // ── Tamamla → status: 'tamamlandı' ──────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Homework.update(hw.id, {
        parentNote: teacherNote || hw.parentNote,
        status: 'tamamlandı',
      });
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch {
      setSubmitting(false);
    }
  };

  // Prevent background scroll WITHOUT locking the modal's own scroll
  useEffect(() => {
    const preventScroll = (e) => {
      if (modalContentRef.current && modalContentRef.current.contains(e.target)) return;
      e.preventDefault();
    };
    const preventWheel = (e) => {
      if (modalContentRef.current && modalContentRef.current.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventWheel, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventWheel);
    };
  }, []);

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes hwModalIn {
          from { transform: scale(0.93) translateY(12px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        .hw-modal-inner::-webkit-scrollbar { width: 4px; }
        .hw-modal-inner::-webkit-scrollbar-track { background: transparent; }
        .hw-modal-inner::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 4px; }
        .hw-file-zone:hover { border-color: #6366f1 !important; background: #eef2ff !important; }
        .hw-remove-btn:hover { background: #fee2e2 !important; }
        .hw-submit-btn:hover:not(:disabled) { background: #4338ca !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.35) !important; }
        .hw-submit-btn { transition: all 0.2s ease !important; }
      `}</style>

      <div
        ref={modalContentRef}
        onClick={e => e.stopPropagation()}
        className="hw-modal-inner"
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: 'calc(100dvh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '1.5rem',
          fontFamily: 'Inter, sans-serif',
          animation: 'hwModalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          boxSizing: 'border-box',
          boxShadow: '0 24px 64px rgba(15,23,42,0.3)',
          border: '1px solid #e0e7ff',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{
            background: '#4f46e5',
            color: 'white',
            borderRadius: '20px',
            padding: '0.35rem 1rem',
            fontWeight: '700',
            fontSize: '0.82rem',
            letterSpacing: '0.01em',
          }}>
            {hw.teacherName || 'Öğretmen'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dueDateTimeStr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.7rem' }}>
                <Calendar size={11} color="#6366f1" />
                <span>{dueDateTimeStr}</span>
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '30px', height: '30px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={14} color="#6b7280" />
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
          background: '#fafafe',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '0.85rem',
          border: '1.5px solid #e0e7ff',
        }}>
          <div style={{
            color: '#4f46e5', fontWeight: '800', fontSize: '0.75rem',
            marginBottom: '0.5rem', letterSpacing: '0.07em',
          }}>
            ÖDEVİN
          </div>
          <div style={{ color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.65 }}>
            {hw.description || hw.title}
          </div>
        </div>

        {/* Upload section */}
        <div style={{
          background: '#fafafe',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '0.85rem',
          border: '1.5px solid #e0e7ff',
        }}>
          <div style={{
            color: '#4f46e5', fontWeight: '800', fontSize: '0.75rem',
            marginBottom: '0.75rem', letterSpacing: '0.07em',
          }}>
            ÇÖZÜMLERİNİ YÜKLE
          </div>

          {/* Drop zone */}
          <div
            className="hw-file-zone"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#6366f1' : '#c7d2fe'}`,
              borderRadius: '10px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: dragging ? '#eef2ff' : 'white',
              marginBottom: files.length > 0 ? '0.75rem' : 0,
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#eef2ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 0.6rem',
            }}>
              <Upload size={18} color="#6366f1" />
            </div>
            <div style={{ color: '#374151', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.2rem' }}>
              Dosyaları sürükleyin veya tıklayın
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
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
                  background: 'white', borderRadius: '8px',
                  padding: '0.45rem 0.65rem',
                  border: '1px solid #e0e7ff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {f.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', color: '#374151',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {f.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', flexShrink: 0 }}>
                      {(f.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <button
                    className="hw-remove-btn"
                    onClick={() => removeFile(i)}
                    style={{
                      background: '#f1f5f9', border: 'none', borderRadius: '6px',
                      width: '22px', height: '22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.15s',
                    }}
                  >
                    <X size={11} color="#6b7280" />
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
            width: '100%',
            background: '#fafafe',
            border: '1.5px solid #e0e7ff',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            color: '#1e293b',
            fontSize: '0.8rem',
            fontFamily: 'Inter, sans-serif',
            resize: 'none',
            outline: 'none',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e0e7ff'}
        />

        {/* Submit button */}
        <button
          className="hw-submit-btn"
          onClick={handleSubmit}
          disabled={submitting || submitted}
          style={{
            width: '100%',
            background: submitted ? '#16a34a' : '#4f46e5',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '700',
            fontSize: '1rem',
            padding: '0.9rem',
            cursor: submitting || submitted ? 'default' : 'pointer',
            boxShadow: submitted ? '0 4px 16px rgba(22,163,74,0.3)' : '0 4px 16px rgba(79,70,229,0.25)',
          }}
        >
          {submitted ? '✓ Gönderildi!' : submitting ? 'Gönderiliyor...' : 'Tamamla'}
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
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

  // ── Ödeve tıklandığında → 'goruldu' statüsüne güncelle ──────
  const handleOpenHomework = async (hw) => {
    // Sadece 'verildi' veya 'gecikmiş' ise güncelle
    // 'goruldu', 'tamamlandı' olanları tekrar güncelleme
    const shouldMarkSeen = hw.status === 'verildi' || hw.status === 'gecikmiş';

    if (shouldMarkSeen) {
      // Önce local state'i güncelle (anlık feedback)
      setHomeworks(prev =>
        prev.map(h => h.id === hw.id ? { ...h, status: 'goruldu' } : h)
      );
      // Seçili ödevi güncelle
      setSelectedHw({ ...hw, status: 'goruldu' });
      // Backend'e kaydet
      try {
        await base44.entities.Homework.update(hw.id, { status: 'goruldu' });
      } catch {
        // Hata olursa orijinal hali geri koy
        setHomeworks(prev =>
          prev.map(h => h.id === hw.id ? { ...h, status: hw.status } : h)
        );
      }
    } else {
      setSelectedHw(hw);
    }
  };

  const statusCfg = {
    verildi:    { label: 'Yapılacak',   bg: '#e0e7ff', color: '#4338ca', icon: Clock },
    goruldu:    { label: 'Görüldü',     bg: '#fef9c3', color: '#854d0e', icon: Eye },
    tamamlandı: { label: 'Tamamlandı',  bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
    gecikmiş:   { label: 'Gecikmiş',    bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
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
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem',
              fontWeight: '600', cursor: 'pointer',
              border: filter === val ? 'none' : '1.5px solid #e5e7eb',
              background: filter === val ? '#4f46e5' : 'white',
              color: filter === val ? 'white' : '#6b7280',
            }}>
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
                style={{
                  background: 'white', borderRadius: '12px',
                  border: '1px solid #f1f5f9', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer',
                }}
                onClick={() => handleOpenHomework(hw)}
              >
                <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: cfg.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.85rem' }}>{hw.title}</div>
                    {hw.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{hw.description}</div>}
                    {dueDateStr && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>Son Tarih: {dueDateStr}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: '700',
                      padding: '0.2rem 0.5rem', borderRadius: '6px',
                      background: cfg.bg, color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setNoteHwId(isEditingNote ? null : hw.id); setNote(hw.parentNote || ''); }}
                      title="Not ekle"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <MessageSquare size={14} color={hw.parentNote ? '#6366f1' : '#d1d5db'} />
                    </button>
                  </div>
                </div>
                {hw.parentNote && !isEditingNote && (
                  <div style={{
                    borderTop: '1px solid #f1f5f9', padding: '0.65rem 1rem',
                    background: '#fafafe', fontSize: '0.77rem', color: '#6366f1',
                  }}>
                    💬 {hw.parentNote}
                  </div>
                )}
                {isEditingNote && (
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9', padding: '0.75rem 1rem',
                      background: '#fafafe', display: 'flex', gap: '0.4rem',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Notunuzu yazın..."
                      style={{
                        flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '6px',
                        padding: '0.4rem 0.6rem', fontSize: '0.75rem', outline: 'none',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                    <button
                      onClick={() => submitNote(hw)}
                      style={{
                        background: '#4f46e5', color: 'white', border: 'none',
                        borderRadius: '6px', padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — rendered via portal into document.body */}
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
