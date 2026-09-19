import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Download, Mail, MessageCircle, Loader2, FileText, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { sendReceiptEmail } from '@/lib/receiptEmail';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png';

export default function PaymentReceiptModal({ payment, student, onClose }) {
  const receiptRef = useRef(null);
  const [teacher, setTeacher] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setTeacher).catch(() => {});
  }, []);

  const receiptNo = `EDT-${(payment.date || '').replace(/-/g, '')}-${(payment.id || '').slice(-6).toUpperCase()}`;

  const formatDate = (dateStr) => {
    try { return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr }); } catch { return dateStr; }
  };

  const methodLabel = { nakit: 'Nakit', havale: 'Havale/EFT', diger: 'Diğer' }[payment.method] || payment.method || '-';
  const hasParentEmail = !!(student?.parentEmail);
  const hasParentPhone = !!(student?.parentPhone);

  const generateCanvas = async () => {
    if (!receiptRef.current) return null;
    return await html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
  };

  const downloadPNG = async () => {
    setDownloading(true);
    setError(null);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `makbuz-${receiptNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      setError('Görsel oluşturulurken hata oluştu.');
    } finally {
      setDownloading(false);
      setShowFormats(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    setError(null);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`makbuz-${receiptNo}.pdf`);
    } catch (e) {
      setError('PDF oluşturulurken hata oluştu.');
    } finally {
      setDownloading(false);
      setShowFormats(false);
    }
  };

  const handleSendEmail = async () => {
    if (!hasParentEmail) return;
    setEmailSending(true);
    setError(null);
    try {
      await sendReceiptEmail({
        parentEmail: student.parentEmail,
        parentName: student.parentName,
        teacherName: teacher?.full_name || '',
        studentName: payment.studentName || student?.name,
        subject: student?.subject || '',
        amount: payment.amount,
        date: payment.date,
        method: methodLabel,
        description: payment.description,
        receiptNo,
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (e) {
      setError('E-posta gönderilemedi.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!hasParentPhone) return;
    setWhatsappSending(true);
    setError(null);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `makbuz-${receiptNo}.png`, { type: 'image/png' });

      const message = `Merhaba ${student.parentName || ''},\n\n${payment.studentName || student?.name} için ödeme makbuzunuz hazırdır.\n\nTutar: ₺${(payment.amount || 0).toLocaleString('tr-TR')}\nTarih: ${formatDate(payment.date)}\nYöntem: ${methodLabel}\nMakbuz No: ${receiptNo}\n\n─────────────────\nEduTakip`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: message, title: 'Ödeme Makbuzu' });
      } else {
        // Fallback: download image + open wa.me
        const link = document.createElement('a');
        link.download = `makbuz-${receiptNo}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        const cleaned = student.parentPhone.replace(/\D/g, '');
        const formatted = cleaned.startsWith('0') ? '90' + cleaned.slice(1) : cleaned;
        const url = 'https://api.whatsapp.com/send?phone=' + formatted + '&text=' + encodeURIComponent(message);
        window.open(url, '_blank');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') setError('WhatsApp paylaşımı başarısız.');
    } finally {
      setWhatsappSending(false);
    }
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '0.8rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
    fontWeight: '700', fontSize: '0.88rem', transition: 'all 0.15s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <h2 style={{ color: '#111827', fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Ödeme Makbuzu</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>{receiptNo}</p>
          </div>
          <button onClick={onClose}
            style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div ref={receiptRef} style={{ width: '100%', maxWidth: '360px', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {/* Gradient header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)', padding: '1.75rem 1.5rem', textAlign: 'center' }}>
              <img src={LOGO_URL} alt="EduTakip" style={{ width: '44px', height: '44px', borderRadius: '11px', margin: '0 auto 0.6rem', display: 'block' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>EduTakip</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', margin: '0.15rem 0 0' }}>Ödeme Makbuzu</p>
            </div>

            {/* Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Receipt no */}
              <div style={{ background: '#eef2ff', borderRadius: '10px', padding: '0.6rem', textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ color: '#4338ca', fontSize: '0.58rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Makbuz No</p>
                <p style={{ color: '#1e1b4b', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '2px', fontFamily: 'Courier New, monospace', margin: '0.2rem 0 0' }}>{receiptNo}</p>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: 0 }}>Öğretmen</p>
                  <p style={{ color: '#1e1b4b', fontSize: '0.82rem', fontWeight: '700', margin: '0.1rem 0 0' }}>{teacher?.full_name || '-'}</p>
                </div>
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: 0 }}>Öğrenci</p>
                  <p style={{ color: '#1e1b4b', fontSize: '0.82rem', fontWeight: '700', margin: '0.1rem 0 0' }}>
                    {payment.studentName || student?.name || '-'}{student?.subject ? ' · ' + student.subject : ''}
                  </p>
                </div>
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: 0 }}>Ödeme Tarihi</p>
                  <p style={{ color: '#374151', fontSize: '0.82rem', fontWeight: '600', margin: '0.1rem 0 0' }}>{formatDate(payment.date)}</p>
                </div>
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: 0 }}>Ödeme Yöntemi</p>
                  <p style={{ color: '#374151', fontSize: '0.82rem', fontWeight: '600', margin: '0.1rem 0 0' }}>{methodLabel}</p>
                </div>
                {payment.description && (
                  <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: 0 }}>Açıklama</p>
                    <p style={{ color: '#374151', fontSize: '0.78rem', margin: '0.1rem 0 0' }}>{payment.description}</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', borderRadius: '12px', padding: '0.85rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Toplam Tutar</span>
                <span style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '900' }}>₺{(payment.amount || 0).toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#f8fafc', padding: '0.6rem 1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.58rem', margin: 0 }}>Bu makbuz EduTakip tarafından oluşturulmuştur.</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin: '0 1.5rem 0.75rem', padding: '0.6rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={14} color='#ef4444' />
            <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Download with format selector */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowFormats(v => !v)} disabled={downloading}
              style={{ ...btnBase, width: '100%', background: downloading ? '#e5e7eb' : 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', cursor: downloading ? 'not-allowed' : 'pointer' }}>
              {downloading ? <><Loader2 size={16} /> Oluşturuluyor...</> : <><Download size={16} /> İndir</>}
            </button>
            {showFormats && !downloading && (
              <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                <button onClick={downloadPDF} style={{ width: '100%', padding: '0.7rem 1rem', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151', borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <FileText size={16} color='#ef4444' /> PDF olarak indir
                </button>
                <button onClick={downloadPNG} style={{ width: '100%', padding: '0.7rem 1rem', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <ImageIcon size={16} color='#6366f1' /> PNG görsel indir
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <button onClick={handleSendEmail} disabled={!hasParentEmail || emailSending}
            style={{ ...btnBase, width: '100%', background: !hasParentEmail ? '#f3f4f6' : emailSent ? '#d1fae5' : '#eef2ff', color: !hasParentEmail ? '#d1d5db' : emailSent ? '#16a34a' : '#4f46e5', cursor: !hasParentEmail || emailSending ? 'not-allowed' : 'pointer', border: hasParentEmail ? '1.5px solid #c7d2fe' : '1.5px solid #e5e7eb' }}
            onMouseEnter={e => { if (hasParentEmail && !emailSending && !emailSent) e.currentTarget.style.background = '#e0e7ff'; }}
            onMouseLeave={e => { if (hasParentEmail && !emailSending && !emailSent) e.currentTarget.style.background = '#eef2ff'; }}>
            {emailSending ? <><Loader2 size={16} /> Gönderiliyor...</> : emailSent ? <><Check size={16} /> E-posta gönderildi</> : <><Mail size={16} /> E-posta Gönder {!hasParentEmail && '(veli e-postası yok)'}</>}
          </button>

          {/* WhatsApp */}
          <button onClick={handleSendWhatsApp} disabled={!hasParentPhone || whatsappSending}
            style={{ ...btnBase, width: '100%', background: !hasParentPhone ? '#f3f4f6' : '#dcfce7', color: !hasParentPhone ? '#d1d5db' : '#16a34a', cursor: !hasParentPhone || whatsappSending ? 'not-allowed' : 'pointer', border: hasParentPhone ? '1.5px solid #bbf7d0' : '1.5px solid #e5e7eb' }}
            onMouseEnter={e => { if (hasParentPhone && !whatsappSending) e.currentTarget.style.background = '#bbf7d0'; }}
            onMouseLeave={e => { if (hasParentPhone && !whatsappSending) e.currentTarget.style.background = '#dcfce7'; }}>
            {whatsappSending ? <><Loader2 size={16} /> Görsel oluşturuluyor...</> : <><MessageCircle size={16} /> WhatsApp ile Gönder {!hasParentPhone && '(veli telefonu yok)'}</>}
          </button>

          {/* Close */}
          <button onClick={onClose} style={{ ...btnBase, width: '100%', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb', cursor: 'pointer' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}