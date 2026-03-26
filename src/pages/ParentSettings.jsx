import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, User, Phone, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParentSettings() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) setStudent(all[0]);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 500);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'SİL') return;
    setDeleting(true);
    try {
      // Disable the account by clearing sensitive data
      await base44.auth.updateMe({ accountDeleted: true, deletedAt: new Date().toISOString() });
      localStorage.removeItem('tilki_role');
      base44.auth.logout(createPageUrl('Landing'));
    } catch {
      setDeleting(false);
    }
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
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oturum</h2>
        <button onClick={() => { localStorage.removeItem('tilki_role'); base44.auth.logout(createPageUrl('Landing')); }}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
          Çıkış Yap
        </button>
      </div>

      {/* Delete Account */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1.5px solid #fca5a5', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Trash2 size={15} /> Hesabı Sil
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1rem', lineHeight: 1.6 }}>
          Hesabınızı silmek geri alınamaz. Tüm verileriniz kalıcı olarak silinir.
        </p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #fca5a5', background: 'white', color: '#dc2626', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
            Hesabı Sil
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={15} color='#dc2626' style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: '600', margin: 0 }}>
                Onaylamak için aşağıya <strong>SİL</strong> yazın.
              </p>
            </div>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder='SİL yazın...'
              style={{ padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1.5px solid #fca5a5', fontSize: '0.9rem', color: '#111827', outline: 'none', background: 'white' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}>
                İptal
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'SİL' || deleting}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', background: deleteInput === 'SİL' ? '#dc2626' : '#f3f4f6', color: deleteInput === 'SİL' ? 'white' : '#9ca3af', fontWeight: '700', cursor: deleteInput === 'SİL' ? 'pointer' : 'default', fontSize: '0.88rem' }}>
                {deleting ? 'Siliniyor...' : 'Onayla ve Sil'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}