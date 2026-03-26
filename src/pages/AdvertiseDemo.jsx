/**
 * AdvertiseDemo - Tamamen public, login gerektirmeyen demo sayfası.
 * Gerçek dashboard bileşenlerini sahte (mock) verilerle gösterir.
 *
 * Strateji: base44Client modülünü import etmeden önce window.__demoBase44
 * üzerine mock client atıyoruz, ardından gerçek bileşenler bu değeri kullanıyor.
 * Bileşenler kendi içlerinde base44 import ettiği için en güvenilir yol:
 * bileşenleri doğrudan kopyalamak yerine, her sayfayı kendi state'iyle
 * demo verilerle beslemek (prop injection pattern).
 */
import React, { useState, useEffect, useRef } from 'react';
import { demoBase44, DEMO_USER } from '../components/DemoContext';
import { format, addDays, subDays, isToday, isTomorrow, parseISO, differenceInMinutes, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Users, CalendarCheck, CheckCircle, DollarSign, ChevronRight,
  MessageCircle, Plus, BarChart2, BookOpen, Bot, Star, TrendingUp,
  Clock, Zap, GraduationCap, Sparkles, Send, LayoutDashboard,
  CalendarDays, Search, RefreshCw, X, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// ─── Helpers ──────────────────────────────────────────────────
const AVATAR_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
const today = new Date();
const fmt = (d) => format(d, 'yyyy-MM-dd');
const ratingColor = (r) => r >= 5 ? '#10b981' : r >= 4 ? '#6366f1' : r >= 3 ? '#f59e0b' : '#ef4444';
const CHART_COLORS = ['#f97316', '#6366f1', '#10b981', '#8b5cf6', '#3b82f6'];

const getDayLabel = (dateStr) => {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Bugün';
    if (isTomorrow(d)) return 'Yarın';
    return format(d, 'EEE, d MMM', { locale: tr });
  } catch { return dateStr; }
};

function Avatar({ name, size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: getColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.32 + 'px', fontWeight: 800, color: 'white' }}>{getInitials(name)}</span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Genel Bakış',       icon: LayoutDashboard },
  { id: 'students',   label: 'Öğrencilerim',       icon: Users },
  { id: 'lessons',    label: 'Dersler',             icon: BookOpen },
  { id: 'calendar',   label: 'Takvim',              icon: CalendarDays },
  { id: 'finance',    label: 'Finans',              icon: DollarSign },
  { id: 'reports',    label: 'Gelişim Raporları',  icon: BarChart2 },
  { id: 'assistant',  label: 'EduTakip Asistan',   icon: Bot },
];

function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 224, flexShrink: 0,
      background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: 'calc(100vh - 40px)',
      overflowX: 'hidden', overflowY: 'hidden',
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    }}>
      <div style={{ padding: '1.25rem 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1 }}>EduTakip</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', marginTop: 2 }}>Demo Hesabı</div>
        </div>
      </div>

      <div style={{ margin: '0 0.75rem 0.75rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.07)', borderRadius: 10 }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{DEMO_USER.full_name}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', margin: '0.2rem 0 0' }}>{DEMO_USER.email}</p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0.75rem 0.75rem' }} />

      <nav style={{ flex: 1, padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 10, border: 'none',
              background: isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              fontWeight: isActive ? 700 : 400, fontSize: '0.85rem',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Pro badge */}
      <div style={{ margin: '0.75rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.2))', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(245,158,11,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
          <Zap size={13} color='#fbbf24' fill='#fbbf24' />
          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.78rem' }}>Pro Plan — Aktif</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', lineHeight: 1.5 }}>Sınırsız öğrenci · AI asistan · Raporlar</div>
      </div>
    </aside>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────
function DashboardTab({ students, lessons, payments }) {
  const activeStudents = students.filter(s => s.status === 'active');
  const todayLessons = lessons.filter(l => { try { return isToday(parseISO(l.date)) && l.status !== 'iptal'; } catch { return false; } });
  const thisMonth = format(new Date(), 'yyyy-MM');
  const completedThisMonth = lessons.filter(l => l.date?.startsWith(thisMonth) && l.status === 'tamamlandı').length;

  const studentBalances = activeStudents.map(s => {
    const debt = payments.filter(p => p.studentId === s.id && (p.status === 'bekliyor' || p.status === 'gecikmiş')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const collected = payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0);
    return { student: s, balance: Math.max(0, debt - collected) };
  }).filter(x => x.balance > 0);

  const totalUnpaid = studentBalances.reduce((s, x) => s + x.balance, 0);

  const upcomingLessons = lessons
    .filter(l => { try { return parseISO(l.date) >= new Date(new Date().setHours(0,0,0,0)) && l.status !== 'iptal'; } catch { return false; } })
    .sort((a, b) => new Date(`${a.date}T${a.startTime||'00:00'}`) - new Date(`${b.date}T${b.startTime||'00:00'}`))
    .slice(0, 6);

  const statCards = [
    { label: 'Aktif Öğrenci',      value: activeStudents.length,                        icon: Users,         iconColor: '#0ea5e9', iconBg: '#e0f2fe' },
    { label: 'Bugünkü Dersler',    value: todayLessons.length,                          icon: CalendarCheck, iconColor: '#6366f1', iconBg: '#eef2ff' },
    { label: 'Bu Ay Tamamlanan',   value: completedThisMonth,                           icon: CheckCircle,   iconColor: '#10b981', iconBg: '#d1fae5' },
    { label: 'Ödenmemiş Bakiye',   value: `₺${totalUnpaid.toLocaleString('tr-TR')}`,   icon: DollarSign,    iconColor: '#f59e0b', iconBg: '#fef3c7' },
  ];

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const theme = { morning: { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #1a1035 100%)', accent: '#fb923c' }, afternoon: { gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f1035 100%)', accent: '#818cf8' }, evening: { gradient: 'linear-gradient(135deg, #0f0f1a 0%, #1a1035 60%, #1a0f2e 100%)', accent: '#a78bfa' } }[timeOfDay];
  const greetings = { morning: 'Günaydın', afternoon: 'Tünaydın', evening: 'İyi Akşamlar' };
  const firstLesson = [...todayLessons].sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Genel Bakış</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{format(today, 'EEEE, d MMMM yyyy', { locale: tr })}</p>
        </div>
        <button style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 12, padding: '0.65rem 1.3rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ders Ekle
        </button>
      </div>

      {/* Brief Banner */}
      <div style={{ background: theme.gradient, borderRadius: 20, padding: '1.5rem 1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, minWidth: 200 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Günün Özeti</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem', lineHeight: 1.2 }}>{greetings[timeOfDay]}!</h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{format(new Date(), 'EEEE, d MMMM', { locale: tr })} · {format(new Date(), 'HH:mm')}</p>
          </div>
          <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.5 }}>
              {todayLessons.length > 0 ? `Bugün ${todayLessons.length} dersiniz var${firstLesson ? `, ilki saat ${firstLesson.startTime}.` : '.'}` : 'Bugün planlanmış dersiniz yok.'}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              {studentBalances.length > 0 ? `${studentBalances.length} öğrencinizin bekleyen ödemesi var.` : 'Tüm ödemeler güncel, harika!'}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} color={card.iconColor} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: '0.4rem' }}>{card.value}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.82rem', fontWeight: 500 }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Yaklaşan Dersler</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#6366f1', fontSize: '0.82rem', fontWeight: 600 }}>Tümü <ChevronRight size={14} /></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingLessons.map(l => {
              const start = new Date(`2000-01-01T${l.startTime}`);
              const end = l.endTime ? new Date(`2000-01-01T${l.endTime}`) : null;
              const duration = end ? `${differenceInMinutes(end, start)}dk` : null;
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ textAlign: 'center', minWidth: 40 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{l.startTime}</div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.status === 'tamamlandı' ? '#10b981' : '#6366f1', margin: '4px auto 0' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{l.studentName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{l.subject && `${l.subject} · `}{getDayLabel(l.date)}</div>
                  </div>
                  {duration && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 8 }}>{duration}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Ödenmemiş Bakiyeler</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>Tümü <ChevronRight size={14} /></span>
          </div>
          {studentBalances.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>Ödenmemiş bakiye yok 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {studentBalances.map(({ student, balance }, i) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < studentBalances.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <Avatar name={student.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{student.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{format(new Date(), 'MMMM yyyy', { locale: tr })}</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>₺{balance.toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Goal */}
      {(() => {
        const goal = 20;
        const pct = Math.min(Math.round((completedThisMonth / goal) * 100), 100);
        return (
          <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.2rem' }}>Aylık Hedef Takibi</h2>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{format(new Date(), 'MMMM yyyy', { locale: tr })}</p>
              </div>
              {completedThisMonth >= goal && <span style={{ background: '#d1fae5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 20 }}>🎯 Hedefe Ulaşıldı!</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {[{ label: 'Tamamlanan', value: completedThisMonth, color: '#6366f1' }, { label: 'Hedef', value: goal, color: '#374151' }, { label: 'Kalan', value: Math.max(goal - completedThisMonth, 0), color: '#f59e0b' }].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{completedThisMonth} / {goal} ders</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6366f1' }}>{pct}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────
function StudentsTab({ students }) {
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Öğrencilerim</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Tüm öğrencilerinizi ve ders durumlarını buradan yönetin.</p>
        </div>
        <button style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 12, padding: '0.65rem 1.3rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}>
          <Plus size={15} /> Yeni Öğrenci Ekle
        </button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Öğrenci ara...'
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 12, background: 'white', border: '1px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ v: 'active', l: 'Aktif' }, { v: 'archived', l: 'Arşiv' }, { v: 'all', l: 'Tümü' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid', borderColor: filter === v ? '#6366f1' : '#e5e7eb', background: filter === v ? '#eef2ff' : 'transparent', color: filter === v ? '#4f46e5' : '#6b7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map(s => (
          <div key={s.id} style={{ background: 'white', borderRadius: 18, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <Avatar name={s.name} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{s.grade}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 20, background: s.status === 'active' ? '#d1fae5' : '#f3f4f6', color: s.status === 'active' ? '#065f46' : '#6b7280' }}>
                {s.status === 'active' ? 'Aktif' : 'Arşiv'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[{ label: 'Ders', value: s.subject }, { label: 'Ücret', value: `₺${s.feePerLesson}/ders` }, { label: 'Veli', value: s.parentName }, { label: 'Aylık', value: `₺${(s.monthlyFee||0).toLocaleString('tr-TR')}` }].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Add new card */}
        <div style={{ background: 'linear-gradient(145deg, #1a1a2e, #16213e)', border: '2px dashed rgba(99,102,241,0.4)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.75rem', minHeight: 200 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} color='#818cf8' />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 600 }}>Yeni Öğrenci Ekle</span>
        </div>
      </div>
    </div>
  );
}

// ─── Lessons Tab ──────────────────────────────────────────────
function LessonsTab({ lessons }) {
  const sorted = [...lessons].sort((a, b) => new Date(`${b.date}T${b.startTime||'00:00'}`) - new Date(`${a.date}T${a.startTime||'00:00'}`));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem' }}>Dersler</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{lessons.length} ders kaydı</p>
        </div>
        <button style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: 12, padding: '0.65rem 1.3rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Ders Planla
        </button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {sorted.map((l, i) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.5rem', borderBottom: i < sorted.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: l.status === 'tamamlandı' ? '#10b981' : l.status === 'iptal' ? '#ef4444' : '#6366f1' }} />
            <div style={{ minWidth: 100 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{getDayLabel(l.date)}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{l.startTime} – {l.endTime}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#111827' }}>{l.studentName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{l.subject}</div>
            </div>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.85rem' }}>₺{(l.lessonFee||0).toLocaleString('tr-TR')}</div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 8, background: l.status === 'tamamlandı' ? '#d1fae5' : l.status === 'iptal' ? '#fee2e2' : '#eef2ff', color: l.status === 'tamamlandı' ? '#065f46' : l.status === 'iptal' ? '#b91c1c' : '#4f46e5' }}>
              {l.status === 'tamamlandı' ? '✓ Tamamlandı' : l.status === 'iptal' ? '✕ İptal' : '● Planlandı'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Finance Tab ──────────────────────────────────────────────
function FinanceTab({ students, lessons, payments }) {
  const now = new Date();
  const totalIncome = payments.filter(p => p.status === 'alındı').reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikmiş').reduce((s, p) => s + (p.amount || 0), 0);
  const monthlyRecurring = students.filter(s=>s.status==='active').reduce((s, st) => s + (st.monthlyFee || 0), 0);
  const totalWeeklyHours = students.filter(s=>s.status==='active').reduce((s, st) => s + (st.weeklyLessons || 1), 0);

  const thisMonthIncome = payments.filter(p => {
    if (p.status !== 'alındı' || !p.date) return false;
    const d = new Date(p.date);
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }).reduce((s, p) => s + (p.amount || 0), 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(now, 5 - i);
    const income = payments.filter(p => {
      if (!p.date || p.status !== 'alındı') return false;
      const d = new Date(p.date);
      return d >= startOfMonth(m) && d <= endOfMonth(m);
    }).reduce((s, p) => s + (p.amount || 0), 0);
    return { month: format(m, 'MMM yy', { locale: tr }), gelir: income };
  });

  const weeklyHoursData = Array.from({ length: 8 }, (_, i) => {
    const ws = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const we = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const mins = lessons.filter(l => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d >= ws && d <= we && l.status !== 'iptal';
    }).reduce((s, l) => s + (l.duration || 60), 0);
    return { week: format(ws, 'd MMM', { locale: tr }), saat: Math.round(mins / 60 * 10) / 10 };
  });

  const studentIncome = students.filter(s=>s.status==='active').map(s => ({
    name: s.name.split(' ')[0],
    total: payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0),
  })).sort((a, b) => b.total - a.total);
  const maxStudentIncome = studentIncome[0]?.total || 1;

  const pendingByStudent = students.filter(s=>s.status==='active').map(s => {
    const debt = payments.filter(p => p.studentId === s.id && (p.status === 'bekliyor' || p.status === 'gecikmiş')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const collected = payments.filter(p => p.studentId === s.id && p.status === 'alındı').reduce((sum, p) => sum + (p.amount || 0), 0);
    return { student: s, amount: Math.max(0, debt - collected) };
  }).filter(x => x.amount > 0);

  const card = { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ color: '#111827', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Finans Yönetimi</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Gelir, ödeme ve öğrenci bazlı istatistikler</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { icon: Users,       iconColor: '#ec4899', label: 'Aktif Öğrenci',         value: students.filter(s=>s.status==='active').length,         sub: 'kayıtlı' },
          { icon: DollarSign,  iconColor: '#f97316', label: 'Toplam Gelir',           value: `₺${totalIncome.toLocaleString('tr-TR')}`,               sub: 'tahsil edildi' },
          { icon: Clock,       iconColor: '#6366f1', label: 'Haftalık Planlanan',     value: `${totalWeeklyHours} Saat`,                             sub: 'toplam ders' },
          { icon: TrendingUp,  iconColor: '#10b981', label: 'Düzenli Gelir',          value: `₺${monthlyRecurring.toLocaleString('tr-TR')}`,          sub: 'aylık' },
          { icon: TrendingUp,  iconColor: '#8b5cf6', label: 'Bu Ay (Tahsilat)',       value: `₺${thisMonthIncome.toLocaleString('tr-TR')}`,           sub: 'hakedilen' },
        ].map(({ icon: Icon, iconColor, label, value, sub }) => (
          <div key={label} style={{ ...card, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 10, background: iconColor + '18' }}><Icon size={18} color={iconColor} /></div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.3rem' }}>{label}</p>
            <p style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.3rem' }}>{value}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={card}>
          <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Aylık Gelir Grafiği</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem', marginTop: '0.15rem' }}>Son 6 ay</p>
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='gradGelir' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey='month' tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: '0.8rem' }} formatter={v => [`₺${v.toLocaleString('tr-TR')}`, '']} />
              <Area type='monotone' dataKey='gelir' stroke='#f97316' fill='url(#gradGelir)' strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Haftalık Çalışma Saatleri</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem', marginTop: '0.15rem' }}>Son 8 hafta</p>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={weeklyHoursData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey='week' tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: '0.8rem' }} formatter={v => [`${v} saat`, '']} />
              <Bar dataKey='saat' fill='#fed7aa' radius={[6, 6, 0, 0]}>
                {weeklyHoursData.map((_, i) => <Cell key={i} fill={i === weeklyHoursData.length - 1 ? '#f97316' : '#fed7aa'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ ...card, marginBottom: '1rem' }}>
        <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Öğrenci Bazlı Kazanç</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '1.25rem' }}>{students.filter(s=>s.status==='active').length} öğrenci</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {studentIncome.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#374151', fontSize: '0.83rem', fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: '#111827', fontSize: '0.83rem', fontWeight: 700 }}>₺{s.total.toLocaleString('tr-TR')}</span>
              </div>
              <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[i % CHART_COLORS.length]}cc)`, width: `${Math.max((s.total / maxStudentIncome) * 100, 2)}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>
        {pendingByStudent.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid #f3f4f6' }}>
            <h4 style={{ color: '#374151', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Bekleyen Ödemeler</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {pendingByStudent.map(({ student, amount }) => (
                <div key={student.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.8rem' }}>{student.name.split(' ')[0]}</div>
                    <div style={{ color: '#d97706', fontSize: '0.95rem', fontWeight: 800 }}>₺{amount.toLocaleString('tr-TR')}</div>
                  </div>
                  <button style={{ background: '#f59e0b', border: 'none', color: 'white', borderRadius: 8, padding: '0.35rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Tahsil Et</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────
function ReportsTab({ students, reports }) {
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const UNDERSTOOD_MAP = { tam: { label: 'Tam Anladı', bg: '#d1fae5', color: '#065f46' }, kismen: { label: 'Kısmen Anladı', bg: '#fef3c7', color: '#92400e' }, tekrar: { label: 'Tekrar Gerekli', bg: '#fee2e2', color: '#b91c1c' } };
  const PARTICIPATION_MAP = { aktif: { label: 'Aktif Katılım', bg: '#d1fae5', color: '#065f46' }, orta: { label: 'Orta Katılım', bg: '#fef3c7', color: '#92400e' }, pasif: { label: 'Pasif', bg: '#f3f4f6', color: '#6b7280' } };
  const MOTIVATION_MAP = { yuksek: { label: 'Yüksek Motivasyon', bg: '#d1fae5', color: '#065f46' }, normal: { label: 'Normal Motivasyon', bg: '#e0e7ff', color: '#4338ca' }, dusuk: { label: 'Düşük Motivasyon', bg: '#fee2e2', color: '#b91c1c' } };
  const attStyle = (a) => ({ katıldı: { bg: '#d1fae5', color: '#065f46', label: 'Katıldı' }, 'geç kaldı': { bg: '#fef3c7', color: '#92400e', label: 'Geç Kaldı' }, katılmadı: { bg: '#fee2e2', color: '#b91c1c', label: 'Katılmadı' } }[a] || { bg: '#f3f4f6', color: '#6b7280', label: a });

  const filtered = reports.filter(r => {
    const matchStudent = selectedStudentId === 'all' || r.studentId === selectedStudentId;
    const matchSearch = !search || r.studentName?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase());
    return matchStudent && matchSearch;
  });

  const avgRating = filtered.length ? (filtered.reduce((s, r) => s + (r.rating || 0), 0) / filtered.length).toFixed(1) : '-';
  const attended = filtered.filter(r => r.attendance === 'katıldı').length;
  const attendanceRate = filtered.length ? Math.round((attended / filtered.length) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>Gelişim Raporları</h1>
        <span style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, color: '#92400e', border: '1px solid #fbbf24' }}>Pro</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Star,       iconBg: '#fef9c3', iconColor: '#f59e0b', label: 'Ort. Puan',  value: avgRating,              sub: '/ 5.0' },
          { icon: CheckCircle,iconBg: '#d1fae5', iconColor: '#10b981', label: 'Devam',      value: attendanceRate + '%',   sub: `${attended}/${filtered.length} ders` },
          { icon: BookOpen,   iconBg: '#e0e7ff', iconColor: '#6366f1', label: 'Rapor',      value: filtered.length,        sub: 'değerlendirme' },
          { icon: Users,      iconBg: '#fce7f3', iconColor: '#ec4899', label: 'Öğrenci',   value: students.length,        sub: 'aktif' },
        ].map(({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 8, background: iconBg }}><Icon size={16} color={iconColor} /></div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} color='#9ca3af' style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Öğrenci veya konu ara..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.25rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', fontSize: '0.875rem', outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
        </div>
        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
          style={{ padding: '0.6rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', fontSize: '0.875rem', color: '#111827', outline: 'none', cursor: 'pointer' }}>
          <option value="all">Tüm Öğrenciler</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Trend Bar Chart */}
      {filtered.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color='#6366f1' />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Performans Trendi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {[...filtered].reverse().slice(-16).map(r => (
              <div key={r.id} style={{ flex: 1, height: `${((r.rating || 0) / 5) * 80}px`, background: ratingColor(r.rating), borderRadius: '4px 4px 0 0', opacity: 0.85, minHeight: 4 }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(report => {
          const isOpen = expandedId === report.id;
          const att = attStyle(report.attendance);
          let dateStr = '';
          try { dateStr = format(parseISO(report.date), 'd MMMM yyyy', { locale: tr }); } catch {}
          return (
            <div key={report.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isOpen ? '#c7d2fe' : '#f1f5f9'}`, overflow: 'hidden', boxShadow: isOpen ? '0 4px 16px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
              <div onClick={() => setExpandedId(isOpen ? null : report.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: ratingColor(report.rating) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: ratingColor(report.rating) }}>{report.rating}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{report.studentName} — {report.subject} · {dateStr}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.topicsCovered || 'Konu belirtilmedi'}</div>
                </div>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= (report.rating||0) ? '#f59e0b' : 'none'} color={n <= (report.rating||0) ? '#f59e0b' : '#e5e7eb'} />)}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 8, background: att.bg, color: att.color, flexShrink: 0 }}>{att.label}</span>
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {report.understood && UNDERSTOOD_MAP[report.understood] && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, background: UNDERSTOOD_MAP[report.understood].bg, color: UNDERSTOOD_MAP[report.understood].color }}>{UNDERSTOOD_MAP[report.understood].label}</span>}
                    {report.participation && PARTICIPATION_MAP[report.participation] && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, background: PARTICIPATION_MAP[report.participation].bg, color: PARTICIPATION_MAP[report.participation].color }}>{PARTICIPATION_MAP[report.participation].label}</span>}
                    {report.motivation && MOTIVATION_MAP[report.motivation] && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 20, background: MOTIVATION_MAP[report.motivation].bg, color: MOTIVATION_MAP[report.motivation].color }}>{MOTIVATION_MAP[report.motivation].label}</span>}
                  </div>
                  {report.generalNote && <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 12, padding: '1rem 1.25rem', border: '1.5px solid #c7d2fe' }}><p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.75, margin: 0 }}>{report.generalNote}</p></div>}
                  {report.improvements && <div style={{ background: '#fef3c7', borderRadius: 12, padding: '0.875rem' }}><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>Dikkat Edilmesi Gereken</p><p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{report.improvements}</p></div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {report.homework && <div style={{ background: '#fce7f3', borderRadius: 12, padding: '0.875rem' }}><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>Verilen Ödev</p><p style={{ fontSize: '0.85rem', color: '#374151', margin: 0 }}>{report.homework}</p></div>}
                    {report.nextGoal && <div style={{ background: '#d1fae5', borderRadius: 12, padding: '0.875rem' }}><p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.4rem' }}>Sonraki Ders Hedefi</p><p style={{ fontSize: '0.85rem', color: '#374151', margin: 0 }}>{report.nextGoal}</p></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Assistant Tab ─────────────────────────────────────────
function AssistantTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba Hocam! 👋 Ben EduTakip Asistanı. Öğrenci takibi, ödemeler ve ders programınız hakkında yardımcı olabilirim.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conv] = useState({ id: 'demo_conv_1', messages: [] });
  const endRef = React.useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const QUICK_PROMPTS = [
    { icon: '💰', text: 'Bu ay kim ödeme yapmadı?' },
    { icon: '📅', text: 'Bugünkü derslerim neler?' },
    { icon: '👥', text: 'Kaç aktif öğrencim var?' },
    { icon: '📊', text: 'En çok zorlanan öğrencilerim?' },
    { icon: '📝', text: 'Tamamlanmamış ödevler var mı?' },
    { icon: '💡', text: 'Motivasyon artırma önerileri ver' },
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    // Use mock agent
    const fakeConv = { ...conv, messages: messages };
    await demoBase44.agents.addMessage(fakeConv, userMsg);
    // Subscribe to get response
    const unsub = demoBase44.agents.subscribeToConversation(fakeConv.id, (data) => {
      setMessages(data.messages);
      if (data.messages[data.messages.length - 1]?.role === 'assistant') {
        setLoading(false);
      }
    });
    setTimeout(unsub, 3000);
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px - 2rem)', maxHeight: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>EduTakip Asistanı</h1>
        <span style={{ background: '#eef2ff', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, color: '#4f46e5', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={11} /> AI Destekli
        </span>
      </div>

      <div style={{ background: '#f4f6fb', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>EduTakip Asistanı</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Çevrimiçi</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visibleMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '0.75rem 1rem',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'white',
                color: m.role === 'user' ? 'white' : '#111827',
                fontSize: '0.83rem', lineHeight: 1.65,
                boxShadow: m.role === 'user' ? '0 2px 8px rgba(79,70,229,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                {m.role === 'user' ? <p style={{ margin: 0 }}>{m.content}</p> : (
                  <ReactMarkdown components={{
                    p: ({ children }) => <p style={{ margin: '0 0 0.5rem', lineHeight: 1.65 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#1e1b4b' }}>{children}</strong>,
                  }}>{m.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex' }}>
              <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c7d2fe', animation: `dotB 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts when empty */}
        {visibleMessages.length === 1 && (
          <div style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', flexShrink: 0 }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => send(p.text)} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.85rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{p.icon}</span>{p.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '0.75rem', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Bir şey sorun... (örn: bugünkü derslerim)"
            style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', color: '#111827' }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={14} color={input.trim() && !loading ? 'white' : '#9ca3af'} />
          </button>
        </div>
      </div>
      <style>{`@keyframes dotB{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  );
}

// ─── Calendar Tab (simple) ────────────────────────────────────
function CalendarTab({ lessons }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getLessonsForDay = (d) => {
    if (!d) return [];
    const ds = fmt(d);
    return lessons.filter(l => l.date === ds && l.status !== 'iptal');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Takvim</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>‹</button>
          <span style={{ fontWeight: 700, color: '#111827', minWidth: 140, textAlign: 'center', fontSize: '1rem' }}>{format(currentDate, 'MMMM yyyy', { locale: tr })}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>›</button>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
          {dayNames.map(d => <div key={d} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, i) => {
            const dayLessons = getLessonsForDay(d);
            const isCurrentDay = d && isToday(d);
            return (
              <div key={i} style={{ borderRight: '1px solid #f9fafb', borderBottom: '1px solid #f9fafb', padding: '0.5rem', minHeight: 80, background: isCurrentDay ? '#eef2ff' : 'white' }}>
                {d && <div style={{ fontSize: '0.82rem', fontWeight: isCurrentDay ? 800 : 500, color: isCurrentDay ? '#4f46e5' : '#374151', marginBottom: '0.25rem' }}>{d.getDate()}</div>}
                {dayLessons.slice(0, 2).map(l => (
                  <div key={l.id} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.35rem', borderRadius: 4, background: l.status === 'tamamlandı' ? '#d1fae5' : '#eef2ff', color: l.status === 'tamamlandı' ? '#065f46' : '#4f46e5', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.startTime} {l.studentName.split(' ')[0]}
                  </div>
                ))}
                {dayLessons.length > 2 && <div style={{ fontSize: '0.62rem', color: '#9ca3af', fontWeight: 600 }}>+{dayLessons.length - 2} daha</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdvertiseDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    demoBase44.entities.Student.list().then(setStudents);
    demoBase44.entities.Lesson.list().then(setLessons);
    demoBase44.entities.Payment.list().then(setPayments);
    demoBase44.entities.LessonReport.list().then(setReports);
  }, []);

  const activeStudents = students.filter(s => s.status === 'active');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Demo Banner */}
      <div style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={13} color='#fbbf24' fill='#fbbf24' />
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>Bu bir demo hesabıdır — tüm Pro özellikler aktif</span>
        </div>
        <a href="/" style={{ background: 'white', color: '#4f46e5', borderRadius: 20, padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          Ücretsiz Kaydol →
        </a>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 40px)' }}>
        <Sidebar active={activeTab} onNav={setActiveTab} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: 1200 }}>
          {activeTab === 'dashboard' && <DashboardTab students={students} lessons={lessons} payments={payments} />}
          {activeTab === 'students'  && <StudentsTab students={students} />}
          {activeTab === 'lessons'   && <LessonsTab lessons={lessons} />}
          {activeTab === 'calendar'  && <CalendarTab lessons={lessons} />}
          {activeTab === 'finance'   && <FinanceTab students={activeStudents} lessons={lessons} payments={payments} />}
          {activeTab === 'reports'   && <ReportsTab students={activeStudents} reports={reports} />}
          {activeTab === 'assistant' && <AssistantTab />}
        </main>
      </div>
    </div>
  );
}