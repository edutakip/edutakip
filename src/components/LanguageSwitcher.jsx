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
      <span style={{ fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
        {current === 'tr' ? '🇬🇧' : '🇹🇷'}
      </span>
      {current === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}