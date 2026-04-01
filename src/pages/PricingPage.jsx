import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const PER_STUDENT = 50;
const VAT_RATE = 0.20;

export default function PricingPage() {
  const { t } = useTranslation();
  const [studentCount, setStudentCount] = useState(10);
  const totalNet = studentCount * PER_STUDENT;
  const totalVat = Math.round(totalNet * VAT_RATE);
  const totalGross = totalNet + totalVat;
  const sliderPct = ((studentCount - 1) / (60 - 1)) * 100;

  const freeFeatures = t('pricingPage.free.features', { returnObjects: true });
  const proFeatures = t('pricingPage.pro.features', { returnObjects: true });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <nav style={{ background: 'rgba(15,23,42,0.97)', padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>EduTakip</span>
        </a>
        <LanguageSwitcher />
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', color: '#6d28d9', fontWeight: 800, fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 2, borderRadius: 25, padding: '.4rem 1.1rem', marginBottom: '1rem' }}>{t('pricingPage.badge')}</span>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#111827', marginBottom: '.75rem', letterSpacing: '-.8px' }}>{t('pricingPage.title')}</h1>
          <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>{t('pricingPage.subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 28, alignItems: 'start' }}>
          {/* Free */}
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '.25rem' }}>{t('pricingPage.free.name')}</h3>
            <p style={{ fontSize: '.82rem', color: '#9ca3af', marginBottom: '1rem' }}>{t('pricingPage.free.desc')}</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111827' }}>₺0</span>
              <span style={{ fontSize: '.85rem', color: '#9ca3af', marginLeft: '.4rem' }}>/ {t('pricingPage.free.period')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.75rem' }}>
              {Array.isArray(freeFeatures) && freeFeatures.map(f =>
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <CheckCircle size={15} color='#10b981' />
                  <span style={{ fontSize: '.85rem', color: '#374151' }}>{f}</span>
                </div>
              )}
            </div>
            <a href="/" style={{ display: 'block', width: '100%', padding: '.85rem', borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none', boxSizing: 'border-box' }}>
              {t('pricingPage.free.cta')}
            </a>
          </div>

          {/* Pro */}
          <div style={{ background: 'white', borderRadius: 22, padding: '2rem', border: '1.5px solid #ddd6fe', boxShadow: '0 16px 48px rgba(79,70,229,.14)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontSize: '.72rem', fontWeight: 800, padding: '.35rem .9rem', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(249,115,22,.3)' }}>
              {t('pricingPage.pro.badge')}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '.6rem' }}>{t('pricingPage.pro.title')}</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '.4rem', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                  {totalNet.toLocaleString('tr-TR')}₺
                </span>
              </div>
              <span style={{ display: 'inline-block', padding: '.2rem .75rem', borderRadius: 999, border: '1px solid #e5e7eb', fontSize: '.82rem', color: '#6b7280' }}>
                {PER_STUDENT}₺ / {t('pricingPage.pro.perStudent')}
              </span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.85rem' }}>
                <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '.95rem' }}>{t('pricingPage.pro.studentCountLabel')}</span>
                <span style={{ color: '#f97316', fontWeight: 900, fontSize: '1.25rem' }}>{studentCount}</span>
              </div>
              <div style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 999, background: '#e5e7eb' }} />
                <div style={{ position: 'absolute', left: 0, width: `${sliderPct}%`, height: 8, borderRadius: 999, background: 'linear-gradient(90deg,#f59e0b,#f97316)', transition: 'width .2s' }} />
                <input type='range' min={1} max={60} value={studentCount} onChange={e => setStudentCount(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', opacity: 0, position: 'relative', zIndex: 3 }} />
                <div style={{ position: 'absolute', left: `calc(${sliderPct}% - 12px)`, width: 24, height: 24, borderRadius: '50%', background: 'white', border: '3px solid #f97316', transition: 'left .2s', pointerEvents: 'none', zIndex: 2 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '.85rem', textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '.75rem', fontWeight: 700, marginBottom: '.25rem' }}>{t('pricingPage.pro.netAmount')}</div>
                <div style={{ color: '#111827', fontSize: '1.55rem', fontWeight: 900 }}>{totalNet.toLocaleString('tr-TR')}₺</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '.85rem', textAlign: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '.75rem', fontWeight: 700, marginBottom: '.25rem' }}>{t('pricingPage.pro.vat')}</div>
                <div style={{ color: '#6366f1', fontSize: '1.55rem', fontWeight: 900 }}>{totalVat.toLocaleString('tr-TR')}₺</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 12, padding: '.85rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ color: 'rgba(255,255,255,.8)', fontSize: '.75rem', fontWeight: 700, marginBottom: '.2rem' }}>{t('pricingPage.pro.total')}</div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>{totalGross.toLocaleString('tr-TR')}₺</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginBottom: '1.25rem' }}>
              {Array.isArray(proFeatures) && proFeatures.map(f =>
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <CheckCircle size={13} color='#10b981' />
                  <span style={{ color: '#374151', fontSize: '.8rem', fontWeight: 600 }}>{f}</span>
                </div>
              )}
            </div>

            <a href="/" style={{ display: 'block', width: '100%', padding: '.95rem', borderRadius: 999, textAlign: 'center', background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 10px 20px rgba(249,115,22,.28)', boxSizing: 'border-box' }}>
              {t('pricingPage.pro.cta')}
            </a>
            <p style={{ margin: '.6rem 0 0', textAlign: 'center', color: '#9ca3af', fontSize: '.8rem' }}>{t('pricingPage.pro.noCard')}</p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64, background: 'white', borderRadius: 20, padding: '2rem', border: '1.5px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>{t('pricingPage.faq.title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1.5rem' }}>
            {[
              { q: t('pricingPage.faq.q1'), a: t('pricingPage.faq.a1') },
              { q: t('pricingPage.faq.q2'), a: t('pricingPage.faq.a2') },
              { q: t('pricingPage.faq.q3'), a: t('pricingPage.faq.a3') },
              { q: t('pricingPage.faq.q4'), a: t('pricingPage.faq.a4') },
            ].map(({ q, a }) =>
              <div key={q}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#111827', marginBottom: '.4rem' }}>{q}</div>
                <div style={{ fontSize: '.85rem', color: '#6b7280', lineHeight: 1.6 }}>{a}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,.5)', padding: '24px 5%', textAlign: 'center', fontSize: '.82rem' }}>
        <span>{t('footer.copyright')} </span>
        <a href="/terms" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>{t('footer.terms')}</a>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>{t('footer.privacyPolicy')}</a>
        <a href="/refund" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>{t('footer.refund')}</a>
      </footer>
    </div>
  );
}