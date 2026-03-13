import React, { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';

export default function WhatsAppMessageModal({ phone, message: initialMessage, onClose }) {
  const [message, setMessage] = useState(initialMessage);

  const handleSend = () => {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('0') ? '90' + cleaned.slice(1) : cleaned;
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.65)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} color='#16a34a' />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', margin: 0 }}>WhatsApp Mesajı</h3>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{phone}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: '700', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mesajı Düzenle
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: '1.6', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#25d366'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
            Vazgeç
          </button>
          <button onClick={handleSend} disabled={!message.trim()} style={{ flex: 2, padding: '0.7rem', borderRadius: '10px', border: 'none', background: '#25d366', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: !message.trim() ? 0.6 : 1 }}>
            <Send size={15} /> WhatsApp ile Gönder
          </button>
        </div>
      </div>
    </div>
  );
}