import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, BookOpen, ClipboardList, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ParentPerformance() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) {
        const s = all[0];
        setStudent(s);
        const l = await base44.entities.Lesson.filter({ studentId: s.id, status: 'tamamlandı' }, '-date');
        setLessons(l);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</div>;

  if (!student) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Önce bir öğrenciye bağlanmanız gerekiyor.</p>
    </div>
  );

  const evaluated = lessons.filter(l => l.evaluationRating);
  const avgRating = evaluated.length > 0 ? (evaluated.reduce((s, l) => s + l.evaluationRating, 0) / evaluated.length).toFixed(1) : null;

  const attitudeCount = {};
  evaluated.forEach(l => { if (l.studentAttitude) attitudeCount[l.studentAttitude] = (attitudeCount[l.studentAttitude] || 0) + 1; });

  const chartData = lessons.slice(0, 10).reverse().map((l, i) => ({
    name: l.date ? format(parseISO(l.date), 'd MMM', { locale: tr }) : `#${i + 1}`,
    puan: l.evaluationRating || 0,
  }));

  const attitudeColor = { 'çok iyi': '#10b981', 'iyi': '#6366f1', 'orta': '#f59e0b', 'geliştirmeli': '#ef4444' };

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800' }}>Öğrenci Gelişim Raporu</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{student.name} · Tamamlanan dersler</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tamamlanan Ders', value: lessons.length, icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Değerlendirilen', value: evaluated.length, icon: ClipboardList, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Ortalama Puan', value: avgRating ? `${avgRating}/5` : '—', icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Ödev Verilen', value: lessons.filter(l => l.homeworkGiven).length, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{label}</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800' }}>{value}</p>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: bg }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Rating Chart */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1.25rem' }}>Ders Puan Grafiği</h3>
          {chartData.filter(d => d.puan > 0).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Henüz değerlendirme yapılmadı</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}/5`, 'Puan']} />
                <Bar dataKey="puan" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.puan >= 4 ? '#10b981' : entry.puan >= 3 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attitude Distribution */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1.25rem' }}>Tutum Dağılımı</h3>
          {Object.keys(attitudeCount).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Veri yok</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(attitudeCount).sort((a, b) => b[1] - a[1]).map(([att, count]) => (
                <div key={att}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: attitudeColor[att] }}>{att}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} ders</span>
                  </div>
                  <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '99px' }}>
                    <div style={{ height: '100%', width: `${(count / evaluated.length) * 100}%`, background: attitudeColor[att], borderRadius: '99px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lesson Detail List */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' }}>Ders Detayları</h3>
        {lessons.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>Tamamlanan ders yok</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lessons.map(lesson => {
              const isOpen = expanded === lesson.id;
              const hasEval = lesson.evaluationRating || lesson.evaluationNote || lesson.homeworkGiven || lesson.topicsCompleted;
              return (
                <div key={lesson.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button onClick={() => setExpanded(isOpen ? null : lesson.id)}
                    style={{ width: '100%', padding: '1rem 1.25rem', background: isOpen ? 'var(--bg-hover)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                          {lesson.date && format(parseISO(lesson.date), 'd MMMM yyyy', { locale: tr })}
                        </span>
                        {lesson.subject && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>· {lesson.subject}</span>}
                        {!hasEval && <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: '#f3f4f6', color: '#9ca3af' }}>değerlendirme yok</span>}
                      </div>
                      {lesson.evaluationRating > 0 && (
                        <div style={{ display: 'flex', gap: '2px', marginTop: '0.3rem' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={13} fill={lesson.evaluationRating >= s ? '#f59e0b' : 'none'} color={lesson.evaluationRating >= s ? '#f59e0b' : '#d1d5db'} />
                          ))}
                        </div>
                      )}
                    </div>
                    {isOpen ? <ChevronUp size={16} color='var(--text-muted)' /> : <ChevronDown size={16} color='var(--text-muted)' />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {!hasEval && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Bu ders için öğretmen henüz değerlendirme girmemiş.</p>
                      )}
                      {lesson.studentAttitude && (
                        <InfoRow label="Tutum" value={lesson.studentAttitude} color={attitudeColor[lesson.studentAttitude]} />
                      )}
                      {lesson.topicsCompleted && (
                        <InfoRow label="İşlenen Konular" value={lesson.topicsCompleted} />
                      )}
                      {lesson.homeworkGiven && (
                        <InfoRow label="Verilen Ödev" value={lesson.homeworkGiven} highlight />
                      )}
                      {lesson.evaluationNote && (
                        <InfoRow label="Öğretmen Notu" value={lesson.evaluationNote} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, color, highlight }) {
  return (
    <div style={{ background: highlight ? 'rgba(245,158,11,0.07)' : 'var(--bg-hover)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '0.875rem', color: color || 'var(--text-primary)', fontWeight: color ? '700' : '400', lineHeight: '1.5' }}>{value}</p>
    </div>
  );
}