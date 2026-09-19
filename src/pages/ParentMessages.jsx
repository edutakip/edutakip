import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ParentChat from '@/components/parent/ParentChat';
import { MessageCircle } from 'lucide-react';

export default function ParentMessages() {
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true }).then(all => {
        if (all.length > 0) setStudent(all[0]);
        setLoading(false);
      }).catch(e => { console.error('Parent messages load error:', e); setLoading(false); });
    }).catch(e => { console.error('Parent auth error:', e); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageCircle size={48} color='#d1d5db' style={{ margin: '0 auto 1rem' }} />
          <p>Mesajlaşmak için önce bir öğrenciye bağlanmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800' }}>Öğretmen İletişimi</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {student.name} için öğretmeninizle mesajlaşın
        </p>
      </div>
      <ParentChat student={student} user={user} />
    </div>
  );
}