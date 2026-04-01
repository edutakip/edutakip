import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { base44 } from '@/api/base44Client';
import { Plus, BookOpen, CheckCircle, Clock, AlertCircle, Trash2, X, Pencil, Calendar, User, ChevronRight, Upload, Search, Filter, Sparkles, Bell, Send, Eye, Award, ArrowRight, FileText, Image as ImageIcon, Paperclip } from 'lucide-react';
import TeacherAssessmentSection from '../components/teacher/TeacherAssessmentSection';
import { showToast } from '@/lib/toast';
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

/* ─── Helpers ─────────────────────────────────────────── */
function getDueDateLabel(dueDate) {
  if (!dueDate) return null;
  try {
    const d = parseISO(dueDate);
    if (isToday(d)) return { text: 'Bugün son gün!', color: '#dc2626', bg: '#fef2f2', urgent: true };
    if (isTomorrow(d)) return { text: 'Yarın son gün', color: '#d97706', bg: '#fffbeb', urgent: true };
    const diff = differenceInDays(d, new Date());
    if (diff < 0) return { text: `${Math.abs(diff)} gün geçti`, color: '#b91c1c', bg: '#fef2f2', urgent: true };
    if (diff <= 3) return { text: `${diff} gün kaldı`, color: '#d97706', bg: '#fffbeb', urgent: false };
    return { text: format(d, 'd MMM', { locale: tr }), color: '#6b7280', bg: '#f3f4f6', urgent: false };
  } catch { return null; }
}

const STATUS_CONFIG = {
  verildi:         { label: 'Bekliyor',        color: '#4f46e5', bg: '#eef2ff', dot: '#6366f1', icon: Clock,        gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
  goruldu:         { label: 'Görüldü',         color: '#b45309', bg: '#fef9c3', dot: '#ca8a04', icon: Eye,          gradient: 'linear-gradient(135deg, #b45309, #ca8a04)' },
  tamamlandı:      { label: 'Tamamlandı',      color: '#059669', bg: '#ecfdf5', dot: '#10b981', icon: CheckCircle,  gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  gecikmiş:        { label: 'Gecikmiş',        color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', icon: AlertCircle,  gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
  degerlendirildi: { label: 'Değerlendirildi', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6', icon: Award,        gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
};

// Mapping for step tracker
const stepIndexMap = {
  verildi:         0,
  goruldu:         1,
  tamamlandı:      2,
  degerlendirildi: 3,
  gecikmiş:        0,
};

const avatarColors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─── Animated Counter ───────────────────────────────── */
function AnimCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}</>;
}

/* ─── usePortalLock — scroll kilidi ─────────────────── */
function usePortalLock(contentRef) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const prevent = (e) => {
      if (contentRef.current && contentRef.current.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('touchmove', prevent);
    };
  }, []);
}

/* ─── Slide Panel ────────────────────────────────────── */
function SlidePanel({ hw, students, onClose, onStatusChange, onDelete, onEdit }) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  usePortalLock(panelRef);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const cfg = STATUS_CONFIG[hw?.status] || STATUS_CONFIG.verildi;
  const Icon = cfg.icon;
  const student = students.find(s => s.id === hw?.studentId);
  const dueDateInfo = getDueDateLabel(hw?.dueDate);
  const avatarColor = getAvatarColor(hw?.studentName);

  const steps = [
    { key: 'verildi',         label: 'İletildi',        icon: Send },
    { key: 'goruldu',         label: 'Görüldü',         icon: Eye },
    { key: 'tamamlandı',      label: 'Teslim',          icon: CheckCircle },
    { key: 'degerlendirildi', label: 'Değerlendirildi', icon: Award },
  ];

  const stepIndex = stepIndexMap[hw?.status] ?? 0;

  const panel = (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        @keyframes shimmerSlide { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }
      `}</style>

      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(420px, 95vw)',
          background: 'white',
          zIndex: 9999,
          boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Header gradient banner */}
        <div style={{
          background: cfg.gradient,
          padding: '1.75rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{ position:'absolute', right:-30, top:-30, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ position:'absolute', right:40, bottom:-50, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:8, padding:'0.3rem 0.7rem', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                  <Icon size={12} color="white" />
                  <span style={{ fontSize:'0.7rem', fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'0.8px' }}>{cfg.label}</span>
                </div>
              </div>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'white', lineHeight:1.2, marginBottom:'0.4rem', maxWidth:260 }}>{hw?.title}</h2>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'0.55rem', fontWeight:800, color:'white' }}>{getInitials(hw?.studentName)}</span>
                </div>
                <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.85)', fontWeight:600 }}>{hw?.studentName}</span>
              </div>
            </div>
            <button onClick={handleClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'0.5rem', cursor:'pointer', display:'flex', backdropFilter:'blur(4px)' }}>
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'1.5rem', flex:1, marginTop:'-1.5rem' }}>

          {/* Steps tracker */}
          <div style={{ background:'white', borderRadius:16, padding:'1.25rem', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', marginBottom:'1.25rem', animation:'slideUp 0.4s ease 0.1s both' }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'1rem' }}>Ödev Takibi</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = i <= stepIndex;
                const isCurrent = i === stepIndex;
                // Use the step's own color for active steps
                const stepCfg = STATUS_CONFIG[s.key] || cfg;
                const activeGradient = isCurrent ? cfg.gradient : (isActive ? 'linear-gradient(135deg, #10b981, #059669)' : '#f3f4f6');
                return (
                  <React.Fragment key={s.key}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem' }}>
                      <div style={{
                        width: isCurrent ? 36 : 28, height: isCurrent ? 36 : 28,
                        borderRadius:'50%',
                        background: isActive ? (isCurrent ? cfg.gradient : 'linear-gradient(135deg, #10b981, #059669)') : '#f3f4f6',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow: isCurrent ? `0 4px 12px ${cfg.color}40` : 'none',
                        transition:'all 0.3s ease',
                        animation: isCurrent ? 'popIn 0.4s ease both' : 'none',
                      }}>
                        <StepIcon size={isCurrent ? 16 : 12} color={isActive ? 'white' : '#d1d5db'} />
                      </div>
                      <span style={{ fontSize:'0.6rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? cfg.color : (isActive ? '#059669' : '#9ca3af'), textAlign:'center', lineHeight:1.2 }}>{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex:1, height:2, margin:'0 0.25rem', marginBottom:18, background: i < stepIndex ? 'linear-gradient(135deg, #10b981, #059669)' : '#f3f4f6', borderRadius:2, position:'relative', overflow:'hidden' }}>
                        {i < stepIndex && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation:'shimmerSlide 1.5s ease-in-out infinite' }} />}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Due date + date info */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.25rem', animation:'slideUp 0.4s ease 0.2s both' }}>
            {dueDateInfo && (
              <div style={{ background:dueDateInfo.bg, borderRadius:12, padding:'0.85rem', border:`1px solid ${dueDateInfo.color}20` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginBottom:'0.25rem' }}>
                  <Calendar size={13} color={dueDateInfo.color} />
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:dueDateInfo.color, textTransform:'uppercase', letterSpacing:'0.5px' }}>Teslim</span>
                </div>
                <div style={{ fontSize:'0.95rem', fontWeight:800, color:dueDateInfo.color }}>{dueDateInfo.text}</div>
              </div>
            )}
            {hw?.dueDate && (
              <div style={{ background:'#f8fafc', borderRadius:12, padding:'0.85rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginBottom:'0.25rem' }}>
                  <Clock size={13} color="#6b7280" />
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px' }}>Tarih</span>
                </div>
                <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#374151' }}>
                  {format(parseISO(hw.dueDate), 'd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {hw?.description && (
            <div style={{ background:'#f8fafc', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', animation:'slideUp 0.4s ease 0.25s both' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.5rem' }}>Açıklama</p>
              <p style={{ fontSize:'0.875rem', color:'#374151', lineHeight:1.7 }}>{hw.description}</p>
            </div>
          )}

          {/* Attachments from parent — with thumbnails */}
          {hw?.attachments?.length > 0 && (
            <div style={{ background:'#f0fdf4', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', border:'1px solid #bbf7d0', animation:'slideUp 0.4s ease 0.28s both' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.75rem' }}>
                📎 Veli Yükledi ({hw.attachments.length} dosya)
              </p>
              {/* Thumbnail grid for images */}
              {hw.attachments.some(url => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:'0.4rem', marginBottom:'0.5rem' }}>
                  {hw.attachments.filter(url => /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'block', aspectRatio:'1/1', borderRadius:8, overflow:'hidden', border:'2px solid #bbf7d0', cursor:'pointer' }}>
                      <img src={url} alt={`Ödev ${i+1}`}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { e.target.style.display='none'; }} />
                    </a>
                  ))}
                </div>
              )}
              {/* PDF files */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {hw.attachments.filter(url => !/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)).map((url, i) => {
                  const filename = url.split('/').pop()?.split('?')[0] || `Dosya ${i + 1}`;
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'white', borderRadius:8, padding:'0.5rem 0.75rem', border:'1px solid #bbf7d0', textDecoration:'none', transition:'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#dcfce7'}
                      onMouseLeave={e => e.currentTarget.style.background='white'}>
                      <span style={{ fontSize:'1rem' }}>📄</span>
                      <span style={{ fontSize:'0.78rem', color:'#065f46', fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{filename}</span>
                      <span style={{ fontSize:'0.65rem', color:'#059669', fontWeight:700, flexShrink:0 }}>Aç →</span>
                    </a>
                  );
                })}
              </div>
              {hw.parentNote && (
                <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.75rem', background:'white', borderRadius:8, border:'1px solid #bbf7d0' }}>
                  <span style={{ fontSize:'0.72rem', color:'#6b7280', fontWeight:600 }}>💬 Veli notu: </span>
                  <span style={{ fontSize:'0.78rem', color:'#374151' }}>{hw.parentNote}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Evaluation */}
          {hw?.aiEvaluation && (
            <div style={{ background:'#faf5ff', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', border:'1px solid #e9d5ff', animation:'slideUp 0.4s ease 0.3s both' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                🤖 EduTakip AI Değerlendirmesi
              </p>
              {hw.aiEvaluation.warning && (
                <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'0.6rem 0.75rem', marginBottom:'0.75rem' }}>
                  <p style={{ fontSize:'0.78rem', color:'#92400e', fontStyle:'italic' }}>⚠️ {hw.aiEvaluation.warning}</p>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <div style={{ background:'white', borderRadius:8, padding:'0.6rem', textAlign:'center', border:'1px solid #e9d5ff' }}>
                  <p style={{ fontSize:'0.6rem', color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:'0.2rem' }}>Efor</p>
                  <p style={{ fontSize:'0.95rem', fontWeight:800, color: hw.aiEvaluation.effort === 'Yüksek' ? '#059669' : hw.aiEvaluation.effort === 'Orta' ? '#d97706' : '#dc2626' }}>
                    {hw.aiEvaluation.effort || '—'}
                  </p>
                </div>
                <div style={{ background:'white', borderRadius:8, padding:'0.6rem', textAlign:'center', border:'1px solid #e9d5ff' }}>
                  <p style={{ fontSize:'0.6rem', color:'#9ca3af', fontWeight:700, textTransform:'uppercase', marginBottom:'0.2rem' }}>Anlama</p>
                  <p style={{ fontSize:'0.95rem', fontWeight:800, color: hw.aiEvaluation.understanding === 'İyi' ? '#059669' : hw.aiEvaluation.understanding === 'Orta' ? '#d97706' : '#dc2626' }}>
                    {hw.aiEvaluation.understanding || '—'}
                  </p>
                </div>
              </div>
              {hw.aiEvaluation.feedback && (
                <p style={{ fontSize:'0.82rem', color:'#374151', lineHeight:1.65, background:'white', borderRadius:8, padding:'0.65rem', border:'1px solid #e9d5ff' }}>
                  {hw.aiEvaluation.feedback}
                </p>
              )}
            </div>
          )}

          {/* Teacher Assessment */}
          <TeacherAssessmentSection hw={hw} onAssessmentSaved={(updated) => {
            // Update local hw ref so panel reflects change
            Object.assign(hw, updated);
          }} />

          {/* Parent phone */}
          {student?.parentPhone && (
            <a href={`tel:${student.parentPhone}`} style={{
              display:'flex', alignItems:'center', gap:'0.75rem',
              background:'#f0fdf4', borderRadius:12, padding:'0.85rem',
              textDecoration:'none', marginBottom:'1.25rem',
              border:'1px solid #bbf7d0',
              animation:'slideUp 0.4s ease 0.3s both',
            }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg, #10b981, #059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 4.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 11a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 18z"/></svg>
              </div>
              <div>
                <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.5px' }}>Veli İletişim</div>
                <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#065f46' }}>{student.parentPhone}</div>
              </div>
              <ArrowRight size={16} color="#10b981" style={{ marginLeft:'auto' }} />
            </a>
          )}

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', animation:'slideUp 0.4s ease 0.35s both' }}>
            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.25rem' }}>İşlemler</p>
            {hw?.status !== 'tamamlandı' && hw?.status !== 'degerlendirildi' && (
              <button onClick={() => onStatusChange(hw, 'tamamlandı')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'linear-gradient(135deg, #059669, #10b981)', border:'none', borderRadius:12, padding:'0.85rem 1rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,0.3)' }}>
                <CheckCircle size={18} color="white" />
                <span style={{ fontSize:'0.875rem', fontWeight:700, color:'white' }}>Tamamlandı Olarak İşaretle</span>
              </button>
            )}
            {(hw?.status === 'tamamlandı' || hw?.status === 'goruldu') && (
              <button onClick={() => onStatusChange(hw, 'verildi')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'#f3f4f6', border:'none', borderRadius:12, padding:'0.85rem 1rem', cursor:'pointer' }}>
                <Clock size={18} color="#6b7280" />
                <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#374151' }}>Bekliyor'a Geri Al</span>
              </button>
            )}
            {hw?.status !== 'gecikmiş' && hw?.status !== 'tamamlandı' && hw?.status !== 'degerlendirildi' && (
              <button onClick={() => onStatusChange(hw, 'gecikmiş')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'0.85rem 1rem', cursor:'pointer' }}>
                <AlertCircle size={18} color="#dc2626" />
                <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#dc2626' }}>Gecikmiş Olarak İşaretle</span>
              </button>
            )}
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
              <button onClick={() => onEdit(hw)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'white', border:'1.5px solid #e5e7eb', borderRadius:12, padding:'0.75rem', cursor:'pointer' }}>
                <Pencil size={15} color="#374151" />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151' }}>Düzenle</span>
              </button>
              <button onClick={() => onDelete(hw)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:12, padding:'0.75rem', cursor:'pointer' }}>
                <Trash2 size={15} color="#dc2626" />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#dc2626' }}>Sil</span>
              </button>
            </div>
          </div>

          <div style={{ height: '5rem' }} />
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(panel, document.body);
}

/* ─── Add/Edit Modal ─────────────────────────────────── */
function HomeworkModal({ editingHw, students, onClose, onSave }) {
  const [form, setForm] = useState({
    studentId: editingHw?.studentId || '',
    title: editingHw?.title || '',
    description: editingHw?.description || '',
    dueDate: editingHw?.dueDate || '',
  });
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [datePreset, setDatePreset] = useState('');
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  usePortalLock(modalRef);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const presets = [
    { label: 'Bu gece', icon: '🌙', date: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Yarın', icon: '☀️', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Bu hafta sonu', icon: '📅', date: format(addDays(new Date(), (6 - new Date().getDay() + 6) % 7 || 7), 'yyyy-MM-dd') },
    { label: 'Haftaya', icon: '🗓️', date: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
  ];

  const handlePreset = (preset) => {
    setDatePreset(preset.label);
    setForm(f => ({ ...f, dueDate: preset.date }));
  };

  const canSave = form.studentId && form.title;

  const modal = (
    <>
      <style>{`
        @keyframes modalBg { from{opacity:0} to{opacity:1} }
        @keyframes modalSlide { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
          opacity: visible ? 1 : 0,
          animation: 'modalBg 0.25s ease both',
        }}
      >
        <div
          ref={modalRef}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 24,
            width: '100%', maxWidth: 480,
            maxHeight: 'calc(100dvh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
            animation: 'modalSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <div>
                <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:'#111827', marginBottom:'0.15rem' }}>
                  {editingHw ? '✏️ Ödevi Düzenle' : '📚 Yeni Ödev'}
                </h2>
                <p style={{ fontSize:'0.78rem', color:'#9ca3af', fontWeight:500 }}>
                  {editingHw ? 'Ödev bilgilerini güncelleyin' : 'Öğrencine ödev ver'}
                </p>
              </div>
              <button onClick={handleClose} style={{ background:'#f3f4f6', border:'none', borderRadius:12, padding:'0.5rem', cursor:'pointer', display:'flex', transition:'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background='#f3f4f6'}>
                <X size={18} color='#6b7280' />
              </button>
            </div>

            {/* Öğrenci seçimi */}
            <div style={{ marginBottom:'1.1rem' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.8px' }}>Öğrenci Seçin</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {students.map(s => {
                  const selected = form.studentId === s.id;
                  const ac = getAvatarColor(s.name);
                  return (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, studentId: s.id }))} style={{
                      display:'flex', alignItems:'center', gap:'0.5rem',
                      padding:'0.45rem 0.85rem', borderRadius:20,
                      border: selected ? `2px solid ${ac}` : '2px solid #f1f5f9',
                      background: selected ? ac + '15' : 'white',
                      cursor:'pointer', transition:'all 0.18s',
                      transform: selected ? 'scale(1.04)' : 'scale(1)',
                    }}>
                      <div style={{ width:22, height:22, borderRadius:'50%', background:ac, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:'0.55rem', fontWeight:800, color:'white' }}>{getInitials(s.name)}</span>
                      </div>
                      <span style={{ fontSize:'0.82rem', fontWeight:selected ? 700 : 500, color: selected ? '#111827' : '#6b7280', whiteSpace:'nowrap' }}>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Başlık */}
            <div style={{ marginBottom:'1.1rem' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.8px' }}>Ödev Açıklaması</label>
              <textarea
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Örneğin: Matematik 10. Sınıf, Sayfa 45, Soru 1-10"
                rows={3}
                style={{ width:'100%', background:'#f8fafc', border:'1.5px solid #e5e7eb', borderRadius:14, padding:'0.75rem 1rem', fontSize:'0.9rem', color:'#111827', outline:'none', resize:'none', boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.6, transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor='#f97316'}
                onBlur={e => e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* Detay */}
            <div style={{ marginBottom:'1.1rem' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.8px' }}>
                Ek Notlar <span style={{ color:'#9ca3af', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(opsiyonel)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ödev hakkında ek bilgiler..."
                rows={2}
                style={{ width:'100%', background:'#f8fafc', border:'1.5px solid #e5e7eb', borderRadius:14, padding:'0.75rem 1rem', fontSize:'0.875rem', color:'#111827', outline:'none', resize:'none', boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.6, transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor='#f97316'}
                onBlur={e => e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* Dosya yükleme */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.8px' }}>
                Ek Dosyalar <span style={{ color:'#9ca3af', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(opsiyonel)</span>
              </label>
              {/* Hidden input rendered outside the locked modal via portal */}
              {ReactDOM.createPortal(
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  style={{ position:'fixed', top:'-9999px', left:'-9999px', opacity:0, width:1, height:1 }}
                  onChange={e => {
                    const newFiles = Array.from(e.target.files);
                    setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 28));
                    e.target.value = '';
                  }}
                />,
                document.body
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border:'2px dashed #e5e7eb', borderRadius:14, padding:'1.5rem', textAlign:'center', background:'#fafafa', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#f97316'; e.currentTarget.style.background='#fff7ed'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.background='#fafafa'; }}>
                <Upload size={22} color="#9ca3af" style={{ marginBottom:'0.5rem' }} />
                <p style={{ fontSize:'0.82rem', color:'#6b7280', marginBottom:'0.2rem', fontWeight:600 }}>Dosyaları sürükleyin veya tıklayın</p>
                <p style={{ fontSize:'0.72rem', color:'#9ca3af' }}>Fotoğraf (maks 25, 10MB) veya PDF (maks 3, 50MB)</p>
              </div>
              {attachedFiles.length > 0 && (
                <div style={{ marginTop:'0.5rem', display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                  {attachedFiles.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.35rem', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:'0.3rem 0.6rem', fontSize:'0.75rem', color:'#c2410c', fontWeight:600 }}>
                      <span>{f.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                      <span style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#f97316' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teslim tarihi */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ fontSize:'0.7rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.6rem', textTransform:'uppercase', letterSpacing:'0.8px' }}>Teslim Tarihi</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
                {presets.map(p => (
                  <button key={p.label} onClick={() => handlePreset(p)} style={{
                    padding:'0.45rem 0.85rem', borderRadius:20, border:'2px solid',
                    borderColor: datePreset === p.label ? '#f97316' : '#f1f5f9',
                    background: datePreset === p.label ? '#fff7ed' : 'white',
                    color: datePreset === p.label ? '#f97316' : '#6b7280',
                    fontSize:'0.8rem', fontWeight: datePreset === p.label ? 700 : 500,
                    cursor:'pointer', transition:'all 0.15s',
                    display:'flex', alignItems:'center', gap:'0.3rem',
                  }}>
                    {p.icon} {p.label}
                  </button>
                ))}
                <button onClick={() => setDatePreset('custom')} style={{
                  padding:'0.45rem 0.85rem', borderRadius:20, border:'2px solid',
                  borderColor: datePreset === 'custom' ? '#f97316' : '#f1f5f9',
                  background: datePreset === 'custom' ? '#fff7ed' : 'white',
                  color: datePreset === 'custom' ? '#f97316' : '#6b7280',
                  fontSize:'0.8rem', fontWeight: datePreset === 'custom' ? 700 : 500,
                  cursor:'pointer', transition:'all 0.15s',
                  display:'flex', alignItems:'center', gap:'0.3rem',
                }}>
                  📅 Özel Tarih
                </button>
              </div>
              {form.dueDate && (
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 0.875rem', background:'#fff7ed', borderRadius:10, border:'1.5px solid #fed7aa' }}>
                  <Calendar size={14} color="#f97316" />
                  <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#c2410c' }}>
                    {format(parseISO(form.dueDate), 'd MMMM EEEE, HH:mm', { locale: tr }).replace('00:00', '23:59')}
                  </span>
                </div>
              )}
              {datePreset === 'custom' && (
                <input type="date" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  style={{ width:'100%', marginTop:'0.5rem', padding:'0.65rem 0.875rem', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:'0.875rem', color:'#111827', outline:'none', boxSizing:'border-box' }}
                />
              )}
            </div>
          </div>

          {/* Save button */}
          <div style={{ padding:'0 1.5rem 1.5rem' }}>
            <button
              onClick={() => onSave(form, attachedFiles)}
              disabled={!canSave}
              style={{
                width:'100%', padding:'0.95rem',
                background: canSave ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f3f4f6',
                border:'none', borderRadius:14,
                color: canSave ? 'white' : '#9ca3af',
                fontSize:'0.95rem', fontWeight:800,
                cursor: canSave ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
                boxShadow: canSave ? '0 8px 24px rgba(249,115,22,0.35)' : 'none',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => canSave && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => canSave && (e.currentTarget.style.transform = 'scale(1)')}>
              <Send size={18} />
              {editingHw ? 'Güncelle' : 'Ödev Ver'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
}

/* ─── Main Page ──────────────────────────────────────── */
export default function TeacherHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHw, setEditingHw] = useState(null);
  const [selectedHw, setSelectedHw] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [me, setMe] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      const [h, s] = await Promise.all([
        base44.entities.Homework.filter({ teacherEmail: user.email }, '-created_date'),
        base44.entities.Student.filter({ teacherEmail: user.email, status: 'active' }),
      ]);
      const updated = h.map(hw => {
        if (hw.status === 'verildi' && hw.dueDate && isPast(new Date(hw.dueDate + 'T23:59:59'))) {
          return { ...hw, status: 'gecikmiş' };
        }
        return hw;
      });
      setHomeworks(updated);
      setStudents(s);
      setTimeout(() => setLoaded(true), 50);
    })();
  }, []);

  useEffect(() => {
    const handler = () => { setEditingHw(null); setShowModal(true); };
    window.addEventListener('fab:openHomework', handler);
    return () => window.removeEventListener('fab:openHomework', handler);
  }, []);

  const reload = async () => {
    if (!me) return;
    const h = await base44.entities.Homework.filter({ teacherEmail: me.email }, '-created_date');
    const updated = h.map(hw => {
      if (hw.status === 'verildi' && hw.dueDate && isPast(new Date(hw.dueDate + 'T23:59:59'))) {
        return { ...hw, status: 'gecikmiş' };
      }
      return hw;
    });
    setHomeworks(updated);
  };

  const handleSave = async (form, files = []) => {
    const student = students.find(s => s.id === form.studentId);
    // Upload any attached files
    let uploadedUrls = [];
    for (const f of files) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        if (res?.file_url) uploadedUrls.push(res.file_url);
      } catch (e) { console.warn('Dosya yüklenemedi:', f.name, e); }
    }
    const dataToSave = { ...form, ...(uploadedUrls.length > 0 ? { attachments: uploadedUrls } : {}) };
    if (editingHw) {
      await base44.entities.Homework.update(editingHw.id, { ...dataToSave, studentName: student?.name || editingHw.studentName });
      showToast({ message: 'Ödev güncellendi ✓' });
    } else {
      await base44.entities.Homework.create({ ...dataToSave, studentName: student?.name || '', teacherEmail: me.email, status: 'verildi' });
      showToast({ message: `📚 Ödev verildi — ${student?.name}` });
    }
    setShowModal(false);
    setEditingHw(null);
    reload();
  };

  const handleStatusChange = async (hw, status) => {
    await base44.entities.Homework.update(hw.id, { status });
    setSelectedHw(prev => prev?.id === hw.id ? { ...prev, status } : prev);
    reload();
  };

  const handleDelete = async (hw) => {
    await base44.entities.Homework.delete(hw.id);
    setSelectedHw(null);
    showToast({ message: 'Ödev silindi' });
    reload();
  };

  const handleEdit = (hw) => {
    setEditingHw(hw);
    setSelectedHw(null);
    setShowModal(true);
  };

  const counts = {
    all: homeworks.length,
    verildi: homeworks.filter(h => h.status === 'verildi').length,
    goruldu: homeworks.filter(h => h.status === 'goruldu').length,
    tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length,
    gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length,
  };

  const filtered = homeworks.filter(h => {
    const matchFilter = filter === 'all' || h.status === filter;
    const matchSearch = !searchQuery || h.title?.toLowerCase().includes(searchQuery.toLowerCase()) || h.studentName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Group by student
  const grouped = filtered.reduce((acc, hw) => {
    const key = hw.studentName || 'Bilinmiyor';
    if (!acc[key]) acc[key] = [];
    acc[key].push(hw);
    return acc;
  }, {});

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardPop { from{opacity:0;transform:translateY(12px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes badgePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .hw-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .hw-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .filter-tab { transition: all 0.2s ease; }
        .filter-tab:hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'clamp(1rem, 4vw, 2rem)' }}>

        {/* ── Hero Header ─────────────────────────────── */}
        <div style={{ marginBottom:'2rem', animation: loaded ? 'fadeUp 0.5s ease both' : 'none' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                <div style={{ width:48, height:48, borderRadius:16, background:'linear-gradient(135deg, #f97316, #ea580c)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(249,115,22,0.35)' }}>
                  <BookOpen size={24} color="white" />
                </div>
                <div>
                  <h1 style={{ fontSize:'1.75rem', fontWeight:900, color:'#111827', lineHeight:1 }}>Ödevler</h1>
                  <p style={{ fontSize:'0.82rem', color:'#9ca3af', fontWeight:500, marginTop:'0.2rem' }}>
                    {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => { setEditingHw(null); setShowModal(true); }} style={{
              background:'linear-gradient(135deg, #f97316, #ea580c)',
              border:'none', color:'white', borderRadius:14,
              padding:'0.75rem 1.5rem', fontWeight:800, fontSize:'0.9rem',
              cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem',
              boxShadow:'0 8px 24px rgba(249,115,22,0.35)',
              fontFamily:'inherit', transition:'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0) scale(1)'}>
              <Plus size={18} /> Yeni Ödev
            </button>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.85rem', marginBottom:'1.75rem' }}>
          {[
            { key:'all',       label:'Toplam',      icon:'📋', color:'#374151', bg:'white',   border:'#f1f5f9', shadow:'rgba(0,0,0,0.06)' },
            { key:'verildi',   label:'Bekliyor',    icon:'⏳', color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe', shadow:'rgba(99,102,241,0.12)' },
            { key:'goruldu',   label:'Görüldü',     icon:'👁️', color:'#b45309', bg:'#fef9c3', border:'#fde68a', shadow:'rgba(180,83,9,0.12)' },
            { key:'gecikmiş',  label:'Gecikmiş',    icon:'🚨', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', shadow:'rgba(220,38,38,0.12)' },
            { key:'tamamlandı',label:'Tamamlandı',  icon:'✅', color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', shadow:'rgba(5,150,105,0.12)' },
          ].map(({ key, label, icon, color, bg, border, shadow }, idx) => (
            <div key={key} className="filter-tab" onClick={() => setFilter(key)} style={{
              background: filter === key ? bg : 'white',
              borderRadius:16, padding:'1.1rem 1.25rem',
              border: `1.5px solid ${filter === key ? border : '#f1f5f9'}`,
              cursor:'pointer',
              boxShadow: filter === key ? `0 6px 20px ${shadow}` : '0 1px 4px rgba(0,0,0,0.04)',
              animation: loaded ? `cardPop 0.4s ease ${idx * 0.07}s both` : 'none',
            }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{icon}</div>
              <div style={{ fontSize:'2rem', fontWeight:900, color, lineHeight:1, marginBottom:'0.2rem' }}>
                <AnimCounter value={counts[key] ?? 0} />
              </div>
              <div style={{ fontSize:'0.72rem', color: filter === key ? color : '#9ca3af', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
              {(counts[key] ?? 0) > 0 && key === 'gecikmiş' && (
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', marginTop:'0.4rem', animation:'badgePulse 1.5s ease-in-out infinite' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Search bar ───────────────────────────────── */}
        <div style={{ position:'relative', marginBottom:'1.5rem', animation: loaded ? 'fadeUp 0.5s ease 0.2s both' : 'none' }}>
          <Search size={17} color="#9ca3af" style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ödev veya öğrenci ara..."
            style={{
              width:'100%', background:'white',
              border:'1.5px solid #f1f5f9', borderRadius:14,
              padding:'0.75rem 1rem 0.75rem 2.75rem',
              fontSize:'0.875rem', color:'#111827',
              outline:'none', boxSizing:'border-box',
              boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
              fontFamily:'inherit', transition:'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor='#f97316'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.1)'; }}
            onBlur={e => { e.target.style.borderColor='#f1f5f9'; e.target.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'#f3f4f6', border:'none', borderRadius:6, padding:'0.2rem', cursor:'pointer', display:'flex' }}>
              <X size={14} color="#6b7280" />
            </button>
          )}
        </div>

        {/* ── Homework List ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ background:'white', borderRadius:20, padding:'4rem 2rem', textAlign:'center', border:'1.5px solid #f1f5f9', animation: loaded ? 'fadeUp 0.5s ease 0.3s both' : 'none' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
            <p style={{ fontWeight:800, fontSize:'1.1rem', color:'#374151', marginBottom:'0.4rem' }}>Ödev bulunamadı</p>
            <p style={{ color:'#9ca3af', fontSize:'0.875rem' }}>
              {searchQuery ? `"${searchQuery}" için sonuç yok` : 'Henüz ödev eklenmemiş'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            {Object.entries(grouped).map(([studentName, hws], groupIdx) => {
              const avatarColor = getAvatarColor(studentName);
              return (
                <div key={studentName} style={{ animation: loaded ? `cardPop 0.45s ease ${0.1 + groupIdx * 0.08}s both` : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.75rem' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${avatarColor}40` }}>
                      <span style={{ fontSize:'0.72rem', fontWeight:800, color:'white' }}>{getInitials(studentName)}</span>
                    </div>
                    <span style={{ fontSize:'0.9rem', fontWeight:800, color:'#111827' }}>{studentName}</span>
                    <div style={{ flex:1, height:1, background:'linear-gradient(to right, #f1f5f9, transparent)' }} />
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#9ca3af' }}>{hws.length} ödev</span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {hws.map((hw) => {
                      const cfg = STATUS_CONFIG[hw.status] || STATUS_CONFIG.verildi;
                      const Icon = cfg.icon;
                      const dueDateInfo = getDueDateLabel(hw.dueDate);
                      const isSelected = selectedHw?.id === hw.id;

                      return (
                        <div key={hw.id} className="hw-card"
                          onClick={() => setSelectedHw(hw)}
                          style={{
                            background:'white', borderRadius:16,
                            border: `1.5px solid ${isSelected ? cfg.dot + '60' : '#f1f5f9'}`,
                            padding:'1rem 1.1rem', cursor:'pointer',
                            boxShadow: isSelected ? `0 8px 24px ${cfg.dot}20` : '0 1px 6px rgba(0,0,0,0.05)',
                            display:'flex', alignItems:'center', gap:'1rem',
                            position:'relative', overflow:'hidden',
                          }}>
                          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:cfg.gradient }} />

                          <div style={{ width:40, height:40, borderRadius:12, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Icon size={18} color={cfg.color} />
                          </div>

                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, color:'#111827', fontSize:'0.92rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'0.25rem' }}>
                              {hw.title}
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
                              {dueDateInfo && (
                                <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', fontSize:'0.75rem', color:dueDateInfo.color, fontWeight:700, background:dueDateInfo.bg, padding:'0.15rem 0.5rem', borderRadius:6 }}>
                                  <Calendar size={10} /> {dueDateInfo.text}
                                </span>
                              )}
                              {hw.description && (
                                <span style={{ fontSize:'0.75rem', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
                                  {hw.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                            <span style={{ fontSize:'0.7rem', fontWeight:800, padding:'0.25rem 0.65rem', borderRadius:20, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.dot}30` }}>
                              {cfg.label}
                            </span>
                            <ChevronRight size={14} color="#d1d5db" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedHw && (
        <SlidePanel
          hw={selectedHw}
          students={students}
          onClose={() => setSelectedHw(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {showModal && (
        <HomeworkModal
          editingHw={editingHw}
          students={students}
          onClose={() => { setShowModal(false); setEditingHw(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}