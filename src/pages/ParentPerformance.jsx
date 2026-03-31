import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, TrendingUp, BookOpen, Target, CheckCircle, AlertCircle, ChevronDown, ChevronUp, FileText, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function ParentPerformance() {
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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
      const r = await base44.entities.LessonReport.filter({ studentId: s.id }, '-date');
      setReports(r);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Yükleniyor...
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!student) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af', flexDirection: 'column', gap: '0.75rem' }}>
      <AlertCircle size={40} style={{ opacity: 0.4 }} />
      <p>Bağlı öğrenci bulunamadı.</p>
    </div>
  );

  const avgRating = reports.length ? (reports.reduce((s, r) => s + (r.rating || 0), 0) / reports.length).toFixed(1) : '-';
  const attended = reports.filter(r => r.attendance === 'katıldı').length;
  const attendanceRate = reports.length ? Math.round((attended / reports.length) * 100) : 0;
  const reportsWithHomework = reports.filter(r => r.homework).length;

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

  return (
    <div style={{ padding: '2rem', height: '100vh', overflowY: 'auto', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Gelişim Raporu</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{student.name} · {reports.length} değerlendirme</p>
      </div>

      {/* Özet Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Star, iconBg: '#fef9c3', iconColor: '#f59e0b', label: 'Ort. Puan', value: avgRating, sub: '/ 5.0', color: ratingColor(parseFloat(avgRating)) },
          { icon: CheckCircle, iconBg: '#d1fae5', iconColor: '#10b981', label: 'Devam', value: attendanceRate + '%', sub: `${attended}/${reports.length} ders`, color: '#10b981' },
          { icon: BookOpen, iconBg: '#e0e7ff', iconColor: '#6366f1', label: 'Rapor', value: reports.length, sub: 'değerlendirme', color: '#6366f1' },
          { icon: Target, iconBg: '#fce7f3', iconColor: '#ec4899', label: 'Ödev', value: reportsWithHomework, sub: 'verildi', color: '#ec4899' },
        ].map(({ icon: Icon, iconBg, iconColor, label, value, sub, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 8, background: iconBg }}>
                <Icon size={16} color={iconColor} fill={Icon === Star ? iconColor : 'none'} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Performans Trendi */}
      {reports.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color='#6366f1' />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Performans Trendi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {[...reports].reverse().slice(-12).map((r) => {
              const h = ((r.rating || 0) / 5) * 80;
              return (
                <div key={r.id} title={`${r.date}: ${r.rating}/5`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: `${h}px`, background: ratingColor(r.rating), borderRadius: '4px 4px 0 0', opacity: 0.85, minHeight: 4 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>Eski</span>
            <span style={{ fontSize: '0.7rem', color: '#d1d5db' }}>Son</span>
          </div>
        </div>
      )}

      {/* Rapor Listesi */}
      {reports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, padding: '4rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>Henüz değerlendirme raporu yok.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Öğretmenin derslerden sonra rapor eklemesiyle görüntülenecek.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reports.map(report => {
            const isOpen = expandedId === report.id;
            const att = attendanceStyle(report.attendance);
            let dateStr = '';
            try { dateStr = format(parseISO(report.date), 'd MMMM yyyy', { locale: tr }); } catch {}

            return (
              <div key={report.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isOpen ? '#c7d2fe' : '#f1f5f9'}`, overflow: 'hidden', boxShadow: isOpen ? '0 4px 16px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>

                {/* Özet satır */}
                <div onClick={() => setExpandedId(isOpen ? null : report.id)}
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: ratingColor(report.rating) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: ratingColor(report.rating) }}>{report.rating}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                      {report.subject || 'Ders'} — {dateStr}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.topicsCovered || 'Konu belirtilmedi'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= (report.rating||0) ? '#f59e0b' : 'none'} color={n <= (report.rating||0) ? '#f59e0b' : '#e5e7eb'} />)}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 8, background: att.bg, color: att.color, flexShrink: 0 }}>{att.label}</span>
                  {isOpen ? <ChevronUp size={16} color='#9ca3af' /> : <ChevronDown size={16} color='#9ca3af' />}
                </div>

                {/* Genişletilmiş içerik */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Performans rozetleri */}
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

                    {/* İşlenen konular */}
                    {report.topicsCovered && (
                      <InfoBox icon={BookOpen} iconColor='#6366f1' title='İşlenen Konular' text={report.topicsCovered} accent='#e0e7ff' />
                    )}

                    {/* AI Raporu */}
                    {report.generalNote && (
                      <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 12, padding: '1rem 1.25rem', border: '1.5px solid #c7d2fe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Zap size={15} color='#4f46e5' />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Öğretmen Değerlendirmesi</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{report.generalNote}</p>
                      </div>
                    )}

                    {/* Zorlandığı nokta */}
                    {report.improvements && (
                      <InfoBox icon={TrendingUp} iconColor='#f59e0b' title='Dikkat Edilmesi Gereken' text={report.improvements} accent='#fef3c7' />
                    )}

                    {/* Ödev ve hedef */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {report.homework && <InfoBox icon={FileText} iconColor='#ec4899' title='Verilen Ödev' text={report.homework} accent='#fce7f3' />}
                      {report.nextGoal && <InfoBox icon={Target} iconColor='#10b981' title='Sonraki Ders Hedefi' text={report.nextGoal} accent='#d1fae5' />}
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

function Badge({ label, bg, color }) {
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, background: bg, color }}>
      {label}
    </span>
  );
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