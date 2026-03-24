import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, RefreshCw } from 'lucide-react';
import StudentCard from '../components/teacher/StudentCard';
import AddStudentModal from '../components/teacher/AddStudentModal';
import PaymentModal from '../components/teacher/PaymentModal';
import StudentDetailModal from '../components/teacher/StudentDetailModal';

function useWindowWidth() {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [payStudent, setPayStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [fabPulsing, setFabPulsing] = useState(true);

  const width = useWindowWidth();
  const isMobile = width < 1024;

  useEffect(() => { loadStudents(); }, []);

  // FAB pulse animasyonu: 3 saniye sonra dur
  useEffect(() => {
    const t = setTimeout(() => setFabPulsing(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const loadStudents = async () => {
    const me = await base44.auth.me();
    const all = await base44.entities.Student.filter({ teacherEmail: me.email });
    setStudents(all);
  };

  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem', background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative' }}>

      {/* Pulse animasyonu için keyframes */}
      <style>{`
        @keyframes fab-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes fab-in {
          from { opacity: 0; transform: scale(0.5) rotate(-90deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .fab-btn {
          animation: fab-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .fab-btn.pulsing {
          animation: fab-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     fab-pulse 1.2s ease-out 0.4s 2;
        }
        .fab-btn:active {
          transform: scale(0.92) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', marginBottom: '0.3rem' }}>Öğrencilerim</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tüm öğrencilerinizi ve ders durumlarını buradan yönetin.</p>
        </div>

        {/* Masaüstü/tablet: header'daki buton */}
        {!isMobile && (
          <button onClick={() => setShowAdd(true)}
            style={{ background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Öğrenci Ekle
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Öğrenci ara...'
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ v: 'active', l: 'Aktif' }, { v: 'archived', l: 'Arşivlenmiş' }, { v: 'all', l: 'Tümü' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid', borderColor: filter === v ? 'var(--accent)' : 'var(--border)', background: filter === v ? 'var(--accent-light)' : 'transparent', color: filter === v ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={loadStudents} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map(s => (
          <StudentCard key={s.id} student={s} onAddPayment={() => setPayStudent(s)} onCardClick={() => setDetailStudent(s)} />
        ))}

        {/* Masaüstü/tablet: grid içindeki "Yeni Öğrenci Ekle" kutusu */}
        {!isMobile && (
          <div onClick={() => setShowAdd(true)}
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
              border: '2px dashed rgba(99,102,241,0.4)',
              borderRadius: '18px',
              padding: '1.25rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: '0.75rem',
              minHeight: '200px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.8)'; e.currentTarget.style.background = 'linear-gradient(145deg, #1e1b4b, #16213e)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'linear-gradient(145deg, #1a1a2e, #16213e)'; }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color='#818cf8' />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: '600' }}>Yeni Öğrenci Ekle</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Tıkla ve ekle</span>
          </div>
        )}
      </div>

      {/* Mobil: sağ üstte FAB butonu (sayfanın position:relative içinde, fixed değil — Layout'un nav'ıyla çakışmasın) */}
      {isMobile && (
        <button
          className={`fab-btn${fabPulsing ? ' pulsing' : ''}`}
          onClick={() => setShowAdd(true)}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 200,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(79,70,229,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,70,229,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.5)'; }}
        >
          <Plus size={22} color="white" strokeWidth={2.5} />
        </button>
      )}

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onSaved={loadStudents} />}
      {payStudent && <PaymentModal student={payStudent} onClose={() => setPayStudent(null)} onSaved={loadStudents} />}
      {detailStudent && <StudentDetailModal student={detailStudent} onClose={() => setDetailStudent(null)} onSaved={loadStudents} />}
    </div>
  );
}
