import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, MessageSquare, Clock } from 'lucide-react';

export default function ChatHistorySidebar({ language, activeConversationId, onSelect, onNewChat, refreshKey, userId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [language, refreshKey, userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Explicitly filter by created_by_id so each user only sees their own chats
      const query = userId ? { created_by_id: userId } : {};
      const records = await base44.entities.AssistantChatHistory.filter(query, '-created_date', 200);
      console.log('[ChatHistorySidebar] userId:', userId, 'records:', records?.length, records?.slice(0, 2));
      // Group by conversation_id
      const grouped = {};
      for (const r of records || []) {
        if (!grouped[r.conversation_id]) {
          grouped[r.conversation_id] = {
            conversation_id: r.conversation_id,
            title: '',
            date: r.created_date,
            messageCount: 0,
            allMsgs: [],
          };
        }
        grouped[r.conversation_id].messageCount++;
        grouped[r.conversation_id].allMsgs.push(r);
        if (r.created_date > grouped[r.conversation_id].date) {
          grouped[r.conversation_id].date = r.created_date;
        }
      }
      // Derive title from the earliest user message (title field is mostly null)
      for (const conv of Object.values(grouped)) {
        const sorted = conv.allMsgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const firstUser = sorted.find(m => m.role === 'user');
        conv.title = (firstUser?.title || firstUser?.content || (language === 'en' ? 'Conversation' : 'Sohbet')).slice(0, 40);
        delete conv.allMsgs;
      }
      const list = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
      setConversations(list);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, convId) => {
    e.stopPropagation();
    try {
      const records = await base44.entities.AssistantChatHistory.filter({ conversation_id: convId });
      for (const r of records) {
        await base44.entities.AssistantChatHistory.delete(r.id);
      }
      loadConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60);
    if (diff < 1) return 'az önce';
    if (diff < 24) return `${Math.floor(diff)} saat önce`;
    if (diff < 48) return 'dün';
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return `${d.getDate()} ${days[d.getDay()]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button
        onClick={onNewChat}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          width: '100%', padding: '0.65rem', borderRadius: '10px',
          border: '1.5px dashed #c7d2fe', background: '#eef2ff',
          color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem',
          cursor: 'pointer', marginBottom: '0.75rem', transition: 'all 0.15s',
        }}
      >
        <Plus size={16} />
        {language === 'en' ? 'New chat' : 'Yeni sohbet'}
      </button>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', padding: '1rem' }}>
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', padding: '1.5rem 0.5rem' }}>
            <MessageSquare size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
            {language === 'en' ? 'No chat history yet' : 'Henüz sohbet geçmişi yok'}
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              onClick={() => onSelect(conv.conversation_id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.7rem', borderRadius: '10px',
                cursor: 'pointer', transition: 'all 0.15s',
                background: conv.conversation_id === activeConversationId ? '#eef2ff' : 'transparent',
                border: conv.conversation_id === activeConversationId ? '1.5px solid #c7d2fe' : '1.5px solid transparent',
              }}
              onMouseEnter={e => { if (conv.conversation_id !== activeConversationId) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (conv.conversation_id !== activeConversationId) e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageSquare size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 600, color: '#374151',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {conv.title || (language === 'en' ? 'Conversation' : 'Sohbet')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                  <Clock size={10} style={{ color: '#9ca3af' }} />
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{formatDate(conv.date)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.conversation_id)}
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  color: '#d1d5db', cursor: 'pointer', padding: '4px',
                  borderRadius: '6px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.background = 'none'; }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}