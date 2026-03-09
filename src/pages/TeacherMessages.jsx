import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Search, MessageCircle, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';

export default function TeacherMessages() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState('');
  const [lastMessages, setLastMessages] = useState({});
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
      if (event.data?.studentId === selectedStudent.id) loadMessages();
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
    if (msgs.length > 0) {
      setLastMessages(prev => ({ ...prev, [selectedStudent.id]: msgs[msgs.length - 1] }));
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !me) return;
    const content = newMsg.trim();
    setNewMsg('');
    await base44.entities.Message.create({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      teacherEmail: me.email,
      parentEmail: selectedStudent.parentEmail || '',
      senderEmail: me.email,
      senderRole: 'teacher',
      content,
    });
    loadMessages();
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => {
    const today = new Date(); const date = new Date(d);
    if (date.toDateString() === today.toDateString()) return 'Bugün';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Dün';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.parentName || '').toLowerCase().includes(search.toLowerCase())
  );

  const avatar = (name, size = 40, bg = '#25D366') => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: size * 0.38, flexShrink: 0 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0c29', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0f0c29', borderRight: '1px solid rgba(99,102,241,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {avatar(me?.full_name || 'T', 40, '#6366f1')}
            <div>
              <p style={{ color: '#e9edef', fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>{me?.full_name || 'Öğretmen'}</p>
              <p style={{ color: '#8696a0', fontSize: '0.72rem', margin: 0 }}>Veli İletişim</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', color: '#aebac1' }}><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0.6rem 0.75rem', background: '#0f0c29' }}>
          <div style={{ background: '#1e1b4b', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.9rem' }}>
            <Search size={16} color='#8696a0' />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Ara veya yeni sohbet başlat'
              style={{ background: 'none', border: 'none', outline: 'none', color: '#e9edef', fontSize: '0.875rem', flex: 1 }} />
          </div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredStudents.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8696a0', fontSize: '0.85rem' }}>
              {search ? 'Sonuç bulunamadı' : 'Aktif öğrenci yok'}
            </div>
          )}
          {filteredStudents.map(s => {
            const last = lastMessages[s.id];
            const isSelected = selectedStudent?.id === s.id;
            return (
              <div key={s.id} onClick={() => setSelectedStudent(s)}
                style={{ padding: '0.7rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem', background: isSelected ? 'rgba(99,102,241,0.18)' : 'transparent', borderBottom: '1px solid rgba(99,102,241,0.1)', borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                {avatar(s.parentName || s.name, 48, getColor(s.id))}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#e9edef', fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.parentName || 'Veli'}</span>
                    {last && <span style={{ color: '#8696a0', fontSize: '0.7rem', flexShrink: 0 }}>{formatTime(last.created_date)}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                    <span style={{ color: '#8696a0', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {last ? last.content : <span style={{ fontStyle: 'italic' }}>{s.name} · {s.grade || ''}</span>}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      {!selectedStudent ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.25rem', background: '#13103a' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={36} color='#6366f1' strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>EduTrack Mesajlaşma</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>Sol taraftan bir öğrenci seçin</p>
          </div>
          <div style={{ width: '200px', height: '1px', background: 'rgba(99,102,241,0.2)' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔒 Mesajlarınız güvende
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0b2e', overflow: 'hidden', position: 'relative' }}>

          {/* Chat wallpaper pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ padding: '0.7rem 1.25rem', background: '#202c33', display: 'flex', alignItems: 'center', gap: '0.85rem', zIndex: 1 }}>
            {avatar(selectedStudent.parentName || selectedStudent.name, 40, getColor(selectedStudent.id))}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#e9edef', fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>{selectedStudent.parentName || 'Veli'}</p>
              <p style={{ color: '#8696a0', fontSize: '0.75rem', margin: 0 }}>{selectedStudent.name} · {selectedStudent.parentEmail || 'E-posta yok'}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', color: '#aebac1' }}><Search size={20} /></button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', color: '#aebac1' }}><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 5%', display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative', zIndex: 1 }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <div style={{ background: '#182229', borderRadius: '12px', padding: '0.6rem 1.25rem', display: 'inline-block' }}>
                  <span style={{ color: '#8696a0', fontSize: '0.8rem' }}>🔒 Mesajlar uçtan uca şifreli</span>
                </div>
                <p style={{ color: '#8696a0', fontSize: '0.85rem', marginTop: '1.5rem' }}>Henüz mesaj yok. İlk mesajı siz başlatın!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isTeacher = msg.senderRole === 'teacher';
              const showDate = i === 0 || formatDate(messages[i - 1].created_date) !== formatDate(msg.created_date);
              const showAvatar = !isTeacher && (i === messages.length - 1 || messages[i + 1]?.senderRole === 'teacher');
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                      <span style={{ background: '#182229', color: '#8696a0', borderRadius: '8px', padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontWeight: '500' }}>
                        {formatDate(msg.created_date)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isTeacher ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    {!isTeacher && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && avatar(selectedStudent.parentName || 'V', 28, getColor(selectedStudent.id))}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '65%', minWidth: '80px',
                      background: isTeacher ? '#005c4b' : '#202c33',
                      borderRadius: isTeacher ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '0.5rem 0.75rem 0.35rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      position: 'relative',
                    }}>
                      <p style={{ margin: 0, color: '#e9edef', fontSize: '0.875rem', lineHeight: '1.55', wordBreak: 'break-word' }}>{msg.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <span style={{ color: '#8696a0', fontSize: '0.66rem' }}>{formatTime(msg.created_date)}</span>
                        {isTeacher && <span style={{ color: '#53bdeb', fontSize: '0.7rem' }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', background: '#202c33', display: 'flex', alignItems: 'flex-end', gap: '0.6rem', zIndex: 1 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0', padding: '0.5rem', borderRadius: '50%', flexShrink: 0 }}><Smile size={22} /></button>
            <div style={{ flex: 1, background: '#2a3942', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', padding: '0.5rem 0.75rem', gap: '0.5rem' }}>
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Mesaj"
                rows={1}
                style={{
                  flex: 1, resize: 'none', background: 'none', border: 'none', outline: 'none',
                  color: '#e9edef', fontSize: '0.9rem', fontFamily: 'inherit',
                  maxHeight: '120px', overflowY: 'auto', lineHeight: '1.5',
                }}
              />
            </div>
            <button onClick={sendMessage} disabled={!newMsg.trim()}
              style={{
                width: '46px', height: '46px', borderRadius: '50%', border: 'none', flexShrink: 0,
                background: newMsg.trim() ? '#00a884' : '#2a3942',
                cursor: newMsg.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s', boxShadow: newMsg.trim() ? '0 2px 8px rgba(0,168,132,0.4)' : 'none',
              }}>
              <Send size={18} color="white" style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const COLORS = ['#00a884', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];
function getColor(id) { if (!id) return COLORS[0]; let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % COLORS.length; return COLORS[Math.abs(h)]; }