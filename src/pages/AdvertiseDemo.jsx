import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Users, CalendarCheck, CheckCircle, DollarSign, ChevronRight,
  MessageCircle, Plus, BarChart2, BookOpen, Bot, Star, TrendingUp,
  Clock, Check, X, Zap, GraduationCap, AlertCircle, Sparkles, Send
} from 'lucide-react';

// ── Demo Verileri ─────────────────────────────────────────────
const today = new Date();
const fmt = (d) => format(d, 'yyyy-MM-dd');

const DEMO_STUDENTS = [
  { id: 's1', name: 'Zeynep Arslan',  grade: '10. Sınıf', subject: 'Matematik', feePerLesson: 400, parentName: 'Ayşe Arslan', parentPhone: '0532 xxx xxxx' },
  { id: 's2', name: 'Mert Kaya',      grade: '11. Sınıf', subject: 'Fizik',     feePerLesson: 450, parentName: 'Ali Kaya',    parentPhone: '0541 xxx xxxx' },
  { id: 's3', name: 'Elif Demir',     grade: '9. Sınıf',  subject: 'Kimya',     feePerLesson: 380, parentName: 'Fatma Demir', parentPhone: '0555 xxx xxxx' },
  { id: 's4', name: 'Can Yılmaz',     grade: '12. Sınıf', subject: 'Türkçe',    feePerLesson: 350, parentName: 'Hüseyin Yılmaz', parentPhone: '0544 xxx xxxx' },
  { id: 's5', name: 'Selin Çelik',    grade: '8. Sınıf',  subject: 'İngilizce', feePerLesson: 320, parentName: 'Merve Çelik', parentPhone: '0533 xxx xxxx' },
];

const DEMO_LESSONS = [
  { id: 'l1', studentId: 's1', studentName: 'Zeynep Arslan', date: fmt(today), startTime: '10:00', endTime: '11:00', subject: 'Türev ve İntegral', status: 'planlandı', lessonFee: 400 },
  { id: 'l2', studentId: 's2', studentName: 'Mert Kaya',     date: fmt(today), startTime: '13:00', endTime: '14:30', subject: 'Elektromagnetizma', status: 'tamamlandı', lessonFee: 450 },
  { id: 'l3', studentId: 's3', studentName: 'Elif Demir',    date: fmt(addDays(today,1)), startTime: '09:00', endTime: '10:00', subject: 'Organik Kimya', status: 'planlandı', lessonFee: 380 },
  { id: 'l4', studentId: 's4', studentName: 'Can Yılmaz',    date: fmt(addDays(today,1)), startTime: '15:00', endTime: '16:00', subject: 'Divan Edebiyatı', status: 'planlandı', lessonFee: 350 },
  { id: 'l5', studentId: 's5', studentName: 'Selin Çelik',   date: fmt(addDays(today,2)), startTime: '11:00', endTime: '12:00', subject: 'Present Perfect', status: 'planlandı', lessonFee: 320 },
  { id: 'l6', studentId: 's1', studentName: 'Zeynep Arslan', date: fmt(subDays(today,1)), startTime: '10:00', endTime: '11:00', subject: 'Limit ve Süreklilik', status: 'tamamlandı', lessonFee: 400 },
  { id: 'l7', studentId: 's2', studentName: 'Mert Kaya',     date: fmt(subDays(today,2)), startTime: '13:00', endTime: '14:30', subject: 'Mekanik Dalgalar', status: 'tamamlandı', lessonFee: 450 },
  { id: 'l8', studentId: 's3', studentName: 'Elif Demir',    date: fmt(subDays(today,3)), startTime: '09:00', endTime: '10:00', subject: 'Asit-Baz Dengesi', status: 'tamamlandı', lessonFee: 380 },
];

const DEMO_PAYMENTS = [
  { id: 'p1', studentId: 's1', studentName: 'Zeynep Arslan', amount: 1200, status: 'bekliyor', date: fmt(subDays(today,5)) },
  { id: 'p2', studentId: 's2', studentName: 'Mert Kaya',     amount: 900,  status: 'bekliyor', date: fmt(subDays(today,3)) },
  { id: 'p3', studentId: 's4', studentName: 'Can Yılmaz',    amount: 700,  status: 'gecikmiş', date: fmt(subDays(today,12)) },
  { id: 'p4', studentId: 's3', studentName: 'Elif Demir',    amount: 380,  status: 'alındı',   date: fmt(subDays(today,2)) },
  { id: 'p5', studentId: 's5', studentName: 'Selin Çelik',   amount: 960,  status: 'alındı',   date: fmt(subDays(today,7)) },
];

const DEMO_REPORTS = [
  { id: 'r1', studentName: 'Zeynep Arslan', date: fmt(subDays(today,1)), subject: 'Matematik', rating: 5, attendance: 'katıldı', generalNote: 'Türev konusunu çok hızlı kavradı. İntegrale hazır.', improvements: 'Hız hesaplamalarında dikkat' },
  { id: 'r2', studentName: 'Mert Kaya',     date: fmt(subDays(today,2)), subject: 'Fizik',     rating: 4, attendance: 'katıldı', generalNote: 'Dalgalar konusunda iyiydi ancak formülleri karıştırıyor.', improvements: 'Formül kartları çıkarması önerildi' },
  { id: 'r3', studentName: 'Elif Demir',    date: fmt(subDays(today,3)), subject: 'Kimya',     rating: 3, attendance: 'geç kaldı', generalNote: 'Asit-baz konusu tekrar gerektirebilir.', improvements: 'pH hesaplamalarını tekrar et' },
];

const AVATAR_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const getDayLabel = (dateStr) => {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const todayStr = fmt(new Date());
    const tomStr = fmt(addDays(new Date(), 1));
    if (dateStr === todayStr) return 'Bugün';
    if (dateStr === tomStr) return 'Yarın';
    return format(d, 'EEE, d MMM', { locale: tr });
  } catch { return dateStr; }
};

const ratingColor = (r) => r >= 5 ? '#10b981' : r >= 4 ? '#6366f1' : r >= 3 ? '#f59e0b' : '#ef4444';

// ── Sekme bileşeni ────────────────────────────────────────────
function Tab({ label, icon: Icon, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.55rem 1rem', borderRadius: 10, border: 'none',
      background: active ? '#4f46e5' : 'transparent',
      color: active ? 'white' : '#6b7280',
      fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
      transition: 'all 0.15s', position: 'relative',
    }}>
      <Icon size={15} />
      {label}
      {badge > 0 && (
        <span style={{ background: active ? 'rgba(255,255,255,0.3)' : '#ef4444', color: 'white', borderRadius: 10, fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', marginLeft: 2 }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── AI Asistan Demo ───────────────────────────────────────────
const AI_DEMO_MESSAGES = [
  { role: 'assistant', content: 'Merhaba Hocam! 👋 Ben EduTakip Asistanı. Öğrenci takibi, ödemeler ve ders programınız hakkında yardımcı olabilirim.' },
  { role: 'user', content: 'Bu ay kaç ödeme bekliyor?' },
  { role: 'assistant', content: 'Bu ay **3 öğrencinizden** toplam **₺2.800 bekleyen ödeme** bulunuyor:\n\n- 🔴 **Can Yılmaz** — ₺700 (12 gün gecikmiş)\n- 🟡 **Zeynep Arslan** — ₺1.200 (5 gün)\n- 🟡 **Mert Kaya** — ₺900 (3 gün)\n\nWhatsApp hatırlatması göndermemi ister misiniz?' },
];

function AIDemo() {
  const [messages, setMessages] = useState(AI_DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const DEMO_ANSWERS = [
    { keywords: ['öğrenci', 'kaç', 'aktif'], answer: 'Şu anda **5 aktif öğrenciniz** var: Zeynep, Mert, Elif, Can ve Selin. Toplam aylık potansiyel geliriniz **₺1.900/ders** seviyesinde.' },
    { keywords: ['bugün', 'ders', 'program'], answer: 'Bugün **2 dersiniz** var:\n\n- ✅ **10:00** Zeynep Arslan — Türev ve İntegral (planlandı)\n- ✅ **13:00** Mert Kaya — Elektromagnetizma (tamamlandı)\n\nİyi dersler Hocam! 🌟' },
    { keywords: ['ödev', 'tamamlanmamış'], answer: 'Şu anda **2 tamamlanmamış ödev** var:\n\n- 📚 **Elif Demir** — Organik Kimya problemleri (son teslim: yarın)\n- 📚 **Can Yılmaz** — Divan şiiri analizi (gecikmiş ⚠️)' },
    { keywords: ['rapor', 'performans', 'en iyi'], answer: '**En yüksek performanslı öğrenciniz Zeynep Arslan** — son 3 derste ortalama ⭐ 4.8/5.\n\n**Dikkat edilmesi gereken:** Elif Demir son raporda 3/5 aldı, motivasyon desteği faydalı olabilir.' },
  ];

  const sendMessage = () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const match = DEMO_ANSWERS.find(a => a.keywords.some(k => lower.includes(k)));
      const answer = match?.answer || 'Anladım Hocam! Bu konuda size yardımcı olmak isterim. Demo modunda sınırlı yanıt verebiliyorum, gerçek hesapta tüm verilerinize erişimim olacak. 😊';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 420, background: '#f4f6fb', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
        <div style={{ marginLeft: 'auto', background: '#eef2ff', borderRadius: 20, padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid #c7d2fe' }}>
          <Sparkles size={12} color='#4f46e5' />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4f46e5' }}>AI Destekli</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'white',
              color: m.role === 'user' ? 'white' : '#111827',
              fontSize: '0.83rem', lineHeight: 1.65,
              boxShadow: m.role === 'user' ? '0 2px 8px rgba(79,70,229,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {m.content.split('\n').map((line, j) => {
                const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <div key={j} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c7d2fe', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Bir şey sorun... (örn: bugünkü derslerim)"
          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', color: '#111827' }} />
        <button onClick={sendMessage} disabled={!input.trim() || loading}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={14} color={input.trim() && !loading ? 'white' : '#9ca3af'} />
        </button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────
export default function AdvertiseDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const totalUnpaid = DEMO_PAYMENTS.filter(p => p.status !== 'alındı').reduce((s, p) => s + p.amount, 0);
  const todayLessons = DEMO_LESSONS.filter(l => l.date === fmt(today));
  const completedThisMonth = DEMO_LESSONS.filter(l => l.status === 'tamamlandı').length;
  const pendingPayments = DEMO_PAYMENTS.filter(p => p.status !== 'alındı');

  const upcomingLessons = DEMO_LESSONS
    .filter(l => l.date >= fmt(today) && l.status !== 'iptal')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Demo Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
        padding: '0.65rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} color='#fbbf24' fill='#fbbf24' />
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>Bu bir demo hesabıdır — tüm Pro özellikler aktif</span>
        </div>
        <a href="/" style={{
          background: 'white', color: '#4f46e5', borderRadius: 20, padding: '0.3rem 1rem',
          fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          Ücretsiz Kaydol →
        </a>
      </div>

      {/* Fake Sidebar + Content layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #2e1b6e 100%)',
          display: 'flex', flexDirection: 'column',
          padding: '1.25rem 0.5rem',
          gap: '0.1rem',
          position: 'sticky', top: 0, height: 'calc(100vh - 44px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.75rem 1.25rem' }}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png"
              alt="EduTakip" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>EduTakip</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>Demo Hesabı</div>
            </div>
          </div>

          {[
            { id: 'dashboard', label: 'Genel Bakış', icon: '📊' },
            { id: 'students', label: 'Öğrencilerim', icon: '👥' },
            { id: 'lessons', label: 'Dersler', icon: '📚' },
            { id: 'finance', label: 'Finans', icon: '💰' },
            { id: 'reports', label: 'Gelişim Raporları', icon: '📈' },
            { id: 'assistant', label: 'AI Asistan', icon: '🤖' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.55rem 0.75rem', borderRadius: 10, border: 'none',
                background: activeTab === item.id ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.55)',
                fontWeight: activeTab === item.id ? 700 : 400, fontSize: '0.83rem',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                borderLeft: activeTab === item.id ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Pro badge */}
          <div style={{ marginTop: 'auto', margin: '1rem 0.5rem 0', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.2))', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(245,158,11,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Zap size={14} color='#fbbf24' fill='#fbbf24' />
              <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.78rem' }}>Pro Plan — Aktif</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', lineHeight: 1.5 }}>Sınırsız öğrenci · AI asistan · Raporlar</div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: 1100 }}>

          {/* ── DASHBOARD ─────────────────────── */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Genel Bakış</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.75rem' }}>{format(today, 'EEEE, d MMMM yyyy', { locale: tr })}</p>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Aktif Öğrenci', value: DEMO_STUDENTS.length, icon: Users, color: '#0ea5e9', bg: '#e0f2fe' },
                  { label: 'Bugünkü Dersler', value: todayLessons.length, icon: CalendarCheck, color: '#6366f1', bg: '#eef2ff' },
                  { label: 'Bu Ay Tamamlanan', value: completedThisMonth, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
                  { label: 'Bekleyen Ödeme', value: `₺${totalUnpaid.toLocaleString('tr-TR')}`, icon: DollarSign, color: '#f59e0b', bg: '#fef3c7' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming + Unpaid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Yaklaşan Dersler</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {upcomingLessons.slice(0, 5).map(l => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f9fafb' }}>
                        <div style={{ textAlign: 'center', minWidth: 40 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{l.startTime}</div>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.status === 'tamamlandı' ? '#10b981' : '#6366f1', margin: '4px auto 0' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>{l.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{l.subject} · {getDayLabel(l.date)}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 8, background: l.status === 'tamamlandı' ? '#d1fae5' : '#eef2ff', color: l.status === 'tamamlandı' ? '#065f46' : '#4f46e5' }}>
                          {l.status === 'tamamlandı' ? 'Bitti' : 'Planlandı'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Bekleyen Ödemeler</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {pendingPayments.map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < pendingPayments.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(p.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>{getInitials(p.studentName)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>{p.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: p.status === 'gecikmiş' ? '#ef4444' : '#9ca3af' }}>
                            {p.status === 'gecikmiş' ? '⚠️ Gecikmiş' : 'Bekliyor'}
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem' }}>₺{p.amount.toLocaleString('tr-TR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÖĞRENCİLER ────────────────────── */}
          {activeTab === 'students' && (
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '1.75rem' }}>Öğrencilerim</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {DEMO_STUDENTS.map(s => (
                  <div key={s.id} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: getColor(s.name), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white' }}>{getInitials(s.name)}</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.grade}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#9ca3af' }}>Ders</span>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{s.subject}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#9ca3af' }}>Ücret</span>
                        <span style={{ fontWeight: 600, color: '#374151' }}>₺{s.feePerLesson}/saat</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#9ca3af' }}>Veli</span>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{s.parentName}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.5rem 0.85rem', background: '#eef2ff', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textAlign: 'center', cursor: 'pointer' }}>
                      Detayları Gör →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DERSLER ───────────────────────── */}
          {activeTab === 'lessons' && (
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '1.75rem' }}>Dersler</h1>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {DEMO_LESSONS.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)).map((l, i) => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.5rem', borderBottom: i < DEMO_LESSONS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: l.status === 'tamamlandı' ? '#10b981' : '#6366f1' }} />
                    <div style={{ minWidth: 100 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{getDayLabel(l.date)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{l.startTime} – {l.endTime}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{l.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{l.subject}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.85rem' }}>₺{l.lessonFee}</div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 8,
                      background: l.status === 'tamamlandı' ? '#d1fae5' : '#eef2ff',
                      color: l.status === 'tamamlandı' ? '#065f46' : '#4f46e5',
                    }}>
                      {l.status === 'tamamlandı' ? '✓ Tamamlandı' : '● Planlandı'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FİNANS ────────────────────────── */}
          {activeTab === 'finance' && (
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '1.75rem' }}>Finans</h1>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Bu Ay Tahsilat', value: `₺${DEMO_PAYMENTS.filter(p=>p.status==='alındı').reduce((s,p)=>s+p.amount,0).toLocaleString('tr-TR')}`, color: '#10b981', bg: '#d1fae5', icon: '✅' },
                  { label: 'Bekleyen', value: `₺${totalUnpaid.toLocaleString('tr-TR')}`, color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
                  { label: 'Gecikmiş', value: `₺${DEMO_PAYMENTS.filter(p=>p.status==='gecikmiş').reduce((s,p)=>s+p.amount,0).toLocaleString('tr-TR')}`, color: '#ef4444', bg: '#fee2e2', icon: '⚠️' },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color, marginBottom: '0.25rem' }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#111827' }}>Ödeme Geçmişi</div>
                {DEMO_PAYMENTS.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < DEMO_PAYMENTS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(p.studentName), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.72rem', color: 'white' }}>{getInitials(p.studentName)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>{p.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{p.date}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.9rem' }}>₺{p.amount.toLocaleString('tr-TR')}</div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 8,
                      background: p.status === 'alındı' ? '#d1fae5' : p.status === 'gecikmiş' ? '#fee2e2' : '#fef3c7',
                      color: p.status === 'alındı' ? '#065f46' : p.status === 'gecikmiş' ? '#b91c1c' : '#92400e',
                    }}>
                      {p.status === 'alındı' ? '✓ Alındı' : p.status === 'gecikmiş' ? '⚠ Gecikmiş' : '⏳ Bekliyor'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RAPORLAR ──────────────────────── */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>Gelişim Raporları</h1>
                <span style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, color: '#92400e', border: '1px solid #fbbf24' }}>Pro</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {DEMO_REPORTS.map(r => (
                  <div key={r.id} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: ratingColor(r.rating) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: ratingColor(r.rating) }}>{r.rating}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{r.studentName} — {r.subject} · {getDayLabel(r.date)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', lineHeight: 1.6 }}>{r.generalNote}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1,2,3,4,5].map(n => <Star key={n} size={13} fill={n <= r.rating ? '#f59e0b' : 'none'} color={n <= r.rating ? '#f59e0b' : '#e5e7eb'} />)}
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 8,
                        background: r.attendance === 'katıldı' ? '#d1fae5' : '#fef3c7',
                        color: r.attendance === 'katıldı' ? '#065f46' : '#92400e',
                      }}>
                        {r.attendance === 'katıldı' ? 'Katıldı' : 'Geç Kaldı'}
                      </span>
                    </div>
                    {r.improvements && (
                      <div style={{ background: '#fef3c7', borderTop: '1px solid #fde68a', padding: '0.6rem 1.5rem', fontSize: '0.78rem', color: '#92400e' }}>
                        ⚡ <strong>Dikkat:</strong> {r.improvements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI ASİSTAN ────────────────────── */}
          {activeTab === 'assistant' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>EduTakip Asistanı</h1>
                <span style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, color: '#4f46e5', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={11} /> AI Destekli
                </span>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Bu ay kim ödeme yapmadı?', 'Bugünkü derslerim?', 'Tamamlanmamış ödevler var mı?', 'En iyi performanslı öğrencim kim?'].map(q => (
                  <button key={q} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>

              <AIDemo />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}