import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentModal({ student, onClose, onSaved }) {
  const [form, setForm] = useState({
    amount: student?.monthlyFee || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'alındı', method: 'nakit', description: '', month: format(new Date(), 'yyyy-MM'),
  });
  const [loading, setLoading] = useState(false);
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    await base44.entities.Payment.create({
      ...form, amount: Number(form.amount),
      studentId: student.id, studentName: student.name,
      teacherEmail: me.email,
    });
    setLoading(false); onSaved(); onClose();
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' };
  const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>Ödeme Ekle</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Tutar (₺)</label>
              <input style={inputStyle} type='number' placeholder='0' value={form.amount} onChange={e => u('amount', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Tarih</label>
              <input style={inputStyle} type='date' value={form.date} onChange={e => u('date', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Durum</label>
              <select style={inputStyle} value={form.status} onChange={e => u('status', e.target.value)}>
                <option value='alındı'>Alındı</option>
                <option value='bekliyor'>Bekliyor</option>
                <option value='gecikmiş'>Gecikmiş</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Yöntem</label>
              <select style={inputStyle} value={form.method} onChange={e => u('method', e.target.value)}>
                <option value='nakit'>Nakit</option>
                <option value='havale'>Havale</option>
                <option value='diğer'>Diğer</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Açıklama</label>
            <input style={inputStyle} placeholder='Açıklama...' value={form.description} onChange={e => u('description', e.target.value)} />
          </div>
          <button onClick={save} disabled={loading || !form.amount}
            style={{ padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', opacity: (!form.amount || loading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 size={16} /> Kaydediliyor...</> : 'Ödeme Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}