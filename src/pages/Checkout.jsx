import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const PADDLE_CLIENT_TOKEN = 'live_fb6aea95ebc444b408a9cb2b68c';

export default function Checkout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('_ptxn');

    // Initialize Paddle and let it auto-detect _ptxn
    const initPaddle = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({
          token: PADDLE_CLIENT_TOKEN,
          checkout: {
            settings: {
              displayMode: 'overlay',
              theme: 'light',
              locale: 'tr',
              successUrl: `${window.location.origin}/checkout?success=true`,
            },
          },
          eventCallback: (event) => {
            if (event.name === 'checkout.completed') {
              setStatus('success');
              setTimeout(() => navigate('/TeacherDashboard'), 3000);
            }
          },
        });

        if (transactionId) {
          // Paddle will auto-detect _ptxn and open the overlay
          setStatus('idle');
        } else if (params.get('success') === 'true') {
          setStatus('success');
          setTimeout(() => navigate('/TeacherDashboard'), 3000);
        } else {
          // No transaction param — redirect home
          navigate('/');
        }
      } else {
        setStatus('error');
        setMessage('Paddle yüklenemedi. Lütfen sayfayı yenileyin.');
      }
    };

    // Give Paddle.js a moment to load if not ready yet
    if (window.Paddle) {
      initPaddle();
    } else {
      const interval = setInterval(() => {
        if (window.Paddle) {
          clearInterval(interval);
          initPaddle();
        }
      }, 100);
      setTimeout(() => { clearInterval(interval); initPaddle(); }, 5000);
    }
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
        {status === 'loading' && (
          <>
            <Loader2 size={48} color='#4f46e5' style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Yükleniyor...</h2>
          </>
        )}

        {status === 'idle' && (
          <>
            <Loader2 size={48} color='#4f46e5' style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Ödeme Sayfası Açılıyor</h2>
            <p style={{ color: '#9ca3af' }}>Lütfen bekleyin...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={32} color='#10b981' />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Ödeme Tamamlandı!</h2>
            <p style={{ color: '#9ca3af' }}>Hesabınız aktifleştirildi. Yönlendiriliyorsunuz...</p>
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