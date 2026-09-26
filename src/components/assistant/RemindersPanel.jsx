import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, Clock } from 'lucide-react';

export default function RemindersPanel({ language, userId, refreshKey }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [userId, language, refreshKey]);

  const loadReminders = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const records = await base44.entities.AssistantReminder.filter({ user_id: userId, status: 'pending' }, 'remind_at', 50);
      setReminders(records || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await base44.entities.AssistantReminder.update(id, { status: 'cancelled' });
      loadReminders();
    } catch (err) {
      console.error('Failed to cancel reminder:', err);
    }
  };

  const formatDateTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const days = language === 'en'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    if (isToday) return `${language === 'en' ? 'Today' : 'Bugün'} ${time}`;
    if (isTomorrow) return `${language === 'en' ? 'Tomorrow' : 'Yarın'} ${time}`;
    return `${d.getDate()} ${days[d.getDay()]} ${time}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Bell size={14} style={{ color: '#f59e0b' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
          {language === 'en' ? 'Reminders' : 'Hatırlatmalar'}
        </span>
        {reminders.length > 0 && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'white',
            background: '#f59e0b', borderRadius: 10, padding: '1px 7px',
          }}>{reminders.length}</span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', padding: '0.5rem' }}>
          {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
        </div>
      ) : reminders.length === 0 ? (
        <div style={{
          fontSize: '0.72rem', color: '#9ca3af', padding: '0.75rem 0.5rem',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          {language === 'en'
            ? 'No reminders. Type "remind: tomorrow 18:00 lesson prep"'
            : 'Hatırlatma yok. "hatırlat: yarın 18:00 ders hazırlığı" yazın'}
        </div>
      ) : (
        reminders.map((r) => (
          <div key={r.id} style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: '10px', padding: '0.6rem 0.7rem',
            display: 'flex', flexDirection: 'column', gap: '0.3rem',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600, lineHeight: 1.4 }}>
              {r.message}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={11} style={{ color: '#b45309' }} />
                <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600 }}>
                  {formatDateTime(r.remind_at)}
                </span>
                {r.repeat_rule !== 'none' && (
                  <span style={{ fontSize: '0.6rem', color: '#b45309', background: 'rgba(180,83,9,0.1)', padding: '1px 5px', borderRadius: 6 }}>
                    {r.repeat_rule === 'daily' ? (language === 'en' ? 'daily' : 'günlük') : (language === 'en' ? 'weekly' : 'haftalık')}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCancel(r.id)}
                style={{
                  background: 'none', border: 'none', color: '#d1d5db',
                  cursor: 'pointer', padding: '2px', borderRadius: '4px',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}