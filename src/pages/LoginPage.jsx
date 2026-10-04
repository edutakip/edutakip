import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Mail, Lock, Eye, EyeOff, TrendingUp, Wallet, BookOpen, MessageCircle, Users, Calendar, ArrowRight, GraduationCap, User, Star } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png';

export default function LoginPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState(searchParams.get('mode') || 'login'); // 'login' | 'register' | 'forgot' | 'verify'
  const [otp, setOtp] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        const savedRole = localStorage.getItem('tilki_role') || role;
        localStorage.setItem('tilki_role', savedRole);
        window.location.href = `/${savedRole === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard'}`;
      }
    }).catch(() => {});
  }, []);

  const redirectAfterAuth = () => {
    localStorage.setItem('tilki_role', role);
    const redirectPage = role === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard';
    window.location.href = `/${redirectPage}`;
  };

  const handleGoogleLogin = () => {
    setError('');
    setInfo('');
    localStorage.setItem('tilki_role', role);
    const fromUrl = window.location.origin + '/giris';
    base44.auth.loginWithProvider('google', fromUrl);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');
    if (mode === 'forgot') {
      if (!email) { setError(isEn ? 'Please enter your email' : 'Lütfen e-postanızı girin'); return; }
      setLoading(true);
      try {
        await base44.auth.resetPasswordRequest(email);
        setInfo(isEn ? 'Password reset link sent! Check your email.' : 'Şifre sıfırlama bağlantısı gönderildi! E-postanızı kontrol edin.');
      } catch (err) {
        setError(isEn ? 'Failed to send reset email.' : 'Sıfırlama e-postası gönderilemedi.');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (mode === 'verify') {
      if (!otp || otp.length !== 6) { setError(isEn ? 'Please enter the 6-digit code' : '6 haneli doğrulama kodunu girin'); return; }
      setLoading(true);
      try {
        await base44.auth.verifyOtp({ email, otpCode: otp });
        await base44.auth.loginViaEmailPassword(email, password);
        redirectAfterAuth();
      } catch (err) {
        setError(isEn ? 'Invalid code. Please try again.' : 'Geçersiz kod. Tekrar deneyin.');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!email || !password) { setError(isEn ? 'Please fill in all fields' : 'Lütfen tüm alanları doldurun'); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        await base44.auth.register({ email, password });
        setMode('verify');
        setInfo(isEn ? 'A 6-digit verification code was sent to your email. Enter it below.' : 'E-postanıza 6 haneli doğrulama kodu gönderildi. Aşağıya girin.');
        setOtp('');
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
        redirectAfterAuth();
      }
    } catch (err) {
      if (mode === 'register') {
        setError(isEn ? 'Registration failed. This email may already be registered.' : 'Kayıt başarısız. Bu e-posta zaten kayıtlı olabilir.');
      } else {
        setError(isEn ? 'Invalid email or password.' : 'Geçersiz e-posta veya şifre.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMobile = windowWidth < 1024;

  const t = isEn ? {
    badge: 'EDUTAKIP TEACHER',
    headline1: 'You focus on teaching,',
    headline2: 'EduTakip',
    headline3: 'handles the rest.',
    pills: [
      { icon: TrendingUp, label: 'Revenue Report' },
      { icon: Wallet, label: 'Payment Tracking' },
      { icon: BookOpen, label: 'Homework Tracking' },
      { icon: MessageCircle, label: 'WhatsApp' },
      { icon: Users, label: 'Parent Communication' },
      { icon: Calendar, label: 'Lesson Calendar' },
    ],
    testimonials: [
      { text: 'Discipline is invisible thanks to it.', name: 'Zeynep', role: 'Math Teacher' },
      { text: '5 stars is not enough, deserves 10.', name: 'Ahmet', role: 'LGS Teacher' },
      { text: 'This year I solved it with EduTakip.', name: 'Şevval', role: 'Math Teacher' },
    ],
    statBadge: '3,500+ lessons tracked on EduTakip',
    welcome: 'Welcome!',
    subheadline: 'Sign in to your account and continue.',
    emailLabel: 'Email',
    emailPlaceholder: 'teacher@email.com',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    orContinueWith: 'or',
    googleLogin: 'Continue with Google',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up Now',
    teacher: 'Teacher',
    parent: 'Parent',
    infoNote: 'You will be redirected to EduTakip secure login.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    backHome: '← Back to home',
    registerTitle: 'Create Account',
    registerSub: 'Sign up to get started with EduTakip.',
    registerBtn: 'Sign Up',
    forgotTitle: 'Forgot Password',
    forgotSub: 'Enter your email to receive a reset link.',
    forgotBtn: 'Send Reset Link',
    verifyTitle: 'Verify Your Email',
    verifySub: 'Enter the 6-digit code sent to your email.',
    verifyLabel: 'Verification Code',
    verifyPlaceholder: '6-digit code',
    verifyBtn: 'Verify & Continue',
    resendCode: 'Resend code',
    backToLogin: '← Back to login',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign In',
    fillEmail: 'Please enter your email',
    errGeneric: 'Something went wrong. Please try again.',
  } : {
    badge: 'EDUTAKIP ÖĞRETMEN',
    headline1: 'Siz dersinizi anlatın,',
    headline2: 'gerisini',
    headline3: 'EduTakip halletsin.',
    pills: [
      { icon: TrendingUp, label: 'Kazanç Raporu' },
      { icon: Wallet, label: 'Ödeme Takibi' },
      { icon: BookOpen, label: 'Ödev Takibi' },
      { icon: MessageCircle, label: 'WhatsApp' },
      { icon: Users, label: 'Veli İletişimi' },
      { icon: Calendar, label: 'Ders Takvimi' },
    ],
    testimonials: [
      { text: 'Artık zorunda disiplini görünmüyor.', name: 'Zeynep', role: 'Matematik Öğretmeni' },
      { text: '5 yıldız yetersiz, 10 yıldız hak eden bir uygulama.', name: 'Ahmet', role: 'LGS Öğretmeni' },
      { text: 'Bu sene EduTakip ile çözdüm.', name: 'Şevval', role: 'Matematik Öğretmeni' },
    ],
    statBadge: "3.500+ ders EduTakip'te kaydedildi",
    welcome: 'Hoş Geldin!',
    subheadline: 'Hesabına giriş yap ve devam et.',
    emailLabel: 'E-posta',
    emailPlaceholder: 'ogretmen@email.com',
    passwordLabel: 'Şifre',
    forgotPassword: 'Şifremi Unuttum?',
    passwordPlaceholder: 'Şifrenizi girin',
    signIn: 'Giriş Yap',
    orContinueWith: 'veya',
    googleLogin: 'Google ile giriş yap',
    noAccount: 'Hesabın yok mu?',
    signUp: 'Hemen Kayıt Ol',
    teacher: 'Öğretmen',
    parent: 'Veli',
    infoNote: 'EduTakip güvenli giriş sayfasına yönlendirileceksiniz.',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları',
    backHome: '← Ana sayfaya dön',
    registerTitle: 'Hesap Oluştur',
    registerSub: 'EduTakip ile başlamak için kaydolun.',
    registerBtn: 'Kayıt Ol',
    forgotTitle: 'Şifremi Unuttum',
    forgotSub: 'Sıfırlama bağlantısı almak için e-postanızı girin.',
    forgotBtn: 'Sıfırlama Bağlantısı Gönder',
    verifyTitle: 'E-postanı Doğrula',
    verifySub: 'E-postanıza gönderilen 6 haneli kodu girin.',
    verifyLabel: 'Doğrulama Kodu',
    verifyPlaceholder: '6 haneli kod',
    verifyBtn: 'Doğrula ve Devam Et',
    resendCode: 'Kodu tekrar gönder',
    backToLogin: '← Girişe dön',
    haveAccount: 'Zaten hesabın var mı?',
    signInLink: 'Giriş Yap',
    fillEmail: 'Lütfen e-postanızı girin',
    errGeneric: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
  };

  return (
    <>
      <style>{`
        @keyframes orbit-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-counter { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .login-pill {
          animation: float-gentle 3.5s ease-in-out infinite;
        }
        .login-fade-in { animation: fade-in-up 0.6s ease both; }
        .login-input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important; }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(79,70,229,0.4) !important; }
        .login-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .role-tab { transition: all 0.2s ease; }
        .role-tab.active { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

        {/* ── LEFT SIDE (Branding) ── */}
        {!isMobile && (
          <div style={{
            flex: 1,
            background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 40%, #e0e7ff 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '3rem 4rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative blurs */}
            <div style={{ position: 'absolute', top: -100, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(79,70,229,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            {/* Badge */}
            <div style={{ animation: 'fade-in-up 0.5s ease both', marginBottom: '1.5rem' }}>
              <span style={{
                color: '#7c3aed', fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '3px', textTransform: 'uppercase',
              }}>
                {t.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)',
              fontWeight: 900,
              color: '#1a1a1a',
              lineHeight: 1.25,
              marginBottom: '2.5rem',
              maxWidth: 420,
              animation: 'fade-in-up 0.6s ease 0.1s both',
            }}>
              {t.headline1}{' '}
              <span style={{ color: '#7c3aed' }}>{t.headline2}</span>{' '}{t.headline3}
            </h1>

            {/* Orbit System */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: 340,
              animation: 'fade-in-up 0.7s ease 0.2s both',
            }}>
              {/* Outer ring (rotating) */}
              <div style={{
                position: 'absolute',
                width: 340,
                height: 340,
                borderRadius: '50%',
                border: '2px dashed rgba(124,58,237,0.25)',
                animation: 'spin-slow 40s linear infinite',
              }} />

              {/* Inner ring (counter-rotating) */}
              <div style={{
                position: 'absolute',
                width: 250,
                height: 250,
                borderRadius: '50%',
                border: '1.5px dashed rgba(79,70,229,0.2)',
                animation: 'spin-slow 30s linear infinite reverse',
              }} />

              {/* Center logo */}
              <div style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(79,70,229,0.35)',
                animation: 'pulse-soft 3s ease-in-out infinite',
              }}>
                <img src={LOGO} alt="EduTakip" style={{ width: 56, height: 56, borderRadius: '14px', objectFit: 'cover' }} />
              </div>

              {/* Orbiting pills */}
              {t.pills.map((pill, i) => {
                const angle = i * 60;
                const Icon = pill.icon;
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    transform: `rotate(${angle}deg) translateX(165px) rotate(-${angle}deg)`,
                  }}>
                    <div className="login-pill" style={{
                      animationDelay: `${i * 0.4}s`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: 'translate(-50%, -50%)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'white',
                        padding: '0.5rem 0.9rem',
                        borderRadius: 50,
                        boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
                        border: '1px solid rgba(124,58,237,0.1)',
                        whiteSpace: 'nowrap',
                      }}>
                        <Icon size={14} color="#7c3aed" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>{pill.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Testimonials */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              animation: 'fade-in-up 0.7s ease 0.3s both',
            }}>
              {t.testimonials.map((tc, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: 14,
                  padding: '0.85rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(124,58,237,0.08)',
                }}>
                  <div style={{ display: 'flex', gap: 1, marginBottom: '0.4rem' }}>
                    {[0,1,2,3,4].map(s => <Star key={s} size={10} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.4rem', fontStyle: 'italic' }}>
                    "{tc.text}"
                  </p>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#374151' }}>
                    {tc.name} <span style={{ color: '#9ca3af', fontWeight: 400 }}>· {tc.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stat badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              padding: '0.5rem 1.1rem',
              borderRadius: 50,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid rgba(124,58,237,0.08)',
              alignSelf: 'flex-start',
              animation: 'fade-in-up 0.7s ease 0.4s both',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-soft 2s infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{t.statBadge}</span>
            </div>
          </div>
        )}

        {/* ── RIGHT SIDE (Login Form) ── */}
        <div style={{
          flex: 1,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '2rem 1.5rem' : '3rem 4rem',
          position: 'relative',
        }}>
          {/* Top bar: logo + language */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'auto',
            animation: 'fade-in-up 0.5s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src={LOGO} alt="EduTakip" style={{ width: 36, height: 36, borderRadius: 10 }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a1a1a' }}>EduTakip</span>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Form container */}
          <div style={{
            maxWidth: 380,
            width: '100%',
            margin: 'auto 0',
            animation: 'fade-in-up 0.6s ease 0.1s both',
          }}>
            {/* Heading */}
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '0.5rem' }}>
              {mode === 'login' ? t.welcome : mode === 'register' ? t.registerTitle : mode === 'verify' ? t.verifyTitle : t.forgotTitle}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1.75rem' }}>
              {mode === 'login' ? t.subheadline : mode === 'register' ? t.registerSub : mode === 'verify' ? t.verifySub : t.forgotSub}
            </p>

            {/* Role toggle (hidden in forgot mode) */}
            {mode !== 'forgot' && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                padding: '0.3rem',
                background: '#f4f4f5',
                borderRadius: 12,
              }}>
                <button
                  onClick={() => setRole('teacher')}
                  className={`role-tab ${role === 'teacher' ? 'active' : ''}`}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem', padding: '0.6rem', borderRadius: 9, border: 'none',
                    background: role === 'teacher' ? '' : 'transparent',
                    color: role === 'teacher' ? '' : '#71717a',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  <GraduationCap size={16} />
                  {t.teacher}
                </button>
                <button
                  onClick={() => setRole('parent')}
                  className={`role-tab ${role === 'parent' ? 'active' : ''}`}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem', padding: '0.6rem', borderRadius: 9, border: 'none',
                    background: role === 'parent' ? '' : 'transparent',
                    color: role === 'parent' ? '' : '#71717a',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  <User size={16} />
                  {t.parent}
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                marginBottom: '1rem', padding: '0.7rem 0.85rem',
                background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.85rem' }}>⚠️</span>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {/* Info message */}
            {info && (
              <div style={{
                marginBottom: '1rem', padding: '0.7rem 0.85rem',
                background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.85rem' }}>✅</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>{info}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* OTP (verify mode) */}
              {mode === 'verify' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                    {t.verifyLabel} <span style={{ color: '#7c3aed', fontWeight: 600 }}>({email})</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t.verifyPlaceholder}
                    maxLength={6}
                    autoFocus
                    className="login-input"
                    style={{
                      width: '100%', padding: '0.8rem 0.85rem', borderRadius: 12, border: '1.5px solid #e5e7eb',
                      fontSize: '1.3rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.5rem', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
              {/* Email */}
              {mode !== 'verify' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                  {t.emailLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="login-input"
                    style={{
                      width: '100%', padding: '0.8rem 0.85rem 0.8rem 2.5rem',
                      borderRadius: 12, border: '1.5px solid #e5e7eb',
                      fontSize: '0.9rem', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              )}

              {/* Password (hidden in forgot/verify mode) */}
              {mode !== 'forgot' && mode !== 'verify' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>
                      {t.passwordLabel}
                    </label>
                    {mode === 'login' && (
                      <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setInfo(''); setMode('forgot'); }} style={{
                        fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', textDecoration: 'none',
                      }}>
                        {t.forgotPassword}
                      </a>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="login-input"
                      style={{
                        width: '100%', padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                        borderRadius: 12, border: '1.5px solid #e5e7eb',
                        fontSize: '0.9rem', outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        fontFamily: 'inherit', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      style={{
                        position: 'absolute', right: '0.85rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: '#9ca3af',
                        padding: 0, display: 'flex',
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
                  background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white', fontWeight: 800, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} />
                    {isEn ? 'Loading...' : 'Yükleniyor...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? t.signIn : mode === 'register' ? t.registerBtn : mode === 'verify' ? t.verifyBtn : t.forgotBtn}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Google Login (login & register modes only) */}
            {mode !== 'forgot' && mode !== 'verify' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>{t.orContinueWith}</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  style={{
                    width: '100%', padding: '0.85rem', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', background: 'white',
                    color: '#374151', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t.googleLogin}
                </button>
              </>
            )}

            {/* Mode switch links */}
            {mode === 'login' && (
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#71717a' }}>
                {t.noAccount}{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setInfo(''); setMode('register'); }} style={{
                  fontWeight: 700, color: '#7c3aed', textDecoration: 'none',
                }}>
                  {t.signUp}
                </a>
              </p>
            )}
            {mode === 'register' && (
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#71717a' }}>
                {t.haveAccount}{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setInfo(''); setMode('login'); }} style={{
                  fontWeight: 700, color: '#7c3aed', textDecoration: 'none',
                }}>
                  {t.signInLink}
                </a>
              </p>
            )}
            {mode === 'forgot' && (
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#71717a' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setInfo(''); setMode('login'); }} style={{
                  fontWeight: 700, color: '#7c3aed', textDecoration: 'none',
                }}>
                  {t.backToLogin}
                </a>
              </p>
            )}
            {mode === 'verify' && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#71717a' }}>
                <a href="#" onClick={async (e) => {
                  e.preventDefault(); setError(''); setInfo('');
                  try {
                    await base44.auth.register({ email, password });
                    setInfo(isEn ? 'A new code has been sent.' : 'Yeni kod gönderildi.');
                  } catch (err) {
                    setError(isEn ? 'Could not resend code.' : 'Kod tekrar gönderilemedi.');
                  }
                }} style={{ fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                  {t.resendCode}
                </a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setInfo(''); setMode('login'); }} style={{
                  fontWeight: 700, color: '#7c3aed', textDecoration: 'none',
                }}>
                  {t.backToLogin}
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.5rem',
            animation: 'fade-in-up 0.6s ease 0.2s both',
          }}>
            <a href="/" style={{
              fontSize: '0.78rem',
              color: '#9ca3af',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              {t.backHome}
            </a>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/privacy" style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'none' }}>{t.privacy}</a>
              <span style={{ color: '#e5e7eb', fontSize: '0.72rem' }}>·</span>
              <a href="/terms" style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'none' }}>{t.terms}</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}