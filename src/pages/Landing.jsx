import React, { useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { BookOpen, Shield, TrendingUp, Users, ChevronRight, GraduationCap, Star, CheckCircle, Zap } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Ders Planlama', desc: 'Haftalık takvim, tekrarlayan dersler ve online/yüz yüze seçeneği', color: '#6366f1' },
  { icon: TrendingUp, title: 'Finans Takibi', desc: 'Nakit ve havale ödemelerini kaydet, gelir grafiklerini görüntüle', color: '#10b981' },
  { icon: Users, title: 'Veli Bağlantısı', desc: 'Davet kodu ile velileri sisteme bağla, anlık bildirimler gönder', color: '#f59e0b' },
  { icon: Shield, title: 'Güvenli & Hızlı', desc: 'Verileriniz güvende, her cihazdan erişin', color: '#3b82f6' },
];

export default function Landing() {
  useEffect(() => {
    document.body.style.background = '#f5f7fa';
    const role = localStorage.getItem('tilki_role');
    if (role === 'teacher') window.location.href = createPageUrl('TeacherDashboard');
    else if (role === 'parent') window.location.href = createPageUrl('ParentDashboard');
  }, []);

  const selectRole = (role) => {
    localStorage.setItem('tilki_role', role);
    window.location.href = createPageUrl(role === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif", color: '#111827', overflow: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid rgba(229,231,235,0.5)',
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(79,70,229,0.35)' }}>
            <GraduationCap size={20} color='white' />
          </div>
          <span style={{ fontWeight: '900', fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.6px' }}>EduTrack</span>
        </div>
        <button onClick={() => selectRole('teacher')}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(79,70,229,0.35)', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          Giriş Yap
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)',
        padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
        minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Animated background elements */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 1s' }} />

        <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', padding: '0.4rem 1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.95)', marginBottom: '2rem', fontWeight: '600', backdropFilter: 'blur(10px)', boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }}>
            <Zap size={13} fill='currentColor' color='#fbbf24' /> Türkiye'nin En Güvenilir Özel Ders Platformu
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '1.5rem' }}>
            Özel Dersinizi<br />
            <span style={{ background: 'linear-gradient(120deg, #a5b4fc 0%, #ddd6fe 50%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%' }}>Profesyonel Yönetin</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '550px', margin: '0 auto 2.5rem' }}>
            Ders takvimi, öğrenci takibi, ödeme yönetimi ve veli iletişimini bir platformda gerçekleştirin. 1000+ öğretmen tarafından güveniliyor.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background: 'white', border: 'none', color: '#4f46e5', borderRadius: '12px', padding: '1rem 2rem', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', transition: 'all 0.3s', animation: 'float 3s ease-in-out infinite' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <GraduationCap size={19} /> Öğretmen Paneli <ChevronRight size={17} />
            </button>
            <button onClick={() => selectRole('parent')}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', padding: '1rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', backdropFilter: 'blur(15px)', transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'float 3s ease-in-out infinite 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}>
              <Users size={19} /> Veli Paneli <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '5rem', position: 'relative' }}>
          {[['1000+', 'Öğretmen'], ['50K+', 'Öğrenci'], ['₺100M+', 'Yönetilen']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.9rem', fontWeight: '950', letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: '500' }}>{lbl}</div>
            </div>
          ))}
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </section>

      {/* ROLE SELECT */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.3), transparent)' }} />
        
        <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)', color: '#6d28d9', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(109,40,217,0.15)' }}>✨ Rolünüzü Seçin</span>
        <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.8px' }}>Hangi rolü üstleniyorsunuz?</h2>
        <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>Paneline giriş yaparak tüm özelliklere erişim sağlayın</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', justifyContent: 'center' }}>
          {[
            {
              role: 'teacher', icon: GraduationCap, title: 'Öğretmen Paneli',
              accent: '#4f46e5', bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              features: ['📅 Ders Takvimi', '👨‍🎓 Öğrenci Takibi', '💰 Finans Yönetimi', '👨‍👩‍👧 Veli Bildirimleri'],
              cta: 'Öğretmen Girişi',
            },
            {
              role: 'parent', icon: Users, title: 'Veli Paneli',
              accent: '#0ea5e9', bg: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              features: ['📋 Ders Programı', '🧾 Ödeme Geçmişi', '💬 Öğretmen İletişim', '🔗 Ders Linki'],
              cta: 'Veli Girişi',
            },
          ].map(({ role, icon: Icon, title, accent, bg, features, cta }) => (
            <div key={role}
              style={{ background: 'linear-gradient(135deg, #ffffff, #f9fafb)', border: '1.5px solid #e5e7eb', borderRadius: '24px', padding: '2.5rem 2rem', textAlign: 'center', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}
              onClick={() => selectRole(role)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.12)`; e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, white)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f9fafb)'; }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `linear-gradient(135deg, ${accent}20, transparent)`, borderRadius: '50%', transform: 'translate(80px, -80px)', pointerEvents: 'none' }} />
              
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem', boxShadow: `0 8px 25px ${accent}40`, position: 'relative', zIndex: 1 }}>
                <Icon size={28} color='white' />
              </div>
              <h3 style={{ color: '#111827', fontSize: '1.3rem', fontWeight: '900', marginBottom: '1.25rem', letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>{title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }}></span>
                    {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: '0.9rem 1.5rem', borderRadius: '12px', border: 'none', background: bg, color: 'white', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: `0 6px 20px ${accent}35`, transition: 'all 0.2s', position: 'relative', zIndex: 1 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                {cta} <ChevronRight size={17} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f5f7fa 100%)', borderTop: '1px solid rgba(229,231,235,0.5)', padding: '5.5rem 2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: '#15803d', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>🚀 Özellikler</span>
            <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.8px' }}>Güçlü araçlar, basit arayüz</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>Tüm ihtiyacınız olan özellikleri tek platformda bulun</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: 'white', borderRadius: '18px', border: '1.5px solid #e5e7eb', padding: '2rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `linear-gradient(135deg, ${color}15, transparent)`, borderRadius: '50%', transform: 'translate(40px, -40px)' }} />
                
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                  <Icon size={22} color={color} strokeWidth={1.5} />
                </div>
                <h4 style={{ color: '#111827', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1rem', position: 'relative', zIndex: 1 }}>{title}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '1.75rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
        © 2026 EduTrack · Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}