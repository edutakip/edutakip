import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Checkout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setStatus('error');
          setMessage('Kullanıcı oturumu bulunamadı.');
          return;
        }

        // Webhook tarafından user güncellenecek, 3 saniye bekle ve dashboard'a dön
        setStatus('processing');
        setMessage('Ödeme işleniyor...');
        
        setTimeout(() => {
          navigate('/TeacherDashboard');
        }, 3000);
      } catch (error) {
        console.error('Checkout error:', error);
        setStatus('error');
        setMessage('Bir hata oluştu.');
      }
    };

    checkPayment();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '2rem',
        textAlign: 'center',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {status === 'processing' && (
          <>
            <Loader2 size={48} color='#4f46e5' style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Ödeme İşleniyor</h2>
            <p style={{ color: '#9ca3af' }}>Lütfen bekleyin...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertCircle size={32} color='#ef4444' />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Hata</h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{message}</p>
            <button onClick={() => navigate('/')}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              Ana Sayfa'ya Dön
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}