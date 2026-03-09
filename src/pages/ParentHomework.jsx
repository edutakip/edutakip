import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ParentHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [noteHwId, setNoteHwId] = useState(null);
  const [note, setNote] = useState('');

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
      const h = await base44.entities.Homework.filter({ studentId: s.id }, '-created_date');
      setHomeworks(h);
      setLoading(false);
    })();
  }, []);

  const submitNote = async (hw) => {
    await base44.entities.Homework.update(hw.id, { parentNote: note });
    setNoteHwId(null);
    setNote('');
    const h = await base44.entities.Homework.filter({ studentId: student.id }, '-created_date');
    setHomeworks(h);
  };

  const statusCfg = {
    verildi: { label: 'Yapılacak', bg: '#e0e7ff', color: '#4338ca', icon: Clock },
    tamamlandı: { label: 'Tamamlandı', bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
    gecikmiş: { label: 'Gecikmiş', bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
  };

  const filtered = homeworks.filter(h => filter === 'all' || h.status === filter);
  const counts = { all: homeworks.length, verildi: homeworks.filter(h => h.status === 'verildi').length, tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length, gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!student) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9ca3af', flexDirection: 'column', gap: '0.75rem' }}>
      <AlertCircle size={40} style={{ opacity: 0.4 }} />
      <p>Bağlı öğrenci bulunamadı.</p>
    </div>
  );

  return (
    <div style={{ padding: '1rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', marginBottom: '0.2rem' }}>Ödevler</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{student.name} · {homeworks.length} ödev</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['verildi', 'Yapılacak'], ['tamamlandı', 'Tamamlandı'], ['gecikmiş', 'Gecikmiş']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: filter === val ? 'none' : '1.5px solid #e5e7eb', background: filter === val ? '#4f46e5' : 'white', color: filter === val ? 'white' : '#6b7280' }}>
            {label} ({counts[val]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>Ödev bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map(hw => {
            const cfg = statusCfg[hw.status] || statusCfg.verildi;
            const Icon = cfg.icon;
            let dueDateStr = '';
            try { dueDateStr = hw.dueDate ? format(parseISO(hw.dueDate), 'd MMMM yyyy', { locale: tr }) : ''; } catch {}
            const isEditingNote = noteHwId === hw.id;
            return (
              <div key={hw.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.85rem' }}>{hw.title}</div>
                    {hw.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{hw.description}</div>}
                    {dueDateStr && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>Son Tarih: {dueDateStr}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '6px', background: cfg.bg, color: cfg.color' }}>
                      {cfg.label}
                    </span>
                    <button onClick={() => { setNoteHwId(isEditingNote ? null : hw.id); setNote(hw.parentNote || ''); }}
                      title="Not ekle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '0.2rem' }}>
                      <MessageSquare size={14} color={hw.parentNote ? '#6366f1' : '#d1d5db'} />
                    </button>
                  </div>
                </div>
                {hw.parentNote && !isEditingNote && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.75rem 1.25rem', background: '#fafafe', fontSize: '0.82rem', color: '#6366f1' }}>
                    💬 {hw.parentNote}
                  </div>
                )}
                {isEditingNote && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem', background: '#fafafe', display: 'flex', gap: '0.5rem' }}>
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notunuzu yazın..."
                      style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.82rem', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                    <button onClick={() => submitNote(hw)}
                      style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                      Kaydet
                    </button>
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