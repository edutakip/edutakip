import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, BookOpen, CheckCircle, Clock, AlertCircle, Trash2, X, Pencil, Calendar, User, ChevronRight } from 'lucide-react';
import { format, parseISO, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const STATUS_CFG = {
  verildi:    { label: 'Verildi',     bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1', icon: Clock },
  tamamlandı: { label: 'Tamamlandı', bg: '#d1fae5', color: '#065f46', dot: '#10b981', icon: CheckCircle },
  gecikmiş:   { label: 'Gecikmiş',   bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', icon: AlertCircle },
};

function getDueDateLabel(dueDate) {
  if (!dueDate) return null;
  try {
    const d = parseISO(dueDate);
    if (isToday(d)) return { text: 'Bugün son gün!', color: '#dc2626', urgent: true };
    if (isTomorrow(d)) return { text: 'Yarın son gün', color: '#d97706', urgent: true };
    const diff = differenceInDays(d, new Date());
    if (diff < 0) return { text: `${Math.abs(diff)} gün geçti`, color: '#b91c1c', urgent: true };
    if (diff <= 3) return { text: `${diff} gün kaldı`, color: '#d97706', urgent: false };
    return { text: format(d, 'd MMMM yyyy', { locale: tr }), color: '#6b7280', urgent: false };
  } catch { return null; }
}

export default function TeacherHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHw, setEditingHw] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ studentId: '', title: '', description: '', dueDate: '' });
  const [me, setMe] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      const [h, s] = await Promise.all([
        base44.entities.Homework.filter({ teacherEmail: user.email }, '-created_date'),
        base44.entities.Student.filter({ teacherEmail: user.email, status: 'active' }),
      ]);
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

  // Yaramaz popup fix
  useEffect(() => {
    if (showForm) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showForm]);

  const reload = async () => {
    const h = await base44.entities.Homework.filter({ teacherEmail: me.email }, '-created_date');
    setHomeworks(h);
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

  const counts = {
    all: homeworks.length,
    verildi: homeworks.filter(h => h.status === 'verildi').length,
    tamamlandı: homeworks.filter(h => h.status === 'tamamlandı').length,
    gecikmiş: homeworks.filter(h => h.status === 'gecikmiş').length,
  };

  const filtered = homeworks.filter(h => filter === 'all' || h.status === filter);

  const inp = {
    width: '100%', background: '#f8fafc', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', padding: '0.65rem 0.875rem', fontSize: '0.875rem',
    color: '#111827', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', height: '100vh', overflowY: 'auto', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.2rem' }}>Ödevler</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            {counts.verildi} aktif · {counts.gecikmiş > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{counts.gecikmiş} gecikmiş · </span>}{counts.tamamlandı} tamamlandı
          </p>
        </div>
        <button onClick={() => { setEditingHw(null); setForm({ studentId: '', title: '', description: '', dueDate: '' }); setShowForm(true); }}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ödev Ver
        </button>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'verildi',    label: 'Aktif',        color: '#4338ca', bg: '#e0e7ff', icon: 'book' },
          { key: 'gecikmiş',   label: 'Gecikmiş',     color: '#b91c1c', bg: '#fee2e2', icon: 'alert' },
          { key: 'tamamlandı', label: 'Tamamlandı',   color: '#065f46', bg: '#d1fae5', icon: 'check' },
          { key: 'all',        label: 'Toplam Ödev',  color: '#374151', bg: '#f3f4f6', icon: 'list' },
        ].map(({ key, label, color, bg, icon }) => (
          <div key={key} onClick={() => setFilter(key)}
            style={{ background: filter === key ? bg : 'white', borderRadius: 14, padding: '1rem 1.25rem', border: `1.5px solid ${filter === key ? color + '40' : '#f1f5f9'}`, cursor: 'pointer', transition: 'all 0.15s', boxShadow: filter === key ? `0 4px 14px ${color}20` : '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              {icon === 'book' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
              {icon === 'alert' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              {icon === 'check' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              {icon === 'list' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color, lineHeight: 1 }}>{counts[key]}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '4rem 2rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 4.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 11a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 18z"/></svg></div>
          <p style={{ color: '#9ca3af', fontWeight: '600', fontSize: '1rem' }}>Ödev bulunamadı</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map(hw => {
            const cfg = STATUS_CFG[hw.status] || STATUS_CFG.verildi;
            const Icon = cfg.icon;
            const dueDateInfo = getDueDateLabel(hw.dueDate);
            const isExpanded = expandedId === hw.id;
            const student = students.find(s => s.id === hw.studentId);

            return (
              <div key={hw.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isExpanded ? cfg.dot + '40' : '#f1f5f9'}`, boxShadow: isExpanded ? `0 4px 16px ${cfg.dot}15` : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s', overflow: 'hidden' }}>

                {/* Ana satır */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : hw.id)}>

                  {/* Renkli ikon */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} />
                  </div>

                  {/* İçerik */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        <User size={11} /> {hw.studentName}
                      </span>
                      {dueDateInfo && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: dueDateInfo.color, fontWeight: dueDateInfo.urgent ? '700' : '500' }}>
                          <Calendar size={11} /> {dueDateInfo.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.7rem', borderRadius: 20, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                    {cfg.label}
                  </span>

                  <ChevronRight size={15} color="#d1d5db" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>

                {/* Genişletilmiş içerik */}
                {isExpanded && (
                  <div style={{ padding: '0.75rem 1.1rem 1rem', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                    {hw.description && (
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.85rem', lineHeight: 1.6 }}>{hw.description}</p>
                    )}
                    {student?.parentPhone && (
                      <a href={`tel:${student.parentPhone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: '600', textDecoration: 'none', marginBottom: '0.85rem' }}>
                        {student.parentPhone}
                      </a>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Durum değiştir */}
                      {hw.status !== 'tamamlandı' && (
                        <ActionBtn label="Tamamlandı" color="#059669" bg="#d1fae5" onClick={() => changeStatus(hw, 'tamamlandı')} />
                      )}
                      {hw.status === 'tamamlandı' && (
                        <ActionBtn label="Geri Al" color="#6b7280" bg="#f3f4f6" onClick={() => changeStatus(hw, 'verildi')} />
                      )}
                      {hw.status !== 'gecikmiş' && hw.status !== 'tamamlandı' && (
                        <ActionBtn label="Gecikmiş" color="#b91c1c" bg="#fee2e2" onClick={() => changeStatus(hw, 'gecikmiş')} />
                      )}
                      <div style={{ flex: 1 }} />
                      <button onClick={() => openEdit(hw)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', padding: '0.4rem 0.6rem', borderRadius: 8 }}>
                        <Pencil size={13} /> Düzenle
                      </button>
                      <button onClick={() => deleteHw(hw)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', padding: '0.4rem 0.6rem', borderRadius: 8 }}>
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '480px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease' }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{editingHw ? 'Ödevi Düzenle' : 'Ödev Ver'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color='#6b7280' />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Öğrenci</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} style={{ ...inp, appearance: 'none' }}>
                  <option value="">Öğrenci seç...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ödev Başlığı</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ödev başlığı..." style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Açıklama</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ödev detayları..." rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Son Teslim Tarihi</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inp} />
              </div>
              <button onClick={handleSave} disabled={!form.studentId || !form.title}
                style={{ background: (!form.studentId || !form.title) ? '#e5e7eb' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: (!form.studentId || !form.title) ? '#9ca3af' : 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontWeight: '800', fontSize: '0.9rem', cursor: (!form.studentId || !form.title) ? 'default' : 'pointer', marginTop: '0.25rem', transition: 'all 0.15s' }}>
                {editingHw ? 'Kaydet' : '📚 Ödev Ver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, bg, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? color : bg, border: 'none', color: hover ? 'white' : color, cursor: 'pointer', padding: '0.45rem 0.9rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}