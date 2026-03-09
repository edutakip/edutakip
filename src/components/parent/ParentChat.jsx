import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ParentChat({ student, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!student?.id) return;
    loadMessages();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.studentId === student.id) {
        setMessages(prev => {
          if (event.type === 'create') return [...prev, event.data];
          if (event.type === 'update') return prev.map(m => m.id === event.id ? event.data : m);
          if (event.type === 'delete') return prev.filter(m => m.id !== event.id);
          return prev;
        });
      }
    });
    return unsub;
  }, [student?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const msgs = await base44.entities.Message.filter({ studentId: student.id });
    setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    // Mark unread messages as read
    msgs.filter(m => !m.read && m.senderRole === 'teacher').forEach(m =>
      base44.entities.Message.update(m.id, { read: true })
    );
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await base44.entities.Message.create({
      studentId: student.id,
      studentName: student.name,
      teacherEmail: student.teacherEmail,
      parentEmail: user.email,
      senderEmail: user.email,
      senderRole: 'parent',
      content: text.trim(),
      read: false,
    });
    setText('');
    setSending(false);
  };

  const formatTime = (d) => {
    try { return format(new Date(d), 'HH:mm', { locale: tr }); } catch { return ''; }
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginTop: '1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '480px' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #1e1b4b, #2e1b6e)' }}>
        <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>
          <MessageCircle size={18} color='#a5b4fc' />
        </div>
        <div>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>Öğretmen İletişimi</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', margin: 0 }}>{student.name} için öğretmenle mesajlaş</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#f8f9ff' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', flexDirection: 'column', gap: '0.5rem' }}>
            <MessageCircle size={32} color='#d1d5db' />
            <span>Henüz mesaj yok. Öğretmeninize mesaj gönderin.</span>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderRole === 'parent';
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%', padding: '0.65rem 0.9rem', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'white',
                border: isMe ? 'none' : '1px solid var(--border)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {!isMe && (
                  <p style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: '700', margin: '0 0 0.25rem', letterSpacing: '0.3px' }}>Öğretmen</p>
                )}
                <p style={{ color: isMe ? 'white' : 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>{msg.content}</p>
                <p style={{ color: isMe ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)', fontSize: '0.68rem', margin: '0.3rem 0 0', textAlign: 'right' }}>{formatTime(msg.created_date)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', background: 'white' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Mesajınızı yazın..."
          style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '12px', border: '1.5px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', background: 'var(--bg-hover)', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: 'none', background: text.trim() && !sending ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'var(--border)', color: 'white', cursor: text.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
        >
          {sending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}