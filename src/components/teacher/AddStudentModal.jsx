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

  const inp = { width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.15s' };
  const lbl = { fontSize: '0.72rem', color: '#6b7280', fontWeight: '700', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  const fieldGroups = [
    { fields: [{ k: 'name', label: 'Öğrenci Adı Soyadı *', placeholder: 'Ad Soyad', full: true }] },
    { fields: [{ k: 'phone', label: 'Telefon', placeholder: '05XX...' }, { k: 'grade', label: 'Sınıf', placeholder: '9. Sınıf' }] },
    { fields: [{ k: 'subject', label: 'Ders Konusu', placeholder: 'Matematik, Fizik...' }, { k: 'weeklyLessons', label: 'Haftalık Ders', placeholder: '1', type: 'number' }] },
    { fields: [{ k: 'monthlyFee', label: 'Aylık Ücret (₺)', placeholder: '2000', type: 'number', full: true }] },
    { fields: [{ k: 'parentName', label: 'Veli Adı', placeholder: 'Veli adı soyadı' }, { k: 'parentEmail', label: 'Veli E-posta', placeholder: 'veli@mail.com' }] },
    { fields: [{ k: 'notes', label: 'Notlar', placeholder: 'Öğrenci hakkında notlar...', full: true, multiline: true }] },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e5e7eb', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '1.2rem', fontWeight: '800' }}>Yeni Öğrenci Ekle</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.1rem' }}>Öğrenci bilgilerini doldurun</p>
          </div>
          <button onClick={onClose}
            style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fieldGroups.map((group, gi) => (
            <div key={gi} style={{ display: 'grid', gridTemplateColumns: group.fields[0]?.full ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              {group.fields.map(({ k, label, placeholder, type, multiline }) => (
                <div key={k}>
                  <label style={lbl}>{label}</label>
                  {multiline
                    ? <textarea style={{ ...inp, resize: 'vertical', minHeight: '70px' }} placeholder={placeholder} value={form[k]} onChange={e => u(k, e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#4f46e5'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    : <input style={inp} type={type || 'text'} placeholder={placeholder} value={form[k]} onChange={e => u(k, e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#4f46e5'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  }
                </div>
              ))}
            </div>
          ))}
          <button onClick={save} disabled={loading || !form.name}
            style={{ padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', opacity: (!form.name || loading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
            {loading ? <><Loader2 size={16} className='animate-spin' /> Ekleniyor...</> : 'Öğrenci Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}