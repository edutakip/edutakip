import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { usePageMeta } from '../hooks/usePageMeta';

export default function RefundPolicy() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const sections = t('refund.sections', { returnObjects: true });

  usePageMeta({
    title: isEnglish ? 'EduTakip Refund Policy' : 'EduTakip İade Politikası',
    description: isEnglish
      ? 'EduTakip refund policy: Payment refunds, cancellation terms, and refund processes.'
      : 'EduTakip iade politikası: Ödeme iadeleri, iptal koşulları ve para iade süreçleri.',
    canonical: 'https://edutakip.com/refund'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <nav style={{ background: 'rgba(15,23,42,0.97)', padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>EduTakip</span>
        </a>
        <LanguageSwitcher />
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 5%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '.5rem' }}>{t('refund.title')}</h1>
        <p style={{ color: '#9ca3af', fontSize: '.85rem', marginBottom: '2.5rem' }}>{t('refund.updated')}</p>

        {Array.isArray(sections) && sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '.6rem' }}>{title}</h2>
            <p style={{ fontSize: '.92rem', color: '#374151', lineHeight: 1.75 }}>{body}</p>
          </div>
        ))}
      </div>

      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,.5)', padding: '24px 5%', textAlign: 'center', fontSize: '.82rem' }}>
        <span>{t('footer.copyright')} </span>
        <a href="/terms" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>{t('footer.terms')}</a>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>{t('footer.privacyPolicy')}</a>
      </footer>
    </div>
  );
}