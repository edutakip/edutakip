import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageCircle } from 'lucide-react';

export default function TeacherMessages() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [me, setMe] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      setMe(user);
      const all = await base44.entities.Student.filter({ teacherEmail: user.email, status: 'active' });
      setStudents(all);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    loadMessages();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.studentId === selectedStudent.id) {
        loadMessages();
      }
    });
    return unsub;
  }, [selectedStudent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const msgs = await base44.entities.Message.filter({ studentId: selectedStudent.id });
    msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(msgs);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !me) return;
    await base44.entities.Message.create({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      teacherEmail: me.email,
      parentEmail: selectedStudent.parentEmail || '',
      senderEmail: me.email,
      senderRole: 'teacher',
      content: newMsg.trim(),
    });
    setNewMsg('');
    loadMessages();
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Student List */}
      <div style={{ width: '280px', flexShrink: 0, background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>Veli İletişim</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>Öğrenci velileriyle mesajlaşın</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {students.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aktif öğrenci yok</div>
          )}
          {students.map(s => (
            <div key={s.id} onClick={() => setSelectedStudent(s)}
              style={{
                padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                background: selectedStudent?.id === s.id ? 'var(--accent-light)' : 'transparent',
                borderLeft: selectedStudent?.id === s.id ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {s.parentName || 'Veli bilgisi yok'} · {s.grade || ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {!selectedStudent ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
          <MessageCircle size={48} strokeWidth={1} />
          <p style={{ fontWeight: '600', fontSize: '1rem' }}>Bir öğrenci seçin</p>
          <p style={{ fontSize: '0.85rem' }}>Sol taraftan öğrenci seçerek veli ile mesajlaşmaya başlayın</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--accent)', fontSize: '0.9rem', flexShrink: 0 }}>
              {selectedStudent.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedStudent.parentName || 'Veli'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedStudent.name} · {selectedStudent.parentEmail || 'E-posta yok'}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                Henüz mesaj yok. İlk mesajı gönderin!
              </div>
            )}
            {messages.map((msg, i) => {
              const isTeacher = msg.senderRole === 'teacher';
              const showDate = i === 0 || formatDate(messages[i-1].created_date) !== formatDate(msg.created_date);
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                      <span style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(msg.created_date)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isTeacher ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isTeacher ? 'var(--accent)' : 'white',
                      color: isTeacher ? 'white' : 'var(--text-primary)',
                      borderRadius: isTeacher ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '0.65rem 0.9rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>{msg.content}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', opacity: 0.6, textAlign: 'right' }}>{formatTime(msg.created_date)}</p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Mesajınızı yazın..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid var(--border)', borderRadius: '12px',
                padding: '0.65rem 0.9rem', fontSize: '0.875rem', fontFamily: 'inherit',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-primary)',
                maxHeight: '120px', overflowY: 'auto',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={sendMessage} disabled={!newMsg.trim()}
              style={{
                background: newMsg.trim() ? 'var(--accent)' : 'var(--border)',
                border: 'none', borderRadius: '12px', padding: '0.65rem 1rem',
                cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0,
              }}>
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}