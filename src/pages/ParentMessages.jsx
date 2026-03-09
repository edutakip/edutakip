import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ParentMessages() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const students = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (students.length > 0) {
        setStudent(students[0]);
        const msgs = await base44.entities.Message.filter({ studentId: students[0].id });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));

        const unsubscribe = base44.entities.Message.subscribe((event) => {
          if (event.data?.studentId === students[0].id) {
            setMessages(prev => {
              if (event.type === 'create') return [...prev, event.data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
              if (event.type === 'update') return prev.map(m => m.id === event.id ? event.data : m);
              if (event.type === 'delete') return prev.filter(m => m.id !== event.id);
              return prev;
            });
          }
        });
        return () => unsubscribe();
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !student || !user) return;
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

  if (!student) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Bağlı öğrenci bulunamadı.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1rem', margin: 0 }}>
          {student.name} — Öğretmen İletişimi
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{student.teacherEmail}</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
            Henüz mesaj yok. İlk mesajı siz gönderin!
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.senderRole === 'parent';
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                background: isMe ? 'var(--accent)' : 'var(--bg-card)',
                color: isMe ? 'white' : 'var(--text-primary)',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '0.7rem 1rem',
                border: isMe ? 'none' : '1px solid var(--border)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {!isMe && (
                  <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.3rem' }}>Öğretmen</p>
                )}
                <p style={{ fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>{msg.content}</p>
                <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem', textAlign: 'right' }}>
                  {msg.created_date && format(new Date(msg.created_date), 'd MMM HH:mm', { locale: tr })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Mesajınızı yazın..."
          style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={sending || !text.trim()}
          style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sending || !text.trim() ? 0.5 : 1, flexShrink: 0 }}>
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}