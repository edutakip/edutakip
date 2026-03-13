import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, BookmarkPlus, ChevronDown, Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WhatsAppMessageModal({ phone, message: initialMessage, templateType = 'genel', onClose }) {
  const [message, setMessage] = useState(initialMessage);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => {
      base44.entities.MessageTemplate.filter({ teacherEmail: me.email }).then(setTemplates);
    });
  }, []);

  const handleSend = () => {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('0') ? '90' + cleaned.slice(1) : cleaned;
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleSaveTemplate = async () => {
    if (!saveName.trim()) return;
    const me = await base44.auth.me();
    const newTpl = await base44.entities.MessageTemplate.create({
      name: saveName.trim(),
      content: message,
      type: templateType,
      teacherEmail: me.email,
    });
    setTemplates(t => [...t, newTpl]);
    setSaveName('');
    setShowSaveForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    await base44.entities.MessageTemplate.delete(id);
    setTemplates(t => t.filter(x => x.id !== id));
  };

  const handleLoadTemplate = (tpl) => {
    setMessage(tpl.content);
    setShowTemplates(false);
  };

  const relevantTemplates = templates.filter(t => t.type === templateType || t.type === 'genel');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.65)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb', maxHeight: '92vh', overflowY: 'auto' }}>

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

        {/* Templates dropdown */}
        <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
          <button onClick={() => setShowTemplates(v => !v)}
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📂 Kayıtlı Şablonlar {relevantTemplates.length > 0 && `(${relevantTemplates.length})`}</span>
            <ChevronDown size={14} style={{ transform: showTemplates ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>

          {showTemplates && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
              {relevantTemplates.length === 0 ? (
                <div style={{ padding: '0.85rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>Henüz kayıtlı şablon yok</div>
              ) : relevantTemplates.map(tpl => (
                <div key={tpl.id} onClick={() => handleLoadTemplate(tpl)}
                  style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.83rem', color: '#111827' }}>{tpl.name}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.1rem' }}>{tpl.content.slice(0, 50)}...</p>
                  </div>
                  <button onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px', color: '#d1d5db', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: '700', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mesajı Düzenle
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={9}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: '1.6', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#25d366'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Save as template */}
        {!showSaveForm ? (
          <button onClick={() => setShowSaveForm(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0', marginBottom: '1rem' }}>
            {saved ? <><Check size={13} color='#16a34a' /><span style={{ color: '#16a34a' }}>Şablon kaydedildi!</span></> : <><BookmarkPlus size={13} /> Bu mesajı şablon olarak kaydet</>}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              autoFocus
              placeholder='Şablon adı...'
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveTemplate(); if (e.key === 'Escape') setShowSaveForm(false); }}
              style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontSize: '0.83rem', outline: 'none' }}
            />
            <button onClick={handleSaveTemplate} disabled={!saveName.trim()}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '9px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', opacity: saveName.trim() ? 1 : 0.5 }}>
              Kaydet
            </button>
            <button onClick={() => setShowSaveForm(false)}
              style={{ padding: '0.5rem', borderRadius: '9px', border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

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