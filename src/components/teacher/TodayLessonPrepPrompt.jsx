import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TodayLessonPrepPrompt({ onClose }) {
  const { t } = useTranslation();
  const [lessons, setLessons] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getTodayLessonPrep', {});
        if (res.data?.success && res.data.lessons?.length > 0) {
          setLessons(res.data.lessons);
          setExpandedId(res.data.lessons[0].lesson.studentId);
        }
      } catch (err) {
        console.error('Error loading today lesson prep:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || lessons.length === 0) return null;

  const handleClose = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`lessonPrepDismissed_${today}`, 'true');
    onClose?.();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 899,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '1.75rem', maxWidth: '480px', width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color='#3b82f6' />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>
                {t('teacher.lessonPrep.title') || 'Bugünün Derslerine Hazırlık'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                {lessons.length} ders — Önceki derslerin özeti
              </p>
            </div>
          </div>
          <button onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <style>{`
            div::-webkit-scrollbar { width: 6px; }
            div::-webkit-scrollbar-track { background: transparent; }
            div::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
            div::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}</style>
          {lessons.map((item) => {
            const isExpanded = expandedId === item.lesson.studentId;
            const lesson = item.lesson;
            const prev = item.previousLesson;

            return (
              <div key={lesson.studentId} style={{
                background: '#f8fafc', borderRadius: '14px', border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}>
                <button onClick={() => setExpandedId(isExpanded ? null : lesson.studentId)}
                  style={{
                    width: '100%', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>
                      {lesson.studentName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      ⏰ {lesson.startTime?.slice(0, 5)} {lesson.subject && `• ${lesson.subject}`}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} color='#6366f1' />
                  ) : (
                    <ChevronDown size={18} color='#9ca3af' />
                  )}
                </button>

                {isExpanded && prev && (
                  <div style={{ padding: '0 1rem 0.9rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.9rem' }}>
                    {prev.topicsCovered && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase' }}>📖 Konular</span>
                        <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {prev.topicsCovered}
                        </p>
                      </div>
                    )}
                    {prev.homework && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>📝 Ödev</span>
                        <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {prev.homework}
                        </p>
                      </div>
                    )}
                    {prev.nextGoal && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>🎯 Hedef</span>
                        <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {prev.nextGoal}
                        </p>
                      </div>
                    )}
                    {prev.improvements && (
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>⚡ Geliştirilmesi Gereken</span>
                        <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {prev.improvements}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && !prev && (
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.82rem' }}>
                    ℹ️ Bu öğrenci ile henüz ders raporları oluşturulmamıştır.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={handleClose}
          style={{
            width: '100%', marginTop: '1rem', padding: '0.8rem', borderRadius: '12px', border: 'none',
            background: '#f3f4f6', color: '#6b7280', fontWeight: '700', fontSize: '0.9rem',
            cursor: 'pointer',
          }}>
          Anladım ✓
        </button>
      </div>
    </div>
  );
}