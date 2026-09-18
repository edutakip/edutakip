import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Radio, Clock, BookOpen, ChevronRight, ArrowLeft, CheckCircle, AlertCircle, BarChart2, FilePlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ActiveLessonQA from '@/components/teacher/ActiveLessonQA';

export default function ActiveLesson() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusLessonId = searchParams.get('lessonId');

  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [manualStudent, setManualStudent] = useState(null);
  const [showStudentSelect, setShowStudentSelect] = useState(false);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s, p] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }),
      base44.entities.Student.filter({ teacherEmail: me.email }),
      base44.entities.Payment.filter({ teacherEmail: me.email }),
    ]);
    setLessons(l); setStudents(s); setPayments(p);
    setLoading(false);

    // URL'den gelen lessonId varsa otomatik seç
    if (focusLessonId) {
      const target = l.find(x => x.id === focusLessonId);
      if (target) setSelectedLesson(target);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 30 saniyede bir saati güncelle
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    const onFocus = () => { setNow(new Date()); loadData(); };
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, []);

  const todayStr = useMemo(() => {
    const d = now;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, [now]);

  const nowTime = useMemo(() => {
    const d = now;
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }, [now]);

  // Aktif dersler: bugün, startTime geçti, endTime gelmedi, planlandı
  const activeLessons = useMemo(() => {
    return lessons.filter(l =>
      l.date === todayStr &&
      l.startTime && l.endTime &&
      l.startTime <= nowTime &&
      l.endTime > nowTime &&
      l.status === 'planlandı'
    ).sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [lessons, todayStr, nowTime]);

  // Bugünkü yaklaşan dersler (henüz başlamamış)
  const upcomingToday = useMemo(() => {
    return lessons.filter(l =>
      l.date === todayStr &&
      l.startTime && l.startTime > nowTime &&
      l.status === 'planlandı'
    ).sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [lessons, todayStr, nowTime]);

  const getStudent = (lesson) => students.find(s => s.id === lesson.studentId);

  const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // ── Q&A akışı aktifse ──
  if (selectedLesson) {
    const student = getStudent(selectedLesson);
    return (
      <ActiveLessonQA
        lesson={selectedLesson}
        student={student}
        payments={payments}
        onBack={() => { setSelectedLesson(null); navigate('/ActiveLesson'); }}
        onSaved={() => { loadData(); }}
      />
    );
  }

  // ── Manuel rapor akışı ──
  if (manualStudent) {
    const syntheticLesson = {
      id: 'manual-' + Date.now(),
      studentId: manualStudent.id,
      studentName: manualStudent.name,
      subject: manualStudent.subject || '',
      date: todayStr,
      startTime: null,
      endTime: null,
      lessonFee: manualStudent.feePerLesson || 0,
    };
    return (
      <ActiveLessonQA
        lesson={syntheticLesson}
        student={manualStudent}
        payments={payments}
        manual={true}
        onBack={() => setManualStudent(null)}
        onSaved={() => { loadData(); }}
      />
    );
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <Radio size={20} color='white' />
          </span>
          {t('activeLesson.title')}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t('activeLesson.subtitle')}</p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>{t('teacher.layout.loading')}</div>
      ) : activeLessons.length > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'al-pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {activeLessons.length} {t('activeLesson.activeNow')}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: 640 }}>
            {activeLessons.map(lesson => {
              const student = getStudent(lesson);
              return (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  style={{
                    background: 'white', borderRadius: 18, border: '1.5px solid #fecaca',
                    boxShadow: '0 4px 20px rgba(239,68,68,0.12)', cursor: 'pointer',
                    overflow: 'hidden', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(239,68,68,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,68,68,0.12)'; }}
                >
                  {/* Gradient header */}
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: getColor(lesson.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{getInitials(lesson.studentName)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{lesson.studentName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>{lesson.subject || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{lesson.startTime?.slice(0,5)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.15rem' }}>{lesson.endTime?.slice(0,5)}</div>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'al-pulse 1.5s ease-in-out infinite' }} />
                      {t('activeLesson.inProgress')}
                    </div>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {t('activeLesson.startNotes')} <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Boş durum
        <div style={{ maxWidth: 640 }}>
          <div style={{ background: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <AlertCircle size={28} color='#9ca3af' />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 0.4rem' }}>{t('activeLesson.noActive')}</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: 0 }}>{t('activeLesson.noActiveDesc')}</p>
          </div>

          {/* Hızlı aksiyonlar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowStudentSelect(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.85rem 1.25rem', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)', transition: 'all 0.15s',
              }}
            >
              <FilePlus size={18} /> {t('activeLesson.addManualReport')}
            </button>
            <button
              onClick={() => navigate('/TeacherReports')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.85rem 1.25rem', borderRadius: 14,
                border: '1.5px solid #e5e7eb', background: 'white', color: '#4f46e5',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <BarChart2 size={18} /> {t('activeLesson.viewReports')}
            </button>
          </div>

          {/* Bugünkü yaklaşan dersler */}
          {upcomingToday.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <Clock size={15} color='#6366f1' />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6366f1' }}>{t('activeLesson.upcomingToday')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {upcomingToday.map(lesson => (
                  <div key={lesson.id} style={{ background: 'white', borderRadius: 14, border: '1.5px solid #f1f5f9', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', opacity: 0.85 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: getColor(lesson.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>{getInitials(lesson.studentName)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>{lesson.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{lesson.subject || ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>
                      <Clock size={13} /> {lesson.startTime?.slice(0,5)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Öğrenci seçme modalı */}
      {showStudentSelect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowStudentSelect(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{t('activeLesson.selectStudent')}</h2>
              <button onClick={() => setShowStudentSelect(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}><X size={20} /></button>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem' }}>{t('activeLesson.selectStudentDesc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
              {students.filter(s => s.status !== 'archived').map(s => (
                <button key={s.id} onClick={() => { setManualStudent(s); setShowStudentSelect(false); }} style={{ padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#111827', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>{getInitials(s.name)}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div>{s.name}</div>
                    {s.subject && <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 400 }}>{s.subject}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes al-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}