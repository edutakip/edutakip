import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Building2, AlertCircle, Loader2, ArrowLeft, Clock, Receipt } from 'lucide-react';
import { showToast } from '@/lib/toast';

const IBAN = 'TR39 0015 7000 0000 0117 8700 33';
const ACCOUNT_NAME = 'Şahin BAŞDOĞAN';
const PER_STUDENT_PRICE = 50;

export default function ManuelCheckout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const studentCount = Number(params.get('students')) || 10;
  const plan = params.get('plan') || 'monthly';

  const [user, setUser] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const total = studentCount * PER_STUDENT_PRICE;

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        // Check for existing pending payment for this user
        const existing = await base44.entities.SubscriptionPayment.filter({
          userEmail: me.email,
          status: 'bekliyor',
        });
        if (existing.length > 0) {
          setPayment(existing[0]);
        } else {
          await createPaymentRequest(me);
        }
      } catch (e) {
        console.error('Checkout load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateUniqueCode = async () => {
    // Generate a 5-digit code and check uniqueness
    for (let i = 0; i < 10; i++) {
      const code = String(Math.floor(10000 + Math.random() * 90000));
      const existing = await base44.entities.SubscriptionPayment.filter({ code });
      if (existing.length === 0) return code;
    }
    // Fallback: use timestamp-based
    return String(Date.now()).slice(-5);
  };

  const createPaymentRequest = async (me) => {
    setCreating(true);
    try {
      const code = await generateUniqueCode();
      const record = await base44.entities.SubscriptionPayment.create({
        userEmail: me.email,
        userFullName: me.full_name,
        userId: me.id,
        amount: total,
        code,
        plan,
        studentCount,
        status: 'bekliyor',
      });
      setPayment(record);
    } catch (e) {
      console.error('Create payment request error:', e);
      showToast({ message: 'Ödeme talebi oluşturulamadı.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      showToast({ message: 'Kopyalandı!' });
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#4f46e5', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.15rem', margin: 0 }}>Pro Abonelik Ödemesi</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', margin: '0.1rem 0 0' }}>Banka havalesi ile ödeme</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        {/* Pending notice */}
        {payment?.status === 'bekliyor' && (
          <div style={{ background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <Clock size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: '#92400e', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Ödemeniz bekleniyor</p>
              <p style={{ color: '#a16207', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>
                Aşağıdaki bilgilere havale yaptıktan sonra ödemeniz admin tarafından onaylanacaktır. Onay süresi genellikle birkaç saat içinde tamamlanır.
              </p>
            </div>
          </div>
        )}

        {/* Amount card */}
        <div style={{ background: 'white', borderRadius: 18, padding: '1.75rem', marginBottom: '1.25rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>Ödenecek Tutar</span>
            <span style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 20 }}>
              {studentCount} öğrenci · Aylık
            </span>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1 }}>
            {total.toLocaleString('tr-TR')}<span style={{ fontSize: '1.5rem', color: '#6b7280' }}>₺</span>
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.4rem 0 0' }}>Aylık abonelik · Öğrenci başına {PER_STUDENT_PRICE}₺</p>
        </div>

        {/* 5-digit code — most important */}
        {payment && (
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 8px 24px rgba(79,70,229,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                ⚠️ Açıklamaya Yazacağınız Kod
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', margin: '0.3rem 0 0' }}>
                Havale açıklamasına bu kodu yazın — ödemeniz bu koda göre eşleştirilir
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '0.85rem 1.75rem', display: 'flex', gap: '0.5rem' }}>
                {payment.code.split('').map((d, i) => (
                  <span key={i} style={{ color: 'white', fontSize: '2rem', fontWeight: 900, fontFamily: 'Courier New, monospace', letterSpacing: '2px' }}>{d}</span>
                ))}
              </div>
              <button onClick={() => copyToClipboard(payment.code, 'code')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {copiedField === 'code' ? <Check size={20} color="#6ee7b7" /> : <Copy size={20} color="white" />}
              </button>
            </div>
          </div>
        )}

        {/* Bank details */}
        <div style={{ background: 'white', borderRadius: 18, padding: '1.75rem', marginBottom: '1.25rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#4f46e5" />
            </div>
            <h2 style={{ color: '#111827', fontSize: '1rem', fontWeight: 800, margin: 0 }}>Banka Hesap Bilgileri</h2>
          </div>

          {/* IBAN */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.4rem' }}>IBAN</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: '#f8fafc', borderRadius: 12, padding: '0.85rem 1rem', border: '1.5px solid #e5e7eb' }}>
              <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Courier New, monospace', letterSpacing: '0.5px' }}>{IBAN}</span>
              <button onClick={() => copyToClipboard(IBAN, 'iban')}
                style={{ background: copiedField === 'iban' ? '#d1fae5' : '#eef2ff', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                {copiedField === 'iban' ? <Check size={16} color="#059669" /> : <Copy size={16} color="#4f46e5" />}
              </button>
            </div>
          </div>

          {/* Account name */}
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.4rem' }}>Alıcı Adı Soyadı</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: '#f8fafc', borderRadius: 12, padding: '0.85rem 1rem', border: '1.5px solid #e5e7eb' }}>
              <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700 }}>{ACCOUNT_NAME}</span>
              <button onClick={() => copyToClipboard(ACCOUNT_NAME, 'name')}
                style={{ background: copiedField === 'name' ? '#d1fae5' : '#eef2ff', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                {copiedField === 'name' ? <Check size={16} color="#059669" /> : <Copy size={16} color="#4f46e5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ background: 'white', borderRadius: 18, padding: '1.75rem', marginBottom: '1.25rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ color: '#111827', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 1rem' }}>Ödeme Adımları</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { n: 1, text: 'Bankanızın mobil uygulamasından veya internet şubesinden havale/EFT yapın' },
              { n: 2, text: 'Alıcı IBAN ve adı olarak yukarıdaki bilgileri girin' },
              { n: 3, text: 'Açıklamaya mutlaka 5 haneli kodunuzu yazın (ödemeniz bu koda göre eşleştirilir)' },
              { n: 4, text: 'Ödeme alındıktan sonra admin tarafından Pro aboneliğiniz aktifleştirilir' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                <span style={{ color: '#374151', fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '1rem 1.25rem', background: '#eff6ff', borderRadius: 12, border: '1.5px solid #bfdbfe' }}>
          <AlertCircle size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: '#1e40af', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
            Ödemeniz bankaya ulaştıktan sonra admin tarafından kontrol edilir ve onaylanır. Bu işlem genellikle birkaç saat içinde tamamlanır. Sorularınız için destek@edutakip.com adresine yazabilirsiniz.
          </p>
        </div>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Geri Dön
        </button>
      </div>
    </div>
  );
}