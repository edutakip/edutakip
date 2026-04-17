import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy } from 'lucide-react';
import { calcGamification, getLevel, ALL_BADGES } from './StudentGamification';
import StudentDetailDrawer from './StudentDetailDrawer';

export default function StudentLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const [students, reports, homeworks] = await Promise.all([
        base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
        base44.entities.LessonReport.filter({ teacherEmail: me.email }),
        base44.entities.Homework.filter({ teacherEmail: me.email }),
      ]);

      const data = students.map(s => {
        const sReports = reports.filter(r => r.studentId === s.id);
        const sHW = homeworks.filter(h => h.studentId === s.id);
        const g = calcGamification(sReports, sHW);
        const lvl = getLevel(g.points);
        const badges = ALL_BADGES.filter(b => g.earnedBadgeIds.has(b.id));
        return { student: s, ...g, lvl, badges };
      });

      data.sort((a, b) => b.points - a.points);
      setRows(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>Yükleniyor...</div>
  );

  if (rows.length === 0) return null;

  const avatarColors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#8b5cf6'];
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const rankEmoji = (i) => ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Trophy size={18} color='#f59e0b' />
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Öğrenci Lider Tablosu</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {rows.map((row, i) => (
          <div key={row.student.id}
            onClick={() => { setSelectedRow(row); setSelectedRank(i); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              padding: '0.75rem 1rem', borderRadius: 14,
              background: i === 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : i === 1 ? '#f8fafc' : i === 2 ? '#fff7f0' : 'white',
              border: `1.5px solid ${i === 0 ? '#fbbf24' : i === 1 ? '#e2e8f0' : i === 2 ? '#fed7aa' : '#f1f5f9'}`,
              transition: 'all 0.15s', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Rank */}
            <div style={{ width: 28, textAlign: 'center', fontSize: i < 3 ? '1.2rem' : '0.85rem', fontWeight: 800, color: '#9ca3af', flexShrink: 0 }}>
              {rankEmoji(i)}
            </div>

            {/* Avatar */}
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: getColor(row.student.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>{getInitials(row.student.name)}</span>
            </div>

            {/* Name + level */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.student.name}</div>
              <div style={{ fontSize: '0.7rem', color: row.lvl.color, fontWeight: 600 }}>{row.lvl.label}</div>
            </div>

            {/* Badges (top 3) */}
            <div style={{ display: 'flex', gap: '0.1rem', flexShrink: 0 }}>
              {row.badges.slice(0, 3).map(b => (
                <span key={b.id} title={b.label} style={{ fontSize: '1rem' }}>{b.emoji}</span>
              ))}
            </div>

            {/* Points */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: i === 0 ? '#d97706' : '#374151' }}>{row.points}</div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>puan</div>
            </div>
          </div>
        ))}
      </div>

      {selectedRow && (
        <StudentDetailDrawer
          row={selectedRow}
          rank={selectedRank}
          onClose={() => { setSelectedRow(null); setSelectedRank(null); }}
        />
      )}
    </div>
  );
}