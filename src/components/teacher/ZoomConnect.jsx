import React from 'react';
import { Video, CheckCircle, Info } from 'lucide-react';

export default function ZoomConnect() {
  return (
    <div style={{
      background: 'white', borderRadius: 18, padding: '1.5rem',
      border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Video size={17} color='#2D8CFF' />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem', margin: 0 }}>Zoom Entegrasyonu</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.1rem 0 0' }}>Online derslerde otomatik Zoom linki oluştur</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', border: '1.5px solid #bbf7d0' }}>
        <CheckCircle size={18} color='#10b981' />
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', margin: 0 }}>Zoom entegrasyonu aktif ✓</p>
          <p style={{ fontSize: '0.75rem', color: '#6ee7b7', margin: '0.1rem 0 0' }}>Online ders oluşturduğunuzda otomatik Zoom linki üretilir</p>
        </div>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Info size={13} color='#6366f1' style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Zoom entegrasyonu <strong>Server-to-Server OAuth</strong> ile çalışır. Credentials'larınız güvenli şekilde sistem tarafından saklanır.</span>
        </div>
        📹 Ders oluşturulduğunda otomatik Zoom toplantısı açılır<br />
        🔗 Toplantı linki velilere WhatsApp ile iletilebilir<br />
        ⚡ Sorun olursa otomatik olarak Jitsi'ye geçilir
      </div>
    </div>
  );
}