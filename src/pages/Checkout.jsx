import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkTransaction = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const user = await base44.auth.me();

        if (!user) {
          setStatus('error');
          setMessage('Kullanıcı oturumu bulunamadı.');
          return;
        }

        if (!transactionId) {
          setStatus('error');
          setMessage('Transaction ID bulunamadı.');
          return;
        }

        // Webhook tarafından user güncellenecek, burada sadece kontrol yapıyoruz
        setStatus('success');
        setMessage('Ödemeniz başarıyla alındı!');

        setTimeout(() => {
          navigate('/TeacherDashboard');
        }, 2000);
      } catch (error) {
        console.error('Checkout error:', error);
        setStatus('error');
        setMessage('Ödeme kontrol edilirken hata oluştu.');
      }
    };

    checkTransaction();
  }, [searchParams, navigate]);

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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Ödeme İşleniyor</h2>
            <p style={{ color: '#9ca3af' }}>Lütfen bekleyin...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle size={32} color='#10b981' />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Ödeme Başarılı!</h2>
            <p style={{ color: '#9ca3af' }}>{message}</p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '1rem' }}>Dashboard'a yönlendiriliyorsunuz...</p>
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