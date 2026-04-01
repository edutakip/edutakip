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
        background: 'rgba(99,102,241,0.1)',
        border: '1.5px solid rgba(99,102,241,0.25)',
        color: '#4f46e5',
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
    >
      {current === 'tr' ? (
        <svg width="20" height="14" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="40" fill="#012169"/>
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8"/>
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5"/>
          <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12"/>
          <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8"/>
        </svg>
      ) : (
        <svg width="20" height="14" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="20" fill="#E30A17"/>
          <circle cx="12" cy="10" r="6" fill="#fff"/>
          <circle cx="14" cy="10" r="5" fill="#E30A17"/>
          <polygon points="18,10 22,8 22,12" fill="#fff"/>
        </svg>
      )}
      {current === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}