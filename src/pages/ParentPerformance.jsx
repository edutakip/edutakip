import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, TrendingUp, BookOpen, Target, CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
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

  // Stats
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
    'katıldı': { bg: '#d1fae5', color: '#065f46', label: 'Katıldı' },
    'geç kaldı': { bg: '#fef3c7', color: '#92400e', label: 'Geç Kaldı' },
    'katılmadı': { bg: '#fee2e2', color: '#b91c1c', label: 'Katılmadı' },
  }[a] || { bg: '#f3f4f6', color: '#6b7280', label: a });

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Gelişim Raporu</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{student.name} · {reports.length} değerlendirme</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Avg Rating */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#fef9c3' }}>
              <Star size={16} color='#f59e0b' fill='#f59e0b' />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ort. Puan</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: ratingColor(parseFloat(avgRating)) }}>{avgRating}</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>/ 5.0</p>
        </div>

        {/* Attendance */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#d1fae5' }}>
              <CheckCircle size={16} color='#10b981' />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Devam</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>{attendanceRate}%</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>{attended}/{reports.length} ders</p>
        </div>

        {/* Total Reports */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#e0e7ff' }}>
              <BookOpen size={16} color='#6366f1' />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rapor</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#6366f1' }}>{reports.length}</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>toplam değerlendirme</p>
        </div>

        {/* Homework */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#fce7f3' }}>
              <Target size={16} color='#ec4899' />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ödev</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#ec4899' }}>{reportsWithHomework}</p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>ödev verildi</p>
        </div>
      </div>

      {/* Rating trend bar */}
      {reports.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color='#6366f1' />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Performans Trendi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {[...reports].reverse().slice(-12).map((r, i) => {
              const h = ((r.rating || 0) / 5) * 80;
              const color = ratingColor(r.rating);
              return (
                <div key={r.id} title={`${r.date}: ${r.rating}/5`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '100%', height: `${h}px`, background: color, borderRadius: '4px 4px 0 0', opacity: 0.85, minHeight: '4px', transition: 'height 0.3s' }} />
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

      {/* Report List */}
      {reports.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
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
              <div key={report.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {/* Row */}
                <div onClick={() => setExpandedId(isOpen ? null : report.id)}
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  {/* Rating circle */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: ratingColor(report.rating) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: ratingColor(report.rating) }}>{report.rating}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>
                      {report.subject || 'Ders'} — {dateStr}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.generalNote || report.topicsCovered || 'Not yok'}
                    </div>
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={13} fill={n <= (report.rating||0) ? '#f59e0b' : 'none'} color={n <= (report.rating||0) ? '#f59e0b' : '#e5e7eb'} />
                    ))}
                  </div>

                  {/* Attendance */}
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '8px', background: att.bg, color: att.color, flexShrink: 0 }}>
                    {att.label}
                  </span>

                  {isOpen ? <ChevronUp size={16} color='#9ca3af' /> : <ChevronDown size={16} color='#9ca3af' />}
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fafafa' }}>
                    {report.topicsCovered && (
                      <Section emoji="📚" title="İşlenen Konular" text={report.topicsCovered} />
                    )}
                    {report.generalNote && (
                      <Section emoji="📋" title="Genel Değerlendirme" text={report.generalNote} />
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {report.strengths && <Section emoji="💪" title="Güçlü Yönler" text={report.strengths} accent='#d1fae5' />}
                      {report.improvements && <Section emoji="📈" title="Gelişim Alanları" text={report.improvements} accent='#fef3c7' />}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {report.homework && <Section emoji="📝" title="Verilen Ödev" text={report.homework} accent='#e0e7ff' />}
                      {report.nextGoal && <Section emoji="🎯" title="Sonraki Ders Hedefi" text={report.nextGoal} accent='#fce7f3' />}
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

function Section({ emoji, title, text, accent = '#f3f4f6' }) {
  return (
    <div style={{ background: accent, borderRadius: '10px', padding: '0.875rem' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{emoji} {title}</p>
      <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: '1.6' }}>{text}</p>
    </div>
  );
}