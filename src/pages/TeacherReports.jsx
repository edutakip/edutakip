import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { Star, TrendingUp, BookOpen, Target, CheckCircle, AlertCircle, ChevronDown, ChevronUp, FileText, Zap, Users, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { isPro } from '@/lib/subscription';
import ProUpgradeModal from '@/components/ProUpgradeModal';

const UNDERSTOOD_MAP = {
  tam:    { label: 'Tam Anladı',      bg: '#d1fae5', color: '#065f46' },
  kismen: { label: 'Kısmen Anladı',  bg: '#fef3c7', color: '#92400e' },
  tekrar: { label: 'Tekrar Gerekli', bg: '#fee2e2', color: '#b91c1c' },
};
const PARTICIPATION_MAP = {
  aktif:  { label: 'Aktif Katılım',  bg: '#d1fae5', color: '#065f46' },
  orta:   { label: 'Orta Katılım',   bg: '#fef3c7', color: '#92400e' },
  pasif:  { label: 'Pasif',          bg: '#f3f4f6', color: '#6b7280' },
};
const MOTIVATION_MAP = {
  yuksek: { label: 'Yüksek Motivasyon', bg: '#d1fae5', color: '#065f46' },
  normal: { label: 'Normal Motivasyon', bg: '#e0e7ff', color: '#4338ca' },
  dusuk:  { label: 'Düşük Motivasyon',  bg: '#fee2e2', color: '#b91c1c' },
};

const ratingColor = (r) => {
  if (r >= 4.5) return '#10b981';
  if (r >= 3.5) return '#6366f1';
  if (r >= 2.5) return '#f59e0b';
  return '#ef4444';
};

const attendanceStyle = (a) => ({
  'katıldı':   { bg: '#d1fae5', color: '#065f46', label: 'Katıldı' },
  'geç kaldı': { bg: '#fef3c7', color: '#92400e', label: 'Geç Kaldı' },
  'katılmadı': { bg: '#fee2e2', color: '#b91c1c', label: 'Katılmadı' },
}[a] || { bg: '#f3f4f6', color: '#6b7280', label: a });

function Badge({ label, bg, color }) {
  return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, background: bg, color }}>{label}</span>;
}

function InfoBox({ icon: Icon, iconColor, title, text, accent }) {
  return (
    <div style={{ background: accent, borderRadius: 12, padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <Icon size={13} color={iconColor} />
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>{title}</p>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

export default function TeacherReports() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('tr') ? tr : undefined;
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setCurrentUser(me);
      const [s, r] = await Promise.all([
        base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
        base44.entities.LessonReport.filter({ teacherEmail: me.email }, '-date'),
      ]);
      setStudents(s);
      setReports(r);
      setLoading(false);
    })();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchStudent = selectedStudentId === 'all' || r.studentId === selectedStudentId;
    const matchSearch = !search || r.studentName?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase());
    return matchStudent && matchSearch;
  });

  const avgRating = filteredReports.length
    ? (filteredReports.reduce((s, r) => s + (r.rating || 0), 0) / filteredReports.length).toFixed(1)
    : '-';
  const attended = filteredReports.filter(r => r.attendance === 'katıldı').length;
  const attendanceRate = filteredReports.length ? Math.round((attended / filteredReports.length) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        {t('teacher.layout.loading')}
      </div>
    </div>
  );

  if (!isPro(currentUser)) {
    return (
      <>
        <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .pro-lock-icon {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
          <div style={{ background: 'white', borderRadius: 24, padding: '3.5rem 2.5rem', textAlign: 'center', maxWidth: 440, boxShadow: '0 20px 60px rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="pro-lock-icon" style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', boxShadow: '0 8px 24px rgba(251,146,60,0.25)' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C6.48 1 2 5.48 2 11v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 2c4.42 0 8 3.58 8 8v1H4v-1c0-4.42 3.58-8 8-8zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#d97706" opacity="0.8"/>
              </svg>
            </div>
            <h2 style={{ color: '#111827', fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{t('teacher.reports.proFeature')}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.7 }}>
              {t('teacher.reports.proDesc')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {[t('teacher.reports.proItem1'), t('teacher.reports.proItem2'), t('teacher.reports.proItem3')].map((item, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#4f46e5', fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
            <button onClick={() => setShowProModal(true)} style={{ width: '100%', padding: '1rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.3px' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(79,70,229,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.35)'; }}>
              {t('teacher.reports.upgradePro')} <span style={{ fontSize: '1.1rem' }}>🚀</span>
            </button>
          </div>
        </div>
        {showProModal && <ProUpgradeModal reason='finance' onClose={() => setShowProModal(false)} onUpgraded={() => setShowProModal(false)} />}
      </>
    );
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>{t('teacher.layout.progressReports')}</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{reports.length} {t('teacher.reports.reportCount')} · {students.length} {t('teacher.reports.studentCount')}</p>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Star, iconBg: '#fef9c3', iconColor: '#f59e0b', label: t('teacher.reports.avgScore'), value: avgRating, sub: '/ 5.0' },
          { icon: CheckCircle, iconBg: '#d1fae5', iconColor: '#10b981', label: t('teacher.reports.attendance'), value: attendanceRate + '%', sub: `${attended}/${filteredReports.length} ${t('teacher.reports.lesson')}` },
          { icon: FileText, iconBg: '#e0e7ff', iconColor: '#6366f1', label: t('teacher.reports.report'), value: filteredReports.length, sub: t('teacher.reports.evaluation') },
          { icon: Users, iconBg: '#fce7f3', iconColor: '#ec4899', label: t('teacher.reports.student'), value: students.length, sub: t('teacher.reports.active') },
        ].map(({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 8, background: iconBg }}><Icon size={16} color={iconColor} /></div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={15} color='#9ca3af' style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder={t('teacher.reports.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', fontSize: '0.875rem', outline: 'none', color: '#111827', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={selectedStudentId}
          onChange={e => { setSelectedStudentId(e.target.value); setExpandedId(null); }}
          style={{ padding: '0.6rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', fontSize: '0.875rem', color: '#111827', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">{t('teacher.finance.allStudents')}</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Performans Trendi */}
      {filteredReports.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color='#6366f1' />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{t('teacher.reports.performanceTrend')}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {[...filteredReports].reverse().slice(-16).map((r) => {
              const h = ((r.rating || 0) / 5) * 80;
              return (
                <div key={r.id} title={`${r.studentName} · ${r.date}: ${r.rating}/5`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}>
                  <div style={{ width: '100%', height: `${h}px`, background: ratingColor(r.rating), borderRadius: '4px 4px 0 0', opacity: 0.85, minHeight: 4, transition: 'opacity 0.15s' }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>{t('teacher.reports.oldest')}</span>
            <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>{t('teacher.reports.latest')}</span>
          </div>
        </div>
      )}

      {/* Rapor Listesi */}
      {filteredReports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '4rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>{t('teacher.reports.noReports')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredReports.map(report => {
            const isOpen = expandedId === report.id;
            const att = attendanceStyle(report.attendance);
            let dateStr = '';
            try { dateStr = format(parseISO(report.date), 'd MMMM yyyy', { locale: dateLocale }); } catch {}

            return (
              <div key={report.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isOpen ? '#c7d2fe' : '#f1f5f9'}`, overflow: 'hidden', boxShadow: isOpen ? '0 4px 16px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                <div onClick={() => setExpandedId(isOpen ? null : report.id)}
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: ratingColor(report.rating) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: ratingColor(report.rating) }}>{report.rating}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                      {report.studentName} — {report.subject || 'Ders'} · {dateStr}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.topicsCovered || t('teacher.reports.noTopicSpecified')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= (report.rating||0) ? '#f59e0b' : 'none'} color={n <= (report.rating||0) ? '#f59e0b' : '#e5e7eb'} />)}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 8, background: att.bg, color: att.color, flexShrink: 0 }}>{att.label}</span>
                  {isOpen ? <ChevronUp size={16} color='#9ca3af' /> : <ChevronDown size={16} color='#9ca3af' />}
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {report.understood && UNDERSTOOD_MAP[report.understood] && (
                        <Badge label={UNDERSTOOD_MAP[report.understood].label} bg={UNDERSTOOD_MAP[report.understood].bg} color={UNDERSTOOD_MAP[report.understood].color} />
                      )}
                      {report.participation && PARTICIPATION_MAP[report.participation] && (
                        <Badge label={PARTICIPATION_MAP[report.participation].label} bg={PARTICIPATION_MAP[report.participation].bg} color={PARTICIPATION_MAP[report.participation].color} />
                      )}
                      {report.motivation && MOTIVATION_MAP[report.motivation] && (
                        <Badge label={MOTIVATION_MAP[report.motivation].label} bg={MOTIVATION_MAP[report.motivation].bg} color={MOTIVATION_MAP[report.motivation].color} />
                      )}
                    </div>
                    {report.topicsCovered && <InfoBox icon={BookOpen} iconColor='#6366f1' title={t('teacher.lessonReport.topicsCovered')} text={report.topicsCovered} accent='#e0e7ff' />}
                    {report.generalNote && (
                      <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 12, padding: '1rem 1.25rem', border: '1.5px solid #c7d2fe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Zap size={15} color='#4f46e5' />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('teacher.reports.evaluation')}</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{report.generalNote}</p>
                      </div>
                    )}
                    {report.improvements && <InfoBox icon={TrendingUp} iconColor='#f59e0b' title={t('teacher.reports.needsAttention')} text={report.improvements} accent='#fef3c7' />}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {report.homework && <InfoBox icon={FileText} iconColor='#ec4899' title={t('teacher.lessonReport.homework')} text={report.homework} accent='#fce7f3' />}
                      {report.nextGoal && <InfoBox icon={Target} iconColor='#10b981' title={t('teacher.lessonReport.nextGoal')} text={report.nextGoal} accent='#d1fae5' />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}