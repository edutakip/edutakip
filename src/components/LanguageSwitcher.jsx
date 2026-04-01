import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ style = {} }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('tr') ? 'tr' : 'en';

  const toggle = () => {
    const next = current === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: 'rgba(255,255,255,0.12)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        color: 'rgba(255,255,255,0.85)',
        borderRadius: 8,
        padding: '6px 12px',
        fontWeight: 700,
        fontSize: '0.82rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        letterSpacing: 0.5,
        transition: 'all 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
    >
      {current === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
    </button>
  );
}