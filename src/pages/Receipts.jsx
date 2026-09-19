import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Receipt, ChevronDown, Search, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import PaymentReceiptModal from '../components/teacher/PaymentReceiptModal';

const COLORS = ['#6366f1', '#f97316', '#10b981', '#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#14b8a6'];

export default function Receipts() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const isMobile = windowWidth < 640;

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const [s, p] = await Promise.all([
        base44.entities.Student.filter({ teacherEmail: me.email, status: 'active' }),
        base44.entities.Payment.filter({ teacherEmail: me.email, status: 'alındı' }),
      ]);
      setStudents(s);
      setPayments(p);
    } catch (e) {
      console.error('Receipts load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const filteredPayments = payments
    .filter(p => !selectedStudentId || p.studentId === selectedStudentId)
    .filter(p => !search || (p.studentName || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateStr) => {
    try { return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr }); } catch { return dateStr; }
  };

  const methodLabel = { nakit: 'Nakit', havale: 'Havale/EFT', diger: 'Diğer' };

  const card = { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ padding: isMobile ? '0.9rem' : '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt size={28} color="#4f46e5" /> Makbuzlar
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Öğrenci seçip oluşturulmuş ödeme makbuzlarını görüntüleyin</p>
        </div>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '12px', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#4f46e5'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
          <RefreshCw size={15} /> Yenile
        </button>
      </div>

      {/* Student selector + search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Student dropdown */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <button onClick={() => setShowStudentDropdown(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '12px', background: 'white', border: '1.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => { if (!showStudentDropdown) e.currentTarget.style.borderColor = '#e5e7eb'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: selectedStudent ? '#eef2ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: selectedStudent ? '#4f46e5' : '#9ca3af' }}>
                {selectedStudent ? selectedStudent.name[0] : 'T'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>Öğrenci</div>
                <div style={{ fontSize: '0.88rem', color: '#111827', fontWeight: 700 }}>{selectedStudent ? selectedStudent.name : 'Tüm Öğrenciler'}</div>
              </div>
            </div>
            <ChevronDown size={18} color="#9ca3af" style={{ transform: showStudentDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {showStudentDropdown && (
            <>
              <div onClick={() => setShowStudentDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 320, overflowY: 'auto' }}>
                <button onClick={() => { setSelectedStudentId(''); setShowStudentDropdown(false); }}
                  style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: !selectedStudentId ? '#eef2ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = !selectedStudentId ? '#eef2ff' : 'white'}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>T</div>
                  Tüm Öğrenciler
                </button>
                {students.map((s, i) => (
                  <button key={s.id} onClick={() => { setSelectedStudentId(s.id); setShowStudentDropdown(false); }}
                    style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: selectedStudentId === s.id ? '#eef2ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedStudentId === s.id ? '#eef2ff' : 'white'}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS[i % COLORS.length] + '22', border: `2px solid ${COLORS[i % COLORS.length]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: COLORS[i % COLORS.length], fontWeight: 800 }}>{s.name[0]}</div>
                    {s.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Öğrenci ara..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', background: 'white', border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none' }}
          />
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ ...card, flex: '1 1 160px', padding: '1rem 1.25rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Toplam Makbuz</p>
          <p style={{ color: '#111827', fontSize: '1.5rem', fontWeight: '800', margin: '0.2rem 0 0' }}>{filteredPayments.length}</p>
        </div>
        <div style={{ ...card, flex: '1 1 160px', padding: '1rem 1.25rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Toplam Tutar</p>
          <p style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: '800', margin: '0.2rem 0 0' }}>₺{filteredPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Receipts list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '700', marginBottom: '0.3rem' }}>Makbuz bulunamadı</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            {selectedStudent ? 'Bu öğrenci için alınmış ödeme yok.' : 'Henüz alınmış ödeme yok.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
          {filteredPayments.map((p, i) => {
            const student = students.find(s => s.id === p.studentId);
            const colorIdx = students.findIndex(s => s.id === p.studentId);
            const color = COLORS[(colorIdx >= 0 ? colorIdx : i) % COLORS.length];
            return (
              <div key={p.id} onClick={() => setSelectedReceipt({ payment: p, student })}
                style={{ ...card, cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${color}` }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: color + '22', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: color }}>
                      {(p.studentName || '?')[0]}
                    </div>
                    <div>
                      <div style={{ color: '#111827', fontWeight: '700', fontSize: '0.88rem' }}>{p.studentName || '-'}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{formatDate(p.date)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#eef2ff', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                    <Receipt size={13} color="#4f46e5" />
                    <span style={{ color: '#4f46e5', fontSize: '0.68rem', fontWeight: 700 }}>Makbuz</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.68rem' }}>{methodLabel[p.method] || p.method || '-'}</span>
                    {p.description && <span style={{ color: '#6b7280', fontSize: '0.72rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</span>}
                  </div>
                  <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '1.05rem' }}>₺{(p.amount || 0).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          payment={selectedReceipt.payment}
          student={selectedReceipt.student || {}}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}