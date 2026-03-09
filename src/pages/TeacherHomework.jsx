import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, BookOpen, CheckCircle, Clock, AlertCircle, Trash2, X, Pencil } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function TeacherHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHw, setEditingHw] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ studentId: '', title: '', description: '', dueDate: '' });
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      const [h, s] = await Promise.all([
        base44.entities.Homework.filter({ teacherEmail: user.email }, '-created_date'),
        base44.entities.Student.filter({ teacherEmail: user.email, status: 'active' }),
      ]);
      // auto-mark overdue
      const now = new Date();
      const updated = h.map(hw => {
        if (hw.status === 'verildi' && hw.dueDate && isPast(new Date(hw.dueDate + 'T23:59:59'))) {
          return { ...hw, status: 'gecikmiş' };
        }
        return hw;
      });
      setHomeworks(updated);
      setStudents(s);
    })();
  }, []);

  const reload = async () => {
    const h = await base44.entities.Homework.filter({ teacherEmail: me.email }, '-created_date');
    setHomeworks(h);
  };

  const handleAdd = async () => {
    if (!form.studentId || !form.title) return;
    const student = students.find(s => s.id === form.studentId);
    await base44.entities.Homework.create({
      ...form,
      studentName: student?.name || '',
      teacherEmail: me.email,
      status: 'verildi',
    });
    setForm({ studentId: '', title: '', description: '', dueDate: '' });
    setShowForm(false);
    reload();
  };

  const changeStatus = async (hw, status) => {
    await base44.entities.Homework.update(hw.id, { status });
    reload();
  };

  const deleteHw = async (hw) => {
    await base44.entities.Homework.delete(hw.id);
    reload();
  };

  const openEdit = (hw) => {
    setEditingHw(hw);
    setForm({ studentId: hw.studentId, title: hw.title, description: hw.description || '', dueDate: hw.dueDate || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.studentId || !form.title) return;
    const student = students.find(s => s.id === form.studentId);
    if (editingHw) {
      await base44.entities.Homework.update(editingHw.id, { ...form, studentName: student?.name || editingHw.studentName });
    } else {
      await base44.entities.Homework.create({ ...form, studentName: student?.name || '', teacherEmail: me.email, status: 'verildi' });
    }
    setForm({ studentId: '', title: '', description: '', dueDate: '' });
    setEditingHw(null);
    setShowForm(false);
    reload();
  };

  const statusCfg = {
    verildi: { label: 'Verildi', bg: '#e0e7ff', color: '#4338ca', icon: Clock },
    tamamlandı: { label: 'Tamamlandı', bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
    gecikmiş: { label: 'Gecikmiş', bg: '#fee2e2', color: '#b91c1c', icon: AlertCircle },
  };

  const filtered = homeworks.filter(h => filter === 'all' || h.status === filter);

  const inp = { width: '100%', background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '0.65rem 0.875rem', fontSize: '0.875rem', color: '#111827', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  const counts = { all: homeworks.length, verildi: homeworks.filter(h => h.status === 'verildi').length, tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length, gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>Ödevler</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{homeworks.length} ödev toplam</p>
        </div>
        <button onClick={() => { setEditingHw(null); setForm({ studentId: '', title: '', description: '', dueDate: '' }); setShowForm(true); }}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.65rem 1.3rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ödev Ver
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', 'Tümü'], ['verildi', 'Verildi'], ['tamamlandı', 'Tamamlandı'], ['gecikmiş', 'Gecikmiş']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', border: filter === val ? 'none' : '1.5px solid #e5e7eb', background: filter === val ? '#4f46e5' : 'white', color: filter === val ? 'white' : '#6b7280' }}>
            {label} ({counts[val]})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#9ca3af', border: '1px solid #f1f5f9' }}>
          <BookOpen size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>Ödev bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(hw => {
            const cfg = statusCfg[hw.status] || statusCfg.verildi;
            const Icon = cfg.icon;
            let dueDateStr = '';
            try { dueDateStr = hw.dueDate ? format(parseISO(hw.dueDate), 'd MMMM yyyy', { locale: tr }) : ''; } catch {}
            return (
              <div key={hw.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{hw.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>{hw.studentName}</span>
                    {hw.created_date && <span>· Verildi: {format(new Date(hw.created_date), 'd MMM yyyy', { locale: tr })}</span>}
                    {dueDateStr && <span>· Teslim: {dueDateStr}</span>}
                  </div>
                  {hw.description && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.3rem' }}>{hw.description}</div>}
                </div>
                <select value={hw.status} onChange={e => changeStatus(hw, e.target.value)}
                  style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.5rem', borderRadius: '8px', background: cfg.bg, color: cfg.color, border: 'none', cursor: 'pointer', flexShrink: 0, outline: 'none', fontFamily: 'Inter, sans-serif' }}>
                  <option value="verildi">Verildi</option>
                  <option value="tamamlandı">Tamamlandı</option>
                  <option value="gecikmiş">Gecikmiş</option>
                </select>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => openEdit(hw)} title="Düzenle"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: '#9ca3af' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteHw(hw)} title="Sil"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: '#d1d5db' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '480px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{editingHw ? 'Ödevi Düzenle' : 'Ödev Ver'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color='#6b7280' />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem' }}>ÖĞRENCİ</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} style={{ ...inp, appearance: 'none' }}>
                  <option value="">Öğrenci seç...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem' }}>ÖDEV BAŞLIĞI</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ödev başlığı..." style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem' }}>AÇIKLAMA</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ödev detayları..." rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem' }}>SON TESLİM TARİHİ</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inp} />
              </div>
              <button onClick={handleSave} disabled={!form.studentId || !form.title}
                style={{ background: (!form.studentId || !form.title) ? '#e5e7eb' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: (!form.studentId || !form.title) ? '#9ca3af' : 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: '800', fontSize: '0.9rem', cursor: (!form.studentId || !form.title) ? 'default' : 'pointer', marginTop: '0.25rem' }}>
                {editingHw ? 'Kaydet' : 'Ödev Ver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}