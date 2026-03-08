import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AuthModal({ role, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    localStorage.setItem('tilki_role', role);
    base44.auth.redirectToLogin();
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
            {isLogin ? 'Hoşgeldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.9rem',
          }}>
            {isLogin ? 'Devam etmek için giriş yapın' : 'Yeni bir hesap oluşturun'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name field (signup only) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <User size={16} /> Adınız
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız Soyadınız"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <Mail size={16} /> E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@mail.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password field */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <Lock size={16} /> Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Güçlü bir şifre girin"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 1rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  paddingRight: '2.5rem',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0.5rem',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password (signup only) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <Lock size={16} /> Şifre Tekrarı
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Şifrenizi tekrar girin"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '500',
            }}>
              {error}
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
              marginTop: '0.5rem',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>

          {/* Toggle */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                }}
              >
                {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}