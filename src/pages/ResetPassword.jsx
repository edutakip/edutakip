import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png';

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('resetToken') || params.get('reset_token') || params.get('t') || '';
    setResetToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!resetToken) { setError('Geçersiz sıfırlama bağlantısı. Lütfen e-postadaki bağlantıya tıklayarak tekrar deneyin.'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Şifre en az 6 karakter olmalı'); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setSuccess(true);
    } catch (err) {
      setError('Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #e0e7ff 100%)', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={36} color="#059669" />
          </div>
          <h2 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Şifreniz Sıfırlandı!</h2>
          <p style={{ color: '#71717a', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Yeni şifrenizle giriş yapabilirsiniz.</p>
          <a href="/giris" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.75rem', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}>
            Giriş Yap <ArrowRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #e0e7ff 100%)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`.login-input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important; }`}</style>
      <div style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={LOGO} alt="EduTakip" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 1rem' }} />
          <h2 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Şifre Sıfırla</h2>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Yeni şifrenizi belirleyin.</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.7rem 0.85rem', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{error}</span>
          </div>
        )}
        {!resetToken && !error && (
          <div style={{ marginBottom: '1rem', padding: '0.7rem 0.85rem', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} color="#92400e" />
            <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>Sıfırlama bağlantısında token bulunamadı. Lütfen e-postadaki bağlantıya tıklayarak gelin.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>Yeni Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
                style={{
                  width: '100%', padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                  borderRadius: 12, border: '1.5px solid #e5e7eb',
                  fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !resetToken}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontWeight: 800, fontSize: '0.95rem',
              cursor: loading || !resetToken ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                Yükleniyor...
              </>
            ) : (
              <>Şifreyi Sıfırla <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#71717a' }}>
          <a href="/giris" style={{ fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>← Girişe dön</a>
        </p>
      </div>
    </div>
  );
}