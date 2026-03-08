import React, { useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';

export default function Landing() {
  useEffect(() => {
    const role = localStorage.getItem('tilki_role');
    if (role === 'teacher') window.location.href = createPageUrl('TeacherDashboard');
    else if (role === 'parent') window.location.href = createPageUrl('ParentDashboard');
  }, []);

  const selectRole = (role) => {
    localStorage.setItem('tilki_role', role);
    window.location.href = createPageUrl(role === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '8%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🦊</div>
        <h1 style={{ color: 'var(--accent)', fontSize: '4rem', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1 }}>Tilki.</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.75rem' }}>
          Özel ders yönetim platformuna hoş geldiniz
        </p>
      </div>

      <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '2rem' }}>
        Kim olduğunuzu seçin
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          {
            role: 'teacher',
            icon: GraduationCap,
            title: 'Öğretmenim',
            desc: 'Öğrencilerimi yönet, ders planla ve gelirimi takip et',
            color: 'var(--accent)',
            gradColor: 'rgba(249,115,22,0.12)',
          },
          {
            role: 'parent',
            icon: Users,
            title: 'Veliyim',
            desc: "Çocuğumun derslerini ve ödemelerini takip et",
            color: 'var(--purple)',
            gradColor: 'rgba(139,92,246,0.12)',
          },
        ].map(({ role, icon: Icon, title, desc, color, gradColor }) => (
          <div
            key={role}
            onClick={() => selectRole(role)}
            style={{
              background: 'var(--bg-card)', border: '2px solid var(--border)',
              borderRadius: '20px', padding: '2.5rem 2rem',
              cursor: 'pointer', textAlign: 'center', width: '270px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 20px 40px ${gradColor}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: gradColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <Icon size={38} color={color} />
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.6rem' }}>
              {title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {desc}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color, fontWeight: '600', fontSize: '0.9rem' }}>
              Devam et <ArrowRight size={15} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}