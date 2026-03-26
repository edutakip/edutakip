import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, User, Phone, Mail, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParentSettings() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) setStudent(all[0]);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Nothing to update for now, just show success
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 500);
  };

  const field = (icon, label, value) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
        {icon}
        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value || '-'}</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to={createPageUrl('ParentDashboard')} style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>Ayarlar</h1>
      </div>

      {/* Account Info */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hesap Bilgileri</h2>
        {field(<User size={16} color='var(--text-muted)' />, 'Ad Soyad', user?.full_name)}
        {field(<Mail size={16} color='var(--text-muted)' />, 'E-posta', user?.email)}
      </div>

      {/* Student Info */}
      {student && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bağlı Öğrenci</h2>
          {field(<User size={16} color='var(--text-muted)' />, 'Öğrenci Adı', student.name)}
          {field(<Phone size={16} color='var(--text-muted)' />, 'Telefon', student.parentPhone)}
          {field(<Mail size={16} color='var(--text-muted)' />, 'Veli E-posta', student.parentEmail)}
        </div>
      )}

      {/* Logout */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oturum</h2>
        <button onClick={() => { localStorage.removeItem('tilki_role'); base44.auth.logout(createPageUrl('Landing')); }}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}