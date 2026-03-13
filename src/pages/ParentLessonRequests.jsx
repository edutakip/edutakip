import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const REQUEST_TYPES = ['İptal Talebi', 'Erteleme Talebi', 'Saat Değişikliği', 'Konu Değişikliği', 'Diğer'];

export default function ParentLessonRequests() {
  const [student, setStudent] = useState(null);
  const [type, setType] = useState(REQUEST_TYPES[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) setStudent(all[0]);
    });
  }, []);

  const handleSend = async () => {
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
    setMessage('');
  };

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to={createPageUrl('ParentDashboard')} style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>Ders Talebi</h1>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <CheckCircle size={48} color='#10b981' style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', marginBottom: '0.5rem' }}>Talebiniz İletildi</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Öğretmeniniz en kısa sürede size ulaşacak.</p>
          <button onClick={() => setSent(false)}
            style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
            Yeni Talep Gönder
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Talep Türü</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {REQUEST_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1.5px solid', borderColor: type === t ? 'var(--accent)' : 'var(--border)', background: type === t ? 'var(--accent-light)' : 'transparent', color: type === t ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Mesajınız</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
              placeholder="Talebinizi açıklayın..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
          </div>

          <button onClick={handleSend} disabled={sending || !message.trim()}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (sending || !message.trim()) ? 0.6 : 1 }}>
            <Send size={16} /> {sending ? 'Gönderiliyor...' : 'Talebi Gönder'}
          </button>
        </div>
      )}
    </div>
  );
}