import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, CheckCircle } from 'lucide-react';

const REQUEST_TYPES = ['İptal Talebi', 'Erteleme Talebi', 'Saat Değişikliği', 'Konu Değişikliği', 'Diğer'];

export default function LessonRequestModal({ student, onClose }) {
  const [type, setType] = useState(REQUEST_TYPES[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    console.log(message);
    if (!message.trim() || !student) return;
    setSending(true);
    await base44.entities.Message.create({
      studentId: student.id,
      studentName: student.name,
      teacherEmail: student.teacherEmail,
      parentEmail: student.parentEmail,
      senderEmail: student.parentEmail,
      senderRole: 'parent',
      content: `[${type}] ${message}`,
      read: false,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '0' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '600px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)', animation: 'slideUp 0.25s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Handle bar */}
        <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#e5e7eb', margin: '0 auto 1.25rem' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: '#111827', fontWeight: '800', fontSize: '1.1rem' }}>Ders Talebi</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.1rem' }}>Öğretmeninize talep gönderin</p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={28} color='#10b981' />
            </div>
            <h3 style={{ color: '#111827', fontWeight: '800', marginBottom: '0.4rem' }}>Talebiniz İletildi!</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Öğretmeniniz en kısa sürede size ulaşacak.</p>
            <button onClick={onClose}
              style={{ padding: '0.65rem 2rem', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
              Kapat
            </button>
          </div>
        ) : (
          <>
            {/* Type selector */}
            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{ color: '#374151', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Talep Türü</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {REQUEST_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', border: '1.5px solid', borderColor: type === t ? '#4f46e5' : '#e5e7eb', background: type === t ? '#eef2ff' : 'white', color: type === t ? '#4f46e5' : '#6b7280', fontWeight: '600', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{ color: '#374151', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mesajınız</p>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder="Talebinizi açıklayın..."
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>

            <button onClick={handleSend} disabled={sending || !message.trim()}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', background: message.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb', color: message.trim() ? 'white' : '#9ca3af', fontWeight: '700', fontSize: '0.95rem', cursor: message.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s', boxShadow: message.trim() ? '0 4px 14px rgba(79,70,229,0.35)' : 'none' }}>
              <Send size={16} /> {sending ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}