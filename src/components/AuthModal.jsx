import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AuthModal({ role, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // placeholder
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
            Devam Etmek İçin Giriş Yapın
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
          <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <p style={{ color: '#15803d', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
              ℹ️ Hesabınız yoksa, giriş yaptıktan sonra otomatik olarak oluşturulacak.
            </p>
          </div>

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
            {loading ? 'Yükleniyor...' : 'Giriş Yap / Kayıt Ol'}
          </button>
        </form>
      </div>
    </div>
  );
}