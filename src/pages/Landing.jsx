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
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif", color: '#111827' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
            <GraduationCap size={18} color='white' />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.5px' }}>EduTrack</span>
        </div>
        <button onClick={() => selectRole('teacher')}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.5rem 1.25rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
          Giriş Yap
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%)',
        padding: '5rem 2rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontWeight: '500' }}>
            <Star size={11} fill='currentColor' color='#fbbf24' /> Özel Ders Yönetim Platformu
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1px', marginBottom: '1.25rem' }}>
            Öğretmenlik'i<br />
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kolaylaştırın</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: '1.75', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Ders planlama, ödeme takibi ve veli iletişimini tek platformda yönetin.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background: 'white', border: 'none', color: '#4f46e5', borderRadius: '12px', padding: '0.8rem 1.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
              <GraduationCap size={17} /> Öğretmen Girişi <ChevronRight size={15} />
            </button>
            <button onClick={() => selectRole('parent')}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', padding: '0.8rem 1.75rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
              <Users size={17} /> Veli Girişi <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4rem', position: 'relative' }}>
          {[['500+', 'Aktif Öğretmen'], ['12K+', 'Ders Planlandı'], ['98%', 'Memnuniyet']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ROLE SELECT */}
      <section style={{ padding: '5rem 2rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: '20px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>Giriş</span>
        <h2 style={{ color: '#111827', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: '800', marginBottom: '2.5rem' }}>Rolünüzü seçin</h2>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            {
              role: 'teacher', icon: GraduationCap, title: 'Öğretmenim',
              accent: '#4f46e5', bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              features: ['Ders takvimi yönetimi', 'Öğrenci takibi', 'Finans raporları', 'Veli bildirimleri'],
              cta: 'Öğretmen Paneli',
            },
            {
              role: 'parent', icon: Users, title: 'Veliyim',
              accent: '#0ea5e9', bg: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              features: ['Ders programını görüntüle', 'Ödeme geçmişi', 'Öğretmen ile iletişim', 'Online ders linki'],
              cta: 'Veli Paneli',
            },
          ].map(({ role, icon: Icon, title, accent, bg, features, cta }) => (
            <div key={role}
              style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '20px', padding: '2rem 1.75rem', width: '300px', textAlign: 'left', transition: 'all 0.25s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              onClick={() => selectRole(role)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12)`; e.currentTarget.style.borderColor = accent; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 6px 20px ${accent}35` }}>
                <Icon size={24} color='white' />
              </div>
              <h3 style={{ color: '#111827', fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>{title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.83rem' }}>
                    <CheckCircle size={13} color={accent} style={{ flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none', background: bg, color: 'white', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {cta} <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'white', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '4.5rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ display: 'inline-block', background: '#f0fdf4', color: '#15803d', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: '20px', padding: '0.3rem 0.9rem', marginBottom: '0.75rem' }}>Özellikler</span>
            <h2 style={{ color: '#111827', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: '800' }}>İhtiyacınız olan her şey</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '1.5rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={19} color={color} />
                </div>
                <h4 style={{ color: '#111827', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{title}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: '1.65' }}>{desc}</p>
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