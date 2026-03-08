import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, BookOpen, Video, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import LessonModal from '../components/teacher/LessonModal';

const STATUS_MAP = {
  planlandı: { label: 'Planlandı', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', icon: Clock },
  tamamlandı: { label: 'Tamamlandı', color: '#059669', bg: 'rgba(5,150,105,0.1)', icon: CheckCircle },
  iptal: { label: 'İptal', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: XCircle },
};

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    const [l, s] = await Promise.all([
      base44.entities.Lesson.filter({ teacherEmail: me.email }, '-date'),
      base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
    ]);
    setLessons(l); setStudents(s);
  };

  const filtered = filter === 'all' ? lessons : lessons.filter(l => l.status === filter);

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800' }}>Dersler</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{lessons.length} ders kayıtlı</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.6rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Ders Ekle
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['planlandı', 'Planlandı'], ['tamamlandı', 'Tamamlandı'], ['iptal', 'İptal']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: `1px solid ${filter === val ? 'var(--accent)' : 'var(--border)'}`, background: filter === val ? 'var(--accent-light)' : 'var(--bg-card)', color: filter === val ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: filter === val ? '600' : '400', cursor: 'pointer', fontSize: '0.82rem' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(lesson => {
          const s = STATUS_MAP[lesson.status] || STATUS_MAP.planlandı;
          const Icon = s.icon;
          return (
            <div key={lesson.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: lesson.type === 'online' ? 'rgba(59,130,246,0.12)' : 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {lesson.type === 'online' ? <Video size={20} color='#2563eb' /> : <MapPin size={20} color='#7c3aed' />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem' }}>{lesson.studentName}</span>
                  {lesson.subject && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>· {lesson.subject}</span>}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  {lesson.date ? format(parseISO(lesson.date), 'd MMMM yyyy', { locale: tr }) : ''} · {lesson.startTime} – {lesson.endTime}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: s.bg, color: s.color, borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: '600', flexShrink: 0 }}>
                <Icon size={13} /> {s.label}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Henüz ders kaydı yok</p>
          </div>
        )}
      </div>

      {showModal && (
        <LessonModal students={students} defaultDate={format(new Date(), 'yyyy-MM-dd')} onClose={() => setShowModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}