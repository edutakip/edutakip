import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { sendParentInviteFull } from '@/lib/parentInviteEmail';

export default function InviteMethodPopup({ student, onClose }) {
  const { i18n, t } = useTranslation();
  const isEn = i18n.language === 'en';
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error' | null

  const handleWhatsApp = () => {
    const appUrl = 'https://edutakip.com';
    const msg = encodeURIComponent(
      `Merhaba 👋\n\n` +
      `Ben öğretmeniniz. ${student.name}'in ders sürecini daha düzenli takip edebilmeniz için sizi EduTakip platformuna davet ediyorum.\n\n` +
      `EduTakip, velilerin öğrencilerin derslerini, ödevlerini ve gelişimlerini takip edebilmesi için aylar süren çalışmalar sonucunda geliştirdiğim bir sistemdir.\n\n` +
      `Platform üzerinden:\n` +
      `📚 İşlenen dersleri\n` +
      `📝 Verilen ödevleri\n` +
      `📊 Gelişim durumunu\n` +
      `💳 Ödeme bilgisini\n\n` +
      `tek bir yerden takip edebilirsiniz.\n\n` +
      `Önce hesap oluşturun ardından aşağıdaki davet kodunu girin.\n\n` +
      `🔑 Davet kodunuz: ${student.inviteCode}\n\n` +
      `Giriş: ${appUrl}`
    );
    const phone = student.parentPhone?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    } else {
      navigator.clipboard.writeText(
        `Merhaba! ${student.name} için EduTakip platformuna davet edildiniz.\n\n` +
        `Davet kodunuz: ${student.inviteCode}\n\n` +
        `Giriş: ${appUrl}`
      );
      alert(isEn ? 'No parent phone — invite message copied to clipboard.' : 'Veli telefonu yok — davet mesajı panoya kopyalandı.');
    }
    onClose();
  };

  const handleEmail = async () => {
    if (!student.parentEmail) {
      setResult('error');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const me = await base44.auth.me();
      const teacherName = me.full_name || me.email;
      await sendParentInviteFull({ student, teacherName, isEn });
      setResult('success');
    } catch (e) {
      console.error('E-posta daveti gönderilemedi:', e);
      setResult('error');
    }
    setSending(false);
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1a1535, #1e1b4b)',
          borderRadius: '20px', width: '100%', maxWidth: '400px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          padding: '1.75rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {isEn ? 'Send Invite' : 'Davet Gönder'}
          </h2>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {isEn ? `Choose how to invite ${student.parentName || student.name}'s parent.` : `${student.parentName || student.name} velisini nasıl davet etmek istersiniz?`}
        </p>

        {/* Result feedback */}
        {result === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px' }}>
            <CheckCircle size={16} color='#22c55e' />
            <span style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 600 }}>
              {isEn ? 'Invite email sent successfully!' : 'Davet e-postası başarıyla gönderildi!'}
            </span>
          </div>
        )}
        {result === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}>
            <AlertCircle size={16} color='#f87171' />
            <span style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
              {isEn ? 'No parent email — add one via Edit.' : 'Veli e-postası yok — Düzenle ile ekleyin.'}
            </span>
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* WhatsApp */}
          <button onClick={handleWhatsApp}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: '14px', cursor: 'pointer',
              background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.4)',
              color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.22)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>{isEn ? 'WhatsApp Invite' : 'WhatsApp ile Davet'}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                {student.parentPhone || (isEn ? 'No phone — will copy' : 'Telefon yok — kopyalanır')}
              </div>
            </div>
          </button>

          {/* Email */}
          <button onClick={handleEmail} disabled={sending}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: '14px', cursor: sending ? 'not-allowed' : 'pointer',
              background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.15s',
              opacity: sending ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
            onMouseLeave={e => { if (!sending) { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'scale(1)'; } }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sending ? <Loader2 size={20} className='animate-spin' /> : <Mail size={20} />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>{isEn ? 'Email Invite' : 'E-posta ile Davet'}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                {student.parentEmail || (isEn ? 'No email' : 'E-posta yok')}
              </div>
            </div>
          </button>
        </div>

        {result === 'success' && (
          <button onClick={onClose}
            style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            {isEn ? 'Close' : 'Kapat'}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}