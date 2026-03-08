import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2 } from 'lucide-react';

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function AddStudentModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', phone: '', grade: '', subject: '', weeklyLessons: 1, monthlyFee: '', parentName: '', parentEmail: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) return;
    setLoading(true);
    const me = await base44.auth.me();
    await base44.entities.Student.create({
      ...form, monthlyFee: Number(form.monthlyFee) || 0,
      weeklyLessons: Number(form.weeklyLessons),
      teacherEmail: me.email,
      inviteCode: generateCode(),
      inviteAccepted: false, status: 'active',
    });
    setLoading(false);
    onSaved(); onClose();
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' };
  const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const fieldGroups = [
    { fields: [{ k: 'name', label: 'Öğrenci Adı Soyadı *', placeholder: 'Ad Soyad', full: true }] },
    { fields: [{ k: 'phone', label: 'Telefon', placeholder: '05XX...' }, { k: 'grade', label: 'Sınıf', placeholder: '9. Sınıf' }] },
    { fields: [{ k: 'subject', label: 'Ders Konusu', placeholder: 'Matematik, Fizik...' }, { k: 'weeklyLessons', label: 'Haftalık Ders', placeholder: '1', type: 'number' }] },
    { fields: [{ k: 'monthlyFee', label: 'Aylık Ücret (₺)', placeholder: '2000', type: 'number', full: true }] },
    { fields: [{ k: 'parentName', label: 'Veli Adı', placeholder: 'Veli adı soyadı' }, { k: 'parentEmail', label: 'Veli E-posta', placeholder: 'veli@mail.com' }] },
    { fields: [{ k: 'notes', label: 'Notlar', placeholder: 'Öğrenci hakkında notlar...', full: true, multiline: true }] },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700' }}>Yeni Öğrenci Ekle</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fieldGroups.map((group, gi) => (
            <div key={gi} style={{ display: 'grid', gridTemplateColumns: group.fields[0]?.full ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {group.fields.map(({ k, label, placeholder, type, multiline }) => (
                <div key={k}>
                  <label style={labelStyle}>{label}</label>
                  {multiline
                    ? <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} placeholder={placeholder} value={form[k]} onChange={e => u(k, e.target.value)} />
                    : <input style={inputStyle} type={type || 'text'} placeholder={placeholder} value={form[k]} onChange={e => u(k, e.target.value)} />
                  }
                </div>
              ))}
            </div>
          ))}
          <button onClick={save} disabled={loading || !form.name}
            style={{ padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', opacity: (!form.name || loading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 size={16} /> Ekleniyor...</> : 'Öğrenci Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}