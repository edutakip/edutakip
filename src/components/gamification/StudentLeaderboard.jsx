import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Search, Edit3, Sparkles, Users, Medal, Star } from 'lucide-react';
import { calcGamification, getLevel, ALL_BADGES } from './StudentGamification';
import StudentDetailDrawer from './StudentDetailDrawer';
import PointsEditor from './PointsEditor';
import { showToast } from '@/lib/toast';

export default function StudentLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [students, reports, homeworks] = await Promise.all([
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
      base44.entities.LessonReport.filter({ teacherEmail: me.email }),
      base44.entities.Homework.filter({ teacherEmail: me.email }),
    ]);

    const data = students.map(s => {
      const sReports = reports.filter(r => r.studentId === s.id);
      const sHW = homeworks.filter(h => h.studentId === s.id);
      const adj = s.pointsAdjustment || 0;
      const g = calcGamification(sReports, sHW, adj);
      const lvl = getLevel(g.points);
      const badges = ALL_BADGES.filter(b => g.earnedBadgeIds.has(b.id));
      return { student: s, ...g, lvl, badges };
    });

    data.sort((a, b) => b.points - a.points);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => setLoading(false));
  }, []);

  const handleAdjust = async (newAdjustment, note) => {
    if (!editingStudent) return;
    try {
      await base44.entities.Student.update(editingStudent.id, {
        pointsAdjustment: newAdjustment,
        pointsNote: note || '',
      });
      showToast({ message: `Puan güncellendi — ${editingStudent.name}`, type: 'success' });
      await loadData();
      // editingStudent'ı güncelle ki modal açık kalsın
      const updated = (await base44.entities.Student.filter({ teacherEmail: (await base44.auth.me()).email, status: 'active' }))
        .find(s => s.id === editingStudent.id);
      if (updated) setEditingStudent(updated);
    } catch (e) {
      showToast({ message: 'Puan güncellenemedi', type: 'error' });
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.student.name?.toLowerCase().includes(q));
  }, [rows, search]);

  // Özet istatistikler
  const summary = useMemo(() => {
    if (!rows.length) return { totalStudents: 0, totalPoints: 0, totalBadges: 0, avgPoints: 0 };
    const totalPoints = rows.reduce((s, r) => s + r.points, 0);
    const totalBadges = rows.reduce((s, r) => s + r.badges.length, 0);
    return {
      totalStudents: rows.length,
      totalPoints,
      totalBadges,
      avgPoints: Math.round(totalPoints / rows.length),
    };
  }, [rows]);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>Yükleniyor...</div>
  );

  if (rows.length === 0) return null;

  const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const rankEmoji = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={18} color='white' />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>Öğrenci Lider Tablosu</h3>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>Puanları düzenlemek için ✏️ simgesine tıkla</p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { icon: '👥', val: summary.totalStudents, label: 'Öğrenci', color: '#6366f1', bg: '#eef2ff' },
            { icon: '⭐', val: summary.totalPoints, label: 'Toplam Puan', color: '#f59e0b', bg: '#fef3c7' },
            { icon: '🏅', val: summary.totalBadges, label: 'Rozet', color: '#10b981', bg: '#d1fae5' },
            { icon: '📊', val: summary.avgPoints, label: 'Ort. Puan', color: '#ec4899', bg: '#fce7f3' },
          ].map(({ icon, val, label, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 12, padding: '0.6rem 0.5rem', textAlign: 'center', border: `1px solid ${color}22` }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.15rem' }}>{icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.58rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginTop: '0.85rem' }}>
          <Search size={14} color='#9ca3af' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Öğrenci ara..."
            style={{
              width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: '0.8rem', outline: 'none',
              transition: 'border 0.15s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {filteredRows.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>Sonuç bulunamadı.</div>
        )}
        {filteredRows.map((row, i) => {
          const realRank = rows.indexOf(row);
          const adj = row.pointsAdjustment || 0;
          return (
            <div
              key={row.student.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.7rem 0.85rem', borderRadius: 14,
                background: realRank === 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : realRank === 1 ? '#f8fafc' : realRank === 2 ? '#fff7f0' : 'white',
                border: `1.5px solid ${realRank === 0 ? '#fbbf24' : realRank === 1 ? '#e2e8f0' : realRank === 2 ? '#fed7aa' : '#f1f5f9'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = realRank === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = realRank === 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : realRank === 1 ? '#f8fafc' : realRank === 2 ? '#fff7f0' : 'white'}
            >
              {/* Rank */}
              <div
                onClick={() => { setSelectedRow(row); setSelectedRank(realRank); }}
                style={{ width: 32, textAlign: 'center', fontSize: realRank < 3 ? '1.3rem' : '0.85rem', fontWeight: 800, color: '#9ca3af', flexShrink: 0, cursor: 'pointer' }}
              >
                {rankEmoji(realRank)}
              </div>

              {/* Avatar */}
              <div
                onClick={() => { setSelectedRow(row); setSelectedRank(realRank); }}
                style={{ width: 40, height: 40, borderRadius: '50%', background: getColor(row.student.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{getInitials(row.student.name)}</span>
                {adj !== 0 && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    background: adj > 0 ? '#10b981' : '#ef4444', color: 'white',
                    fontSize: '0.55rem', fontWeight: 800, padding: '0.1rem 0.3rem',
                    borderRadius: 10, border: '1.5px solid white', minWidth: 16, textAlign: 'center',
                  }}>
                    {adj > 0 ? '+' : ''}{adj}
                  </div>
                )}
              </div>

              {/* Name + level */}
              <div
                onClick={() => { setSelectedRow(row); setSelectedRank(realRank); }}
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.student.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.68rem', color: row.lvl.color, fontWeight: 700 }}>{row.lvl.label}</span>
                  <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>· {row.badges.length} 🏅</span>
                </div>
              </div>

              {/* Badges (top 3) */}
              <div style={{ display: 'flex', gap: '0.1rem', flexShrink: 0 }}>
                {row.badges.slice(0, 3).map(b => (
                  <span key={b.id} title={b.label} style={{ fontSize: '1.05rem' }}>{b.emoji}</span>
                ))}
                {row.badges.length > 3 && (
                  <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, alignSelf: 'center', marginLeft: '0.2rem' }}>+{row.badges.length - 3}</span>
                )}
              </div>

              {/* Points */}
              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 50 }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: realRank === 0 ? '#d97706' : '#374151', lineHeight: 1 }}>{row.points}</div>
                <div style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>puan</div>
              </div>

              {/* Edit button */}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingStudent(row.student); }}
                title="Puan düzenle"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb',
                  background: 'white', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <Edit3 size={14} color='#6b7280' />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#9ca3af' }}>
          <Sparkles size={12} color='#f59e0b' />
          <span>{ALL_BADGES.length} rozet mevcut · {summary.totalBadges} rozet kazanıldı</span>
        </div>
      </div>

      {selectedRow && (
        <StudentDetailDrawer
          row={selectedRow}
          rank={selectedRank}
          onClose={() => { setSelectedRow(null); setSelectedRank(null); }}
        />
      )}

      {editingStudent && (
        <PointsEditor
          student={editingStudent}
          adjustment={editingStudent.pointsAdjustment || 0}
          onAdjust={handleAdjust}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}