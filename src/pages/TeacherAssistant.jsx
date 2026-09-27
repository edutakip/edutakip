import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Bot, Sparkles, Lock, MessageCircle, Bell, X, Check, Menu, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProUpgradeModal from '@/components/ProUpgradeModal';
import { isPro } from '@/lib/subscription';
import ChatHistorySidebar from '@/components/assistant/ChatHistorySidebar';
import RemindersPanel from '@/components/assistant/RemindersPanel';
import { isReminderCommand, parseReminder } from '@/lib/reminderParser';
import { showToast } from '@/lib/toast';

const WHATSAPP_TRIGGER = 'SHOW_WHATSAPP_BUTTON';

const FREE_QUESTION_LIMIT = 2;

import { useTranslation } from 'react-i18next';
const getAgentName = (lang) => lang === 'en' ? 'edu_asistan_en' : 'edu_asistan';

const QUICK_PROMPTS_TR = [
  { icon: '👥', text: 'Bu ay kaç aktif öğrencim var?' },
  { icon: '💰', text: 'Bu ay kim ödeme yapmadı?' },
  { icon: '📅', text: 'Bugünkü derslerim neler?' },
  { icon: '📊', text: 'En çok zorlanan öğrencilerim kimler?' },
  { icon: '📝', text: 'Tamamlanmamış ödevler var mı?' },
  { icon: '💡', text: 'Öğrenci motivasyonunu artırmak için öneriler ver' },
  { icon: '📈', text: 'Hangi öğrencilerime akıllı zam önerisi yapabilirsin?' },
  { icon: '🗓️', text: 'Bu haftaki ders programım nasıl görünüyor?' },
];
const QUICK_PROMPTS_EN = [
  { icon: '👥', text: 'How many active students do I have this month?' },
  { icon: '💰', text: 'Who hasn\'t paid this month?' },
  { icon: '📅', text: 'What are my lessons today?' },
  { icon: '📊', text: 'Which students are struggling the most?' },
  { icon: '📝', text: 'Are there any incomplete homework assignments?' },
  { icon: '💡', text: 'Give me tips to increase student motivation' },
  { icon: '📈', text: 'Which students can you suggest a fee increase for?' },
  { icon: '🗓️', text: 'How does my lesson schedule look this week?' },
];

function WhatsAppButton() {
  const url = base44.agents.getWhatsAppConnectURL('edu_asistan');
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          background: 'linear-gradient(135deg, #25d366, #128c7e)',
          color: 'white', borderRadius: '12px', padding: '0.65rem 1.25rem',
          fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
        }}
      >
        <MessageCircle size={18} />
        WhatsApp'tan Devam Et
      </a>
    </div>
  );
}

function MessageBubble({ message }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const isUser = message.role === 'user';

  const hasWhatsAppTrigger = !isUser && message.content?.includes(WHATSAPP_TRIGGER);
  const displayContent = hasWhatsAppTrigger
    ? message.content.replace(/\[?SHOW_WHATSAPP_BUTTON\]?/g, '').trim()
    : message.content;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
      gap: '0.65rem',
      alignItems: 'flex-start',
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
        }}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png"
            alt="EduTakip"
            style={{ width: 26, height: 26, borderRadius: '6px', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ maxWidth: '72%' }}>
        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'white',
          color: isUser ? 'white' : '#111827',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '0.85rem 1.1rem',
          boxShadow: isUser
            ? '0 2px 12px rgba(79,70,229,0.3)'
            : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
          fontSize: '0.88rem',
          lineHeight: '1.65',
        }}>
          {isUser ? (
            <p style={{ margin: 0 }}>{message.content}</p>
          ) : (
            <div className="assistant-markdown">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 0.5rem', lineHeight: 1.65 }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#1e1b4b' }}>{children}</strong>,
                  code: ({ children }) => <code style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.82rem', color: '#4f46e5' }}>{children}</code>,
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}

          {message.tool_calls?.length > 0 && message.tool_calls.some(t => t.status === 'running' || t.status === 'in_progress') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#6366f1', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%', background: '#6366f1',
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              {isEn ? 'Fetching data...' : 'Veriler getiriliyor...'}
            </div>
          )}
        </div>

        {hasWhatsAppTrigger && <WhatsAppButton />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '1rem' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png"
          alt="EduTakip"
          style={{ width: 26, height: 26, borderRadius: '6px', objectFit: 'cover' }}
        />
      </div>
      <div style={{
        background: 'white', borderRadius: '18px 18px 18px 4px',
        padding: '0.85rem 1.1rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#c7d2fe',
            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function TeacherAssistant() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'tr';
  const AGENT_NAME = getAgentName(i18n.language);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [remindersRefreshKey, setRemindersRefreshKey] = useState(0);
  const [pendingReminder, setPendingReminder] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const lastSavedAssistantRef = useRef('');
  const savedUserMsgsRef = useRef(new Set());
  const assistantSaveTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (u?.phone) setPhoneInput(u.phone);
    }).catch(() => {});
    initConversation();
    return () => {
      unsubscribeRef.current?.();
      if (assistantSaveTimerRef.current) clearTimeout(assistantSaveTimerRef.current);
    };
  }, []);

  const initConversation = async () => {
    try {
      setInitializing(true);
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: isEn ? 'EduTakip Assistant Session' : 'EduTakip Asistan Oturumu' },
      });
      setConversation(conv);
      setActiveConversationId(conv.id);
      lastSavedAssistantRef.current = '';
      savedUserMsgsRef.current = new Set();
      if (assistantSaveTimerRef.current) {
        clearTimeout(assistantSaveTimerRef.current);
        assistantSaveTimerRef.current = null;
      }

      unsubscribeRef.current?.();
      unsubscribeRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
        setLoading(false);
      });

      const full = await base44.agents.getConversation(conv.id);
      setMessages(full.messages || []);

      setInitializing(false);
    } catch (err) {
      console.error(err);
      setInitializing(false);
    }
  };

  const saveChatMessage = async (convId, role, content, title) => {
    try {
      await base44.entities.AssistantChatHistory.create({
        conversation_id: convId,
        role,
        content,
        language: lang,
        title: title || null,
      });
      setHistoryRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to save chat message:', err);
      showToast({ message: isEn ? 'Chat could not be saved' : 'Sohbet kaydedilemedi', variant: 'error' });
    }
  };

  // Save assistant messages with debounce — wait for streaming to stabilize before saving
  useEffect(() => {
    if (!loading && !initializing && messages.length > 0 && conversation) {
      const visibleMsgs = messages.filter(m => m.role === 'user' || m.role === 'assistant');
      const lastMsg = visibleMsgs[visibleMsgs.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
        const cleanContent = lastMsg.content.replace(/\[?SHOW_WHATSAPP_BUTTON\]?/g, '').trim();
        if (cleanContent && cleanContent !== lastSavedAssistantRef.current) {
          // Debounce: wait 2.5s for streaming to stabilize, then save final version only
          if (assistantSaveTimerRef.current) clearTimeout(assistantSaveTimerRef.current);
          assistantSaveTimerRef.current = setTimeout(async () => {
            assistantSaveTimerRef.current = null;
            lastSavedAssistantRef.current = cleanContent;
            await saveChatMessage(conversation.id, 'assistant', cleanContent);
          }, 2500);
        }
      }
    }
  }, [loading, initializing, messages, conversation]);

  const loadConversation = async (convId) => {
    try {
      setSidebarOpen(false);
      setInitializing(true);
      unsubscribeRef.current?.();
      lastSavedAssistantRef.current = '';
      savedUserMsgsRef.current = new Set();
      if (assistantSaveTimerRef.current) {
        clearTimeout(assistantSaveTimerRef.current);
        assistantSaveTimerRef.current = null;
      }

      // Try to get the existing agent conversation
      try {
        const conv = await base44.agents.getConversation(convId);
        setConversation(conv);
        setActiveConversationId(conv.id);
        setMessages(conv.messages || []);

        unsubscribeRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
          setLoading(false);
        });
      } catch {
        // Agent conversation expired — load from AssistantChatHistory
        const historyMsgs = await base44.entities.AssistantChatHistory.filter({ conversation_id: convId }, 'created_date', 200);
        // Deduplicate consecutive identical messages (from streaming save bug)
        const deduped = (historyMsgs || []).reduce((acc, h) => {
          const prev = acc[acc.length - 1];
          if (!prev || prev.role !== h.role || prev.content !== h.content) {
            acc.push({ role: h.role, content: h.content });
          }
          return acc;
        }, []);
        setMessages(deduped);
        // Create new conversation to continue
        const newConv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: isEn ? 'EduTakip Assistant Session' : 'EduTakip Asistan Oturumu' },
        });
        setConversation(newConv);
        setActiveConversationId(newConv.id);

        unsubscribeRef.current = base44.agents.subscribeToConversation(newConv.id, (data) => {
          setMessages(data.messages || []);
          setLoading(false);
        });
      }

      setInitializing(false);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setInitializing(false);
    }
  };

  const newChat = () => {
    setSidebarOpen(false);
    initConversation();
  };

  const createReminder = async (parsed) => {
    if (!currentUser) return;
    try {
      const phone = phoneInput || currentUser.phone || '';
      await base44.entities.AssistantReminder.create({
        user_id: currentUser.id,
        user_phone: phone,
        message: parsed.message,
        remind_at: parsed.remind_at,
        repeat_rule: parsed.repeat_rule || 'none',
        status: 'pending',
        language: lang,
      });
      setRemindersRefreshKey(k => k + 1);
      setPendingReminder(null);
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading || !conversation) return;

    // Check for reminder command (doesn't count against free limit)
    if (isReminderCommand(msg, lang)) {
      const parsed = parseReminder(msg, lang);
      if (parsed) {
        setPendingReminder(parsed);
        setInput('');
        return;
      }
    }

    // Free plan limit check
    const userQuestionCount = messages.filter(m => m.role === 'user').length;
    if (!isPro(currentUser) && userQuestionCount >= FREE_QUESTION_LIMIT) {
      setShowProModal(true);
      return;
    }

    setInput('');
    setLoading(true);

    // Clear any pending assistant message save (streaming debounce)
    if (assistantSaveTimerRef.current) {
      clearTimeout(assistantSaveTimerRef.current);
      assistantSaveTimerRef.current = null;
    }

    // Save user message to chat history
    const title = messages.filter(m => m.role === 'user').length === 0 ? msg.slice(0, 40) : null;
    saveChatMessage(conversation.id, 'user', msg, title);

    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: msg });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  const isTyping = loading || (visibleMessages.length > 0 && visibleMessages[visibleMessages.length - 1]?.role === 'user');
  const userQuestionCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPro(currentUser) && currentUser && userQuestionCount >= FREE_QUESTION_LIMIT;

  return (
    <>
      {showProModal && <ProUpgradeModal reason="assistant" onClose={() => setShowProModal(false)} onUpgraded={() => setShowProModal(false)} />}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .assistant-markdown p:last-child { margin-bottom: 0; }
        .quick-prompt-btn:hover {
          border-color: #4f46e5 !important;
          background: #eef2ff !important;
          color: #4f46e5 !important;
          transform: translateY(-1px);
        }
        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, #6d28d9) !important;
          transform: scale(1.05);
        }
      `}</style>

      <div style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-primary)',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: sidebarOpen ? '280px' : '0px',
          flexShrink: 0,
          background: '#f8fafc',
          borderRight: sidebarOpen ? '1px solid #e5e7eb' : 'none',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {sidebarOpen && (
            <>
              <div style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>
                  {isEn ? 'History & Reminders' : 'Geçmiş & Hatırlatmalar'}
                </span>
                <button onClick={() => setSidebarOpen(false)} style={{
                  background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px',
                }}>
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
                <ChatHistorySidebar
                  language={lang}
                  activeConversationId={activeConversationId}
                  onSelect={loadConversation}
                  onNewChat={newChat}
                  refreshKey={historyRefreshKey}
                />
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', padding: '0.85rem', flexShrink: 0, maxHeight: '40%', overflowY: 'auto' }}>
                <RemindersPanel
                  language={lang}
                  userId={currentUser?.id}
                  refreshKey={remindersRefreshKey}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Main Chat Area ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}>

        {/* ── Header ── */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            background: '#f4f6fb', border: '1.5px solid #e5e7eb', borderRadius: '10px',
            padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
            color: '#6b7280', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f4f6fb'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <Menu size={18} />
          </button>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
          }}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png"
              alt="EduTakip"
              style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>EduTakip Asistanı</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px rgba(16,185,129,0.2)' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{isEn ? 'Online' : 'Çevrimiçi'}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', borderRadius: 20, padding: '0.35rem 0.85rem', border: '1px solid #c7d2fe' }}>
            <Sparkles size={13} color='#4f46e5' />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>AI Destekli</span>
          </div>
        </div>

        {/* ── Messages ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {initializing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                {isEn ? 'Preparing assistant...' : 'Asistan hazırlanıyor...'}
              </div>
            </div>
          ) : (
            <>
              {/* Welcome + quick prompts shown when no messages */}
              {visibleMessages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '2rem' }}>
                  <div style={{ textAlign: 'center', maxWidth: 480 }}>
                    <div style={{
                      width: 68, height: 68, borderRadius: '18px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                    }}>
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png"
                        alt="EduTakip"
                        style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }}
                      />
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
                      {isEn ? 'Hello Teacher! 👋' : 'Merhaba Hocam! 👋'}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7 }}>
                      {isEn ? "I'm the EduTakip Assistant. I can help you with student tracking, payments, lesson schedules and more." : 'Ben EduTakip Asistanı. Öğrenci takibi, ödemeler, ders programı ve daha fazlası hakkında yardımcı olabilirim.'}
                    </p>
                  </div>

                  {/* Quick prompts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', width: '100%', maxWidth: 560 }}>
                    {(isEn ? QUICK_PROMPTS_EN : QUICK_PROMPTS_TR).map((p, i) => (
                      <button
                        key={i}
                        className="quick-prompt-btn"
                        onClick={() => sendMessage(p.text)}
                        style={{
                          background: 'white',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          fontSize: '0.83rem',
                          color: '#374151',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {visibleMessages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {isTyping && visibleMessages[visibleMessages.length - 1]?.role === 'user' && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── Input ── */}
        <div style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          flexShrink: 0,
        }}>
          {/* Free limit banner */}
          {!isPro(currentUser) && currentUser && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: isLimitReached ? '#fef3c7' : '#f0f4ff',
              border: `1.5px solid ${isLimitReached ? '#fbbf24' : '#c7d2fe'}`,
              borderRadius: '12px', padding: '0.55rem 0.9rem',
              marginBottom: '0.75rem', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={13} color={isLimitReached ? '#92400e' : '#4f46e5'} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isLimitReached ? '#92400e' : '#3730a3' }}>
                  {isLimitReached
                    ? (isEn ? 'Free question limit reached (2/2)' : 'Ücretsiz soru limitine ulaştınız (2/2)')
                    : (isEn ? `Free questions: ${userQuestionCount}/${FREE_QUESTION_LIMIT}` : `Ücretsiz soru: ${userQuestionCount}/${FREE_QUESTION_LIMIT}`)}
                </span>
              </div>
              <button onClick={() => setShowProModal(true)} style={{
                background: isLimitReached ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: 'none', color: 'white', borderRadius: '8px',
                padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {isEn ? 'Upgrade to Pro' : "Pro'ya Geç"}
              </button>
            </div>
          )}

          {isLimitReached ? (
            <button onClick={() => setShowProModal(true)} style={{
              width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
            }}>
              <Lock size={16} /> {isEn ? 'Upgrade to Pro to continue' : "Devam etmek için Pro'ya geçin"}
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.65rem',
              background: '#f4f6fb',
              borderRadius: '16px',
              border: '1.5px solid #e5e7eb',
              padding: '0.6rem 0.6rem 0.6rem 1.1rem',
              transition: 'border-color 0.15s',
            }}>
              <Bot size={18} color='#9ca3af' style={{ flexShrink: 0, marginBottom: '0.35rem' }} />
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEn ? "Ask the EduTakip Assistant anything... (or 'remind: tomorrow 18:00 lesson')" : "EduTakip Asistanına bir şeyler sorun... (veya 'hatırlat: yarın 18:00 ders')"}
                rows={1}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.9rem',
                  color: '#111827',
                  lineHeight: 1.5,
                  maxHeight: '120px',
                  overflowY: 'auto',
                  fontFamily: 'inherit',
                }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || !conversation}
                style={{
                  width: 38, height: 38, borderRadius: '10px',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : '#e5e7eb',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: input.trim() && !loading ? '0 2px 8px rgba(79,70,229,0.35)' : 'none',
                }}
              >
                <Send size={15} color={input.trim() && !loading ? 'white' : '#9ca3af'} />
              </button>
            </div>
          )}
          <p style={{ textAlign: 'center', color: '#c4c9d4', fontSize: '0.7rem', marginTop: '0.5rem' }}>
            {isEn ? 'EduTakip Assistant is powered by AI and may make mistakes.' : 'EduTakip Asistanı yapay zeka tarafından desteklenmektedir ve hatalar yapabilir.'}
          </p>
        </div>
        </div>
      </div>

      {/* ── Reminder Confirmation Modal ── */}
      {pendingReminder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(4px)',
        }} onClick={() => setPendingReminder(null)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 400,
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px', background: '#fef3c7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={20} color='#f59e0b' />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                {isEn ? 'Create Reminder?' : 'Hatırlatma Oluştur?'}
              </h3>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                  {isEn ? 'Message' : 'Mesaj'}
                </span>
                <p style={{ fontSize: '0.9rem', color: '#111827', margin: '0.2rem 0 0', fontWeight: 600 }}>
                  {pendingReminder.message}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                  {isEn ? 'When' : 'Zaman'}
                </span>
                <p style={{ fontSize: '0.9rem', color: '#111827', margin: '0.2rem 0 0', fontWeight: 600 }}>
                  {new Date(pendingReminder.remind_at).toLocaleString(isEn ? 'en-GB' : 'tr-TR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                {isEn ? 'WhatsApp Number (E.164)' : 'WhatsApp Numarası (E.164)'}
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                style={{
                  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                {isEn ? 'Required for WhatsApp reminders' : 'WhatsApp hatırlatmaları için gerekli'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => setPendingReminder(null)} style={{
                flex: 1, padding: '0.7rem', borderRadius: 12, border: '1.5px solid #e5e7eb',
                background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>
                {isEn ? 'Cancel' : 'İptal'}
              </button>
              <button onClick={() => createReminder(pendingReminder)} style={{
                flex: 1, padding: '0.7rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
              }}>
                <Check size={16} /> {isEn ? 'Confirm' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}