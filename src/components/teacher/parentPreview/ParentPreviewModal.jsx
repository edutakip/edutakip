import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { base44 } from '@/api/base44Client';
import { X, Eye, Home, BookOpen, DollarSign, BarChart2, Lock } from 'lucide-react';
import PreviewDashboard from './PreviewDashboard';
import PreviewHomework from './PreviewHomework';
import PreviewLessonsPayments from './PreviewLessonsPayments';
import PreviewPerformance from './PreviewPerformance';

export default function ParentPreviewModal({ student, onClose }) {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      if (!student?.id) return;
      try {
        const [l, p, h, r] = await Promise.all([
          base44.entities.Lesson.filter({ studentId: student.id }),
          base44.entities.Payment.filter({ studentId: student.id }),
          base44.entities.Homework.filter({ studentId: student.id }, '-created_date'),
          base44.entities.LessonReport.filter({ studentId: student.id }, '-date'),
        ]);
        setLessons(l.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setPayments(p.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setHomeworks(h);
        setReports(r);
      } catch (e) {
        console.error('Parent preview load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [student?.id]);

  const tabs = [
    { key: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { key: 'homework', label: 'Ödevler', icon: BookOpen },
    { key: 'finance', label: 'Dersler & Ödemeler', icon: DollarSign },
    { key: 'performance', label: 'Gelişim', icon: BarChart2 },
  ];

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2147483647,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        padding: '1rem', boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes ppModalIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .pp-modal-inner::-webkit-scrollbar { width: 5px; }
        .pp-modal-inner::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 4px; }
        .pp-tab-active { background: #4f46e5 !important; color: white !important; }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        className="pp-modal-inner"
        style={{
          background: '#f8fafc', borderRadius: '20px',
          width: '100%', maxWidth: '920px',
          maxHeight: 'calc(100dvh - 60px)',
          overflowY: 'auto', overflowX: 'hidden',
          animation: 'ppModalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 24px 64px rgba(15,23,42,0.35)',
          border: '1px solid #e0e7ff',
          position: 'relative',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '0.5rem' }}>
              <Eye size={20} color="white" />
            </div>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                Veli Paneli Önizleme
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>
                {student?.name} · Salt okunur görünüm
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
              fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px',
            }}>
              <Lock size={11} /> Salt Okunur
            </span>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem', padding: '0.85rem 1.25rem',
          background: 'white', borderBottom: '1px solid #e5e7eb',
          position: 'sticky', top: '65px', zIndex: 9,
          overflowX: 'auto',
        }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={tab === key ? 'pp-tab-active' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.9rem', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
                background: tab === key ? '#4f46e5' : '#f3f4f6',
                color: tab === key ? 'white' : '#6b7280',
                transition: 'all 0.15s',
              }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#9ca3af' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <>
              {tab === 'dashboard' && <PreviewDashboard student={student} lessons={lessons} payments={payments} homeworks={homeworks} />}
              {tab === 'homework' && <PreviewHomework homeworks={homeworks} studentName={student?.name} />}
              {tab === 'finance' && <PreviewLessonsPayments lessons={lessons} payments={payments} />}
              {tab === 'performance' && <PreviewPerformance student={student} reports={reports} homeworks={homeworks} />}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}