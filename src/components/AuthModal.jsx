import React, { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AuthModal({ role, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    localStorage.setItem('tilki_role', role);
    const nextUrl = role === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard';
    base44.auth.redirectToLogin(nextUrl);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
        >
          <X size={18} color="#6b7280" />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            color: '#111827',
            fontSize: '1.5rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
          }}>
            {isLogin ? 'Giriş Yapın' : 'Kayıt Olun'}
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.9rem',
          }}>
            {role === 'teacher' ? 'Öğretmen Paneli' : 'Veli Paneli'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-posta adresiniz"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Şifre"
              required
              style={{
                width: '100%',
                padding: '0.75rem 2.25rem 0.75rem 2.25rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#111827',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Full name (signup only) */}
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ad Soyad"
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              padding: '0.85rem 1.5rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>

          {/* Toggle login/signup */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
              {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', fullName: '' });
                }}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', padding: 0 }}
              >
                {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}