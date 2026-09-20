import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, Check, Star, X, Save, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/lib/toast';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function ActiveLessonQA({ lesson, student, payments, onBack, onSaved, manual }) {
  const { t } = useTranslation();
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 1024;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [answers, setAnswers] = useState({
    topicsCovered: '',
    pageLeft: '',
    rating: 0,
    homeworkDone: '',
    strengths: '',
    improvements: '',
    homework: '',
    nextGoal: '',
    generalNote: '',
  });

  const STEPS = [
    { key: 'topicsCovered', type: 'textarea', icon: '📖', label: t('activeLesson.q.topicsCovered'), placeholder: t('activeLesson.q.topicsCoveredPh') },
    { key: 'pageLeft', type: 'text', icon: '📄', label: t('activeLesson.q.pageLeft'), placeholder: t('activeLesson.q.pageLeftPh') },
    { key: 'rating', type: 'rating', icon: '⭐', label: t('activeLesson.q.rating') },
    { key: 'homeworkDone', type: 'choice', icon: '✅', label: t('activeLesson.q.homeworkDone'), options: [
      { val: 'evet', label: t('activeLesson.q.yes'), color: '#10b981', bg: '#d1fae5' },
      { val: 'hayir', label: t('activeLesson.q.no'), color: '#ef4444', bg: '#fee2e2' },
      { val: 'kismen', label: t('activeLesson.q.partially'), color: '#f59e0b', bg: '#fef3c7' },
    ]},
    { key: 'strengths', type: 'textarea', icon: '💪', label: t('activeLesson.q.strengths'), placeholder: t('activeLesson.q.strengthsPh') },
    { key: 'improvements', type: 'textarea', icon: '📈', label: t('activeLesson.q.improvements'), placeholder: t('activeLesson.q.improvementsPh') },
    { key: 'homework', type: 'textarea', icon: '📝', label: t('activeLesson.q.homeworkGiven'), placeholder: t('activeLesson.q.homeworkGivenPh') },
    { key: 'nextGoal', type: 'textarea', icon: '🎯', label: t('activeLesson.q.nextGoal'), placeholder: t('activeLesson.q.nextGoalPh') },
    { key: 'generalNote', type: 'textarea', icon: '💬', label: t('activeLesson.q.generalNote'), placeholder: t('activeLesson.q.generalNotePh') },
  ];

  const totalSteps = STEPS.length;
  const current = STEPS[step];
  const isLast = step === totalSteps - 1;
  const value = answers[current.key];

  const setVal = (v) => setAnswers(a => ({ ...a, [current.key]: v }));

  const canProceed = () => {
    if (current.type === 'rating') return value > 0;
    if (current.type === 'choice') return !!value;
    return true; // text alanları opsiyonel geçilebilir
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      // Özet not
      const summaryParts = [
        answers.topicsCovered && `${t('activeLesson.q.topicsCovered')}: ${answers.topicsCovered}`,
        answers.pageLeft && `${t('activeLesson.q.pageLeft')}: ${answers.pageLeft}`,
        answers.rating && `${t('activeLesson.q.rating')}: ${answers.rating}/5`,
        answers.homeworkDone && `${t('activeLesson.q.homeworkDone')}: ${answers.homeworkDone}`,
        answers.strengths && `${t('activeLesson.q.strengths')}: ${answers.strengths}`,
        answers.improvements && `${t('activeLesson.q.improvements')}: ${answers.improvements}`,
        answers.homework && `${t('activeLesson.q.homeworkGiven')}: ${answers.homework}`,
        answers.nextGoal && `${t('activeLesson.q.nextGoal')}: ${answers.nextGoal}`,
        answers.generalNote && `${t('activeLesson.q.generalNote')}: ${answers.generalNote}`,
      ].filter(Boolean);
      const notesSummary = summaryParts.join('\n');

      // Öğrenci ücreti
      const fee = lesson.lessonFee || student?.feePerLesson || 0;

      // Lesson güncelle (manuel modda atla) + LessonReport oluştur (paralel)
      await Promise.all([
        manual ? Promise.resolve() : base44.entities.Lesson.update(lesson.id, {
          status: 'tamamlandı',
          notes: notesSummary,
        }),
        base44.entities.LessonReport.create({
          lessonId: lesson.id,
          studentId: lesson.studentId,
          studentName: lesson.studentName,
          teacherEmail: me.email,
          date: lesson.date,
          subject: lesson.subject,
          rating: answers.rating || 0,
          attendance: 'katıldı',
          topicsCovered: answers.topicsCovered,
          strengths: answers.strengths,
          improvements: answers.improvements,
          homework: answers.homework,
          nextGoal: answers.nextGoal,
          generalNote: answers.generalNote,
        }),
      ]);

      base44.analytics.track({ eventName: 'lesson_recorded' });

      // Ödeme kaydı oluştur (manuel modda atla — finans'a karışmasın)
      if (!manual) {
        const existing = payments.find(p => p.lessonId === lesson.id || (p.studentId === lesson.studentId && p.date === lesson.date && p.description?.includes(lesson.startTime?.slice(0,5) || '__')));
        if (!existing && fee > 0) {
        await base44.entities.Payment.create({
          studentId: lesson.studentId, studentName: lesson.studentName,
          teacherEmail: me.email, amount: fee, date: lesson.date,
          status: 'bekliyor', description: `${lesson.subject || 'Ders'} - ${lesson.date}${manual ? ' (Manuel)' : ' ' + (lesson.startTime?.slice(0,5) || '')}`,
          month: lesson.date?.slice(0, 7), lessonId: manual ? null : lesson.id,
        });
        }
      }

      setSaved(true);
      showToast({ message: t('activeLesson.saved'), type: 'success' });
      setTimeout(() => { onSaved(); onBack(); }, 1500);
    } catch (e) {
      showToast({ message: t('activeLesson.saveError'), type: 'error' });
      setSaving(false);
    }
  };

  const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // ── Kayıt başarılı ekranı ──
  if (saved) {
    return (
      <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} color='#10b981' />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>{t('activeLesson.savedTitle')}</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{t('activeLesson.savedDesc')}</p>
        </div>
      </div>
    );
  }

  // ── Yardımcı: tek bir alanı render et (desktop grid için) ──
  const renderField = (field) => {
    const val = answers[field.key];
    const setFieldVal = (v) => setAnswers(a => ({ ...a, [field.key]: v }));
    return (
      <div key={field.key}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{field.icon}</span> {field.label}
        </label>
        {field.type === 'textarea' && (
          <textarea
            value={val}
            onChange={e => setFieldVal(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            style={{
              width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none',
              resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.15s',
              background: '#fafafa',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        )}
        {field.type === 'text' && (
          <input
            type="text"
            value={val}
            onChange={e => setFieldVal(e.target.value)}
            placeholder={field.placeholder}
            style={{
              width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none',
              transition: 'border 0.15s', background: '#fafafa',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        )}
        {field.type === 'rating' && (
          <div style={{ display: 'flex', gap: '0.4rem', padding: '0.25rem 0' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFieldVal(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', transform: val >= n ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s', padding: '0.15rem' }}>
                <Star size={32} fill={val >= n ? '#f59e0b' : 'none'} color={val >= n ? '#f59e0b' : '#d1d5db'} />
              </button>
            ))}
          </div>
        )}
        {field.type === 'choice' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {field.options.map(opt => (
              <button key={opt.val} onClick={() => setFieldVal(opt.val)} style={{
                flex: '1', minWidth: 100, padding: '0.7rem 1rem', borderRadius: 10,
                border: `2px solid ${val === opt.val ? opt.color : '#e5e7eb'}`,
                background: val === opt.val ? opt.bg : 'white',
                color: val === opt.val ? opt.color : '#6b7280',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              }}>
                {val === opt.val && <Check size={16} />} {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Masaüstü: iki sütunlu tek sayfa form ──
  if (isDesktop) {
    return (
      <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem', padding: 0 }}>
          <ArrowLeft size={16} /> {t('activeLesson.back')}
        </button>

        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          {/* Lesson info card */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', borderRadius: 18, padding: '1.1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: getColor(lesson.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white' }}>{getInitials(lesson.studentName)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{lesson.studentName}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>
                {lesson.subject}{manual ? ` · ${t('activeLesson.manualMode')}` : ` · ${lesson.startTime?.slice(0,5)} - ${lesson.endTime?.slice(0,5)}`}
              </div>
            </div>
            {!manual && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: '#fca5a5', background: 'rgba(239,68,68,0.15)', padding: '0.25rem 0.65rem', borderRadius: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'al-pulse 1.5s ease-in-out infinite' }} />
                {t('activeLesson.live')}
              </div>
            )}
          </div>

          {/* Form kartı — iki sütunlu grid */}
          <div style={{ background: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 1.5rem' }}>
              {/* İşlenen konular — tam genişlik */}
              <div style={{ gridColumn: '1 / -1' }}>{renderField(STEPS[0])}</div>
              {/* Sayfa + Puan — yan yana */}
              {renderField(STEPS[1])}
              {renderField(STEPS[2])}
              {/* Ödev yapıldı mı — tam genişlik */}
              <div style={{ gridColumn: '1 / -1' }}>{renderField(STEPS[3])}</div>
              {/* Güçlü yönler + Geliştirilecek — yan yana */}
              {renderField(STEPS[4])}
              {renderField(STEPS[5])}
              {/* Verilen ödev + Sonraki hedef — yan yana */}
              {renderField(STEPS[6])}
              {renderField(STEPS[7])}
              {/* Genel not — tam genişlik */}
              <div style={{ gridColumn: '1 / -1' }}>{renderField(STEPS[8])}</div>
            </div>

            {/* Kaydet butonu */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', fontWeight: 800, fontSize: '0.9rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  transition: 'all 0.15s',
                }}
              >
                <Save size={17} /> {saving ? t('activeLesson.saving') : t('activeLesson.save')}
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes al-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }
        `}</style>
      </div>
    );
  }

  // ── Mobil: adım adım sihirbaz ──
  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Back + header */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem', padding: 0 }}>
        <ArrowLeft size={16} /> {t('activeLesson.back')}
      </button>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Lesson info card */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', borderRadius: 18, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: getColor(lesson.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{getInitials(lesson.studentName)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>{lesson.studentName}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>
              {lesson.subject}{manual ? ` · ${t('activeLesson.manualMode')}` : ` · ${lesson.startTime?.slice(0,5)} - ${lesson.endTime?.slice(0,5)}`}
            </div>
          </div>
          {!manual && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: '#fca5a5', background: 'rgba(239,68,68,0.15)', padding: '0.25rem 0.65rem', borderRadius: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'al-pulse 1.5s ease-in-out infinite' }} />
              {t('activeLesson.live')}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{step + 1} / {totalSteps}</span>
            <span style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700 }}>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((step + 1) / totalSteps) * 100}%`, borderRadius: 999, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{current.icon}</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>{current.label}</h3>

          {/* Input types */}
          {current.type === 'textarea' && (
            <textarea
              value={value}
              onChange={e => setVal(e.target.value)}
              placeholder={current.placeholder}
              rows={4}
              autoFocus
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: 12,
                border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          )}

          {current.type === 'text' && (
            <input
              type="text"
              value={value}
              onChange={e => setVal(e.target.value)}
              placeholder={current.placeholder}
              autoFocus
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: 12,
                border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none',
                transition: 'border 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          )}

          {current.type === 'rating' && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem 0' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setVal(n)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    transform: value >= n ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s', padding: '0.25rem',
                  }}
                >
                  <Star
                    size={40}
                    fill={value >= n ? '#f59e0b' : 'none'}
                    color={value >= n ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>
          )}

          {current.type === 'choice' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {current.options.map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setVal(opt.val)}
                  style={{
                    flex: '1', minWidth: 120, padding: '1rem 1.25rem', borderRadius: 14,
                    border: `2px solid ${value === opt.val ? opt.color : '#e5e7eb'}`,
                    background: value === opt.val ? opt.bg : 'white',
                    color: value === opt.val ? opt.color : '#6b7280',
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}
                >
                  {value === opt.val && <Check size={18} />}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '0.7rem 1.25rem', borderRadius: 12, border: '1.5px solid #e5e7eb',
                background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              <ArrowLeft size={15} /> {t('activeLesson.prev')}
            </button>
          )}
          <div style={{ flex: 1 }} />
          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{
                padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none',
                background: canProceed() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb',
                color: 'white', fontWeight: 700, fontSize: '0.85rem',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              {t('activeLesson.next')} <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', fontWeight: 800, fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <Save size={15} /> {saving ? t('activeLesson.saving') : t('activeLesson.save')}
            </button>
          )}
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 999,
                background: i === step ? '#4f46e5' : i < step ? '#c7d2fe' : '#e5e7eb',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes al-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}