import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PaymentHistory from '../components/parent/PaymentHistory';

export default function ParentLessonsPayments() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('dersler');

  useEffect(() => {
    base44.auth.me().then(async u => {
      const all = await base44.entities.Student.filter({ parentEmail: u.email, inviteAccepted: true });
      if (all.length > 0) {
        const s = all[0];
        setStudent(s);
        const [l, p] = await Promise.all([
          base44.entities.Lesson.filter({ studentId: s.id }),
          base44.entities.Payment.filter({ studentId: s.id }),
        ]);
        setLessons(l.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setPayments(p);
      }
    });
  }, []);

  const STATUS = {
    'planlandı': { label: 'Planlandı', color: '#4338ca', bg: '#e0e7ff', icon: Clock },
    'tamamlandı': { label: 'Tamamlandı', color: '#065f46', bg: '#d1fae5', icon: CheckCircle },
    'iptal': { label: 'İptal', color: '#b91c1c', bg: '#fee2e2', icon: XCircle },
  };

  return (
    <div style={{ padding: '1.5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to={createPageUrl('ParentDashboard')} style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>Dersler & Ödemeler</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['dersler', 'ödemeler'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', background: tab === t ? 'var(--accent)' : 'var(--bg-card)', color: tab === t ? 'white' : 'var(--text-secondary)', boxShadow: tab === t ? '0 2px 8px rgba(79,70,229,0.3)' : 'none' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'dersler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {lessons.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Ders kaydı bulunamadı.</p>}
          {lessons.map(l => {
            const cfg = STATUS[l.status] || STATUS['planlandı'];
            const Icon = cfg.icon;
            let dateStr = l.date;
            try { dateStr = format(parseISO(l.date), 'd MMM yyyy', { locale: tr }); } catch {}
            return (
              <div key={l.id} style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{l.subject || 'Ders'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                    {dateStr}{l.startTime ? ` · ${l.startTime.slice(0,5)}` : ''}
                  </div>
                </div>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '700', background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'ödemeler' && <PaymentHistory payments={payments} />}
    </div>
  );
}