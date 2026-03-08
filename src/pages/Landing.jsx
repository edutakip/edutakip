import React, { useEffect, useState } from 'react';
import { createPageUrl } from '@/utils';
import { BookOpen, Shield, TrendingUp, Bell, ChevronRight, GraduationCap, Users, Star, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Ders Planlama', desc: 'Haftalık takvim, tekrarlayan dersler ve online/yüz yüze seçeneği' },
  { icon: TrendingUp, title: 'Finans Takibi', desc: 'Nakit ve havale ödemelerini kaydet, gelir grafiklerini görüntüle' },
  { icon: Users, title: 'Veli Bağlantısı', desc: 'Davet kodu ile velileri sisteme bağla, anlık bildirimler gönder' },
  { icon: Shield, title: 'Güvenli & Hızlı', desc: 'Verileriniz güvende, her cihazdan erişin' },
];

export default function Landing() {
  useEffect(() => {
    document.body.classList.remove('dark-mode');
    const role = localStorage.getItem('tilki_role');
    if (role === 'teacher') window.location.href = createPageUrl('TeacherDashboard');
    else if (role === 'parent') window.location.href = createPageUrl('ParentDashboard');
  }, []);

  const selectRole = (role) => {
    localStorage.setItem('tilki_role', role);
    window.location.href = createPageUrl(role === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color='white' />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--accent)', letterSpacing: '-0.5px' }}>EduTrack</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => selectRole('teacher')}
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.5rem 1.25rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
            Giriş Yap
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, #0f1f3d 0%, #1e3a8a 50%, #1e40af 100%)',
        padding: '5rem 2rem 6rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        {/* glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>
            <Star size={12} fill='currentColor' /> Özel Ders Yönetim Platformu
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1px', marginBottom: '1.25rem' }}>
            Öğretmen-Öğrenci<br />İlişkisini Dijitalleştirin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
            Ders planlama, ödeme takibi ve veli iletişimini tek platformda yönetin. Zamandan tasarruf edin, daha fazla öğrenciye ulaşın.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background: 'white', border: 'none', color: '#1e3a8a', borderRadius: '12px', padding: '0.85rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <GraduationCap size={18} /> Öğretmen Girişi <ChevronRight size={16} />
            </button>
            <button onClick={() => selectRole('parent')}
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '12px', padding: '0.85rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)' }}>
              <Users size={18} /> Veli Girişi <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* stats row */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4rem', position: 'relative' }}>
          {[['500+', 'Aktif Öğretmen'], ['12K+', 'Ders Planlandı'], ['98%', 'Memnuniyet']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.75rem', fontWeight: '900' }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO ARE YOU */}
      <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-mid)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Kim Olduğunuzu Seçin</p>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '800', marginBottom: '3rem' }}>Hangi rolle giriş yapmak istiyorsunuz?</h2>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            {
              role: 'teacher', icon: GraduationCap, title: 'Öğretmenim',
              color: '#1e3a8a', grad: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              features: ['Ders takvimi yönetimi', 'Öğrenci takibi', 'Finans raporları', 'Veli bildirimleri'],
              cta: 'Öğretmen Paneline Gir',
            },
            {
              role: 'parent', icon: Users, title: 'Veliyim',
              color: '#0284c7', grad: 'linear-gradient(135deg, #0369a1, #0284c7)',
              features: ['Ders programını görüntüle', 'Ödeme geçmişi', 'Öğretmen ile iletişim', 'Online ders linki'],
              cta: 'Veli Paneline Gir',
            },
          ].map(({ role, icon: Icon, title, color, grad, features, cta }) => (
            <div key={role} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '2.5rem 2rem', width: '320px',
              textAlign: 'left', transition: 'all 0.25s', cursor: 'pointer',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}
              onClick={() => selectRole(role)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(30,58,138,0.15)`; e.currentTarget.style.borderColor = color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 8px 24px ${color}40` }}>
                <Icon size={26} color='white' />
              </div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>{title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0 1.75rem' }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <CheckCircle size={14} color={color} /> {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none', background: grad, color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {cta} <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: 'var(--accent-mid)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem', textAlign: 'center' }}>Özellikler</p>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '800', textAlign: 'center', marginBottom: '3rem' }}>İhtiyacınız olan her şey</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={20} color='white' />
                </div>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        © 2026 EduTrack · Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}