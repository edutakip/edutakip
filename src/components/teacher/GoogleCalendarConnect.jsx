import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle, XCircle, ExternalLink, RefreshCw, Unlink } from 'lucide-react';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

export default function GoogleCalendarConnect({ user }) {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke('syncLessonToCalendar', {
        lessonId: '__check__',
        action: 'create',
      });
      // If we get 'connected: false', not connected; otherwise connected
      setConnected(res.data?.connected !== false && !res.data?.error?.includes('not connected'));
    } catch (e) {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          checkConnection();
          setConnecting(false);
        }
      }, 500);
    } catch (e) {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
    } catch (e) {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div style={{
      background: 'white', borderRadius: 18, padding: '1.5rem',
      border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={17} color='#4285f4' />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem', margin: 0 }}>Google Takvim Entegrasyonu</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.1rem 0 0' }}>Dersleri otomatik olarak Google Takvim'e ekle</p>
        </div>
      </div>

      {checking ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
          <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Bağlantı kontrol ediliyor...
        </div>
      ) : connected ? (
        <div>
          {/* Connected state */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', border: '1.5px solid #bbf7d0' }}>
            <CheckCircle size={18} color='#10b981' />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', margin: 0 }}>Google Takvim bağlı ✓</p>
              <p style={{ fontSize: '0.75rem', color: '#6ee7b7', margin: '0.1rem 0 0' }}>Yeni dersler otomatik olarak takviminize eklenir</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
            📅 Yeni ders eklediğinizde Google Takvim'e otomatik etkinlik oluşturulur<br />
            ✏️ Ders güncellendiğinde takvim etkinliği de güncellenir<br />
            🗑️ Ders iptal edildiğinde takvimden silinir
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem', borderRadius: 10,
              border: '1.5px solid #fee2e2', background: '#fef2f2',
              color: '#dc2626', fontWeight: 700, fontSize: '0.83rem',
              cursor: 'pointer',
            }}
          >
            {disconnecting ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Unlink size={13} />}
            Bağlantıyı Kes
          </button>
        </div>
      ) : (
        <div>
          {/* Disconnected state */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f9fafb', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', border: '1.5px solid #e5e7eb' }}>
            <XCircle size={18} color='#d1d5db' />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', margin: 0 }}>Google Takvim bağlı değil</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>Hesabınızı bağlayarak dersleri otomatik senkronize edin</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
            Bağladıktan sonra:<br />
            📅 Yeni dersler otomatik olarak Google Takvim'e eklenir<br />
            ✏️ Ders bilgileri güncellendiğinde takvim de güncellenir<br />
            🗑️ İptal edilen dersler takvimden kaldırılır
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
              padding: '0.7rem 1.25rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
              color: 'white', fontWeight: 800, fontSize: '0.88rem',
              cursor: connecting ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(66,133,244,0.35)',
            }}
          >
            {connecting
              ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Bağlanıyor...</>
              : <><ExternalLink size={14} /> Google Takvim'e Bağlan</>
            }
          </button>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}