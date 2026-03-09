import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ParentInviteModal({ onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    const students = await base44.entities.Student.filter({ inviteCode: code.trim().toUpperCase() });

    if (students.length === 0) {
      setError('Geçersiz davetiye kodu. Lütfen öğretmeninizden aldığınız kodu kontrol edin.');
      setLoading(false);
      return;
    }

    // Save invite code & role so ParentDashboard can auto-link after login
    localStorage.setItem('tilki_role', 'parent');
    localStorage.setItem('tilki_invite_code', code.trim().toUpperCase());

    base44.auth.redirectToLogin(window.location.href.split('?')[0] + '?page=ParentDashboard');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1b4b, #2e1b6e)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <KeyRound size={28} color='#a5b4fc' />
        </div>

        <h2 style={{ color: 'white', fontWeight: '900', fontSize: '1.4rem', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Veli Girişi</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Öğretmeninizden aldığınız davetiye kodunu girerek devam edin.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: 'rgba(165,180,252,0.8)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.8px', display: 'block', marginBottom: '0.5rem' }}>
              DAVETİYE KODU
            </label>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="örn: ABC123"
              maxLength={12}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(99,102,241,0.4)'}`,
                borderRadius: '12px', padding: '0.85rem 1rem',
                color: 'white', fontSize: '1.1rem', fontWeight: '800',
                letterSpacing: '3px', textAlign: 'center', outline: 'none',
                fontFamily: 'monospace', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.8)'}
              onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'rgba(99,102,241,0.4)'}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem' }}>
              <AlertCircle size={15} color='#f87171' style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span style={{ color: '#f87171', fontSize: '0.82rem' }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            style={{
              background: code.trim() && !loading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: '12px', padding: '1rem',
              color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: code.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: code.trim() && !loading ? '0 8px 24px rgba(79,70,229,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Doğrulanıyor...</> : 'Devam Et'}
          </button>
        </form>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem' }}>
          Davetiye kodunuz yoksa öğretmeninizle iletişime geçin.
        </p>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}