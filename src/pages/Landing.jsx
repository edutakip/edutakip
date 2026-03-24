import React, { useEffect, useState, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { BookOpen, Shield, TrendingUp, Users, ChevronRight, GraduationCap, Star, CheckCircle, Zap, Calendar, MessageCircle, DollarSign } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const FEATURES = [
  { icon: BookOpen, title: 'Ders Planlama', desc: 'Haftalık takvim, tekrarlayan dersler ve online/yüz yüze seçeneği', color: '#6366f1' },
  { icon: TrendingUp, title: 'Finans Takibi', desc: 'Nakit ve havale ödemelerini kaydet, gelir grafiklerini görüntüle', color: '#10b981' },
  { icon: Users, title: 'Veli Bağlantısı', desc: 'Davet kodu ile velileri sisteme bağla, anlık bildirimler gönder', color: '#f59e0b' },
  { icon: Shield, title: 'Güvenli & Hızlı', desc: 'Verileriniz güvende, her cihazdan erişin', color: '#3b82f6' },
  { icon: MessageCircle, title: 'WhatsApp Entegrasyonu', desc: 'Ders bildirimleri ve değerlendirmeleri veliye otomatik gönder', color: '#25d366' },
  { icon: BookOpen, title: 'AI Ders Raporu', desc: 'Yapay zeka destekli pedagojik ders değerlendirme raporları oluştur', color: '#8b5cf6' },
];

const STEPS = [
  { icon: GraduationCap, title: 'Kayıt Ol', desc: 'Google hesabınla saniyeler içinde ücretsiz kayıt ol', color: '#6366f1', num: '1' },
  { icon: Users, title: 'Öğrenci Ekle', desc: 'Öğrencilerini ekle, veli bilgilerini kaydet', color: '#10b981', num: '2' },
  { icon: Calendar, title: 'Ders Planla', desc: 'Takvimden dersleri planla, online veya yüz yüze', color: '#f59e0b', num: '3' },
  { icon: DollarSign, title: 'Takip Et', desc: 'Ödemeleri, ödevleri ve gelişimi tek ekrandan yönet', color: '#3b82f6', num: '4' },
];

const TESTIMONIALS = [
  { name: 'Elif Yılmaz', role: 'Matematik Öğretmeni', text: 'Artık ödeme takibinde hiç sorun yaşamıyorum. Velilerle iletişim çok kolaylaştı.', stars: 5, city: 'İstanbul' },
  { name: 'Mehmet Kara', role: 'İngilizce Öğretmeni', text: 'AI ders raporu özelliği inanılmaz. Velilerden çok olumlu geri dönüşler alıyorum.', stars: 5, city: 'Ankara' },
  { name: 'Ayşe Demir', role: 'Fizik Öğretmeni', text: 'Takvim özelliği hayatımı kurtardı. Artık hiçbir dersi kaçırmıyorum.', stars: 5, city: 'İzmir' },
];

const FREE_PLAN = {
  name: 'Ücretsiz',
  price: '₺0',
  period: 'sonsuza kadar',
  desc: 'Başlamak için ideal',
  features: ['5 öğrenciye kadar', 'Ders takvimi', 'Temel finans takibi', 'WhatsApp bildirimleri'],
  cta: 'Hemen Başla',
};

const MESSAGES = [
  { from: 'Veli',       time: '08:47', text: 'Hocam bu hafta ders var mi? Programi unuttuk', side: 'left',  color: '#3b82f6' },
  { from: 'Ogrenci',    time: '10:32', text: 'Hocam hangi sayfadaydik? Defterimi kaybettim', side: 'left',  color: '#22c55e' },
  { from: 'Ic Sesiniz', time: '13:40', text: '3 aydir odeme alamadim su aileden...', side: 'right', color: '#a855f7' },
  { from: 'Veli',       time: '17:20', text: 'Bu ay toplam kac ders yaptik hocam?', side: 'left',  color: '#3b82f6' },
  { from: 'Ogrenci',    time: '16:20', text: 'Hocam bu haftaya odev var miydi?',    side: 'left',  color: '#22c55e' },
  { from: 'Ic Sesiniz', time: '21:45', text: 'Yine pazar aksami, yine saatlerce planlama...', side: 'right', color: '#a855f7' },
  { from: 'Veli',       time: '09:15', text: 'Gecen ayin odemesini yapmistik ya hocam?', side: 'left', color: '#3b82f6' },
  { from: 'Ic Sesiniz', time: '22:30', text: 'Bir daha Excele girersem cildıracagim...', side: 'right', color: '#a855f7' },
];

function SiradanGun() {
  const sectionRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const started = useRef(false);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let i = 0;
        const tick = () => {
          if (i < MESSAGES.length) {
            i++;
            setVisibleCount(i);
            setTimeout(tick, 650);
          }
        };
        setTimeout(tick, 400);
      }
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section ref={sectionRef} style={{ background: '#080b14', padding: isMobile ? '4rem 1rem' : '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center', position: 'relative' }}>

        <div>
          <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: 25, padding: '0.35rem 1rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.25)' }}>
            Tanidik Geldi Mi?
          </span>
          <h2 style={{ color: 'white', fontSize: isMobile ? '2.25rem' : 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '1.25rem' }}>
            Bir Ogretmenin
            <br />
            <span style={{ background: 'linear-gradient(120deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Siradan Gunu
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Her gun ayni sorular, ayni stres. Siz yalniz degilsiniz.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[['Veli Mesajlari', '#3b82f6'], ['Ogrenci Mesajlari', '#22c55e'], ['Ic Sesiniz', '#a855f7']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: isMobile ? 'auto' : 480 }}>
          {MESSAGES.map((msg, i) => {
            const visible = i < visibleCount;
            const isRight = msg.side === 'right';
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : (isRight ? 'translateX(20px)' : 'translateX(-20px)'),
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}>
                <div style={{ maxWidth: isMobile ? '90%' : '82%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', justifyContent: isRight ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: msg.color }}>{msg.from}</span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>{msg.time}</span>
                  </div>
                  <div style={{ background: isRight ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + msg.color + '30', borderRadius: isRight ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '0.7rem 1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleCount >= MESSAGES.length && (
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '1rem 1.25rem', transition: 'opacity 0.4s ease' }}>
              <p style={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.95rem', margin: '0 0 0.25rem' }}>Her Hafta Ayni Kaos</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>Peki ya bunlarin hepsini tek yerden cozebilseydiniz?</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


export default function Landing() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [studentCount, setStudentCount] = useState(20);
  const perStudentPrice = 50;
  const baseTotal = studentCount * perStudentPrice;
  const totalWithoutVat = Math.round(baseTotal);
  const timeSavedHours = Math.round(studentCount * 0.5);
  const sliderPct = ((studentCount - 1) / (60 - 1)) * 100;

  useEffect(() => {
    document.body.style.background = '#f5f7fa';
    const role = localStorage.getItem('tilki_role');
    if (role === 'teacher') window.location.href = createPageUrl('TeacherDashboard');
    else if (role === 'parent') window.location.href = createPageUrl('ParentDashboard');
  }, []);

  const selectRole = (role) => setSelectedRole(role);

  const handleAuthSuccess = () => {
    window.location.href = createPageUrl(selectedRole === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif", color: '#111827', overflow: 'hidden' }}>
      {selectedRole && <AuthModal role={selectedRole} onClose={() => setSelectedRole(null)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sliderGlow { 0%, 100% { box-shadow: 0 0 0 rgba(249,115,22,0.35); } 50% { box-shadow: 0 0 14px rgba(249,115,22,0.45); } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(229,231,235,0.5)', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: '38px', height: '38px', borderRadius: '12px' }} />
          <span style={{ fontWeight: '900', fontSize: '1.25rem', color: '#111827', letterSpacing: '-0.6px' }}>EduTakip</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => selectRole('parent')}
            style={{ background: 'none', border: '1.5px solid #e5e7eb', color: '#374151', borderRadius: '10px', padding: '0.55rem 1.25rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
            Veli Girişi
          </button>
          <button onClick={() => selectRole('teacher')}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(79,70,229,0.35)' }}>
            Öğretmen Girişi
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)', padding: '6rem 2rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 1s' }} />

        <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: '90px', height: '90px', borderRadius: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }} />
              <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>EduTakip</span>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', padding: '0.4rem 1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.95)', marginBottom: '2rem', fontWeight: '600', backdropFilter: 'blur(10px)' }}>
            <Zap size={13} fill='currentColor' color='#fbbf24' /> Özel Ders Yönetiminde Yeni Nesil Platform
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '1.5rem' }}>
            Özel Dersinizi<br />
            <span style={{ background: 'linear-gradient(120deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'brightness(1.3)' }}>Profesyonel Yönetin</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '550px', margin: '0 auto 2.5rem' }}>
            Ders takvimi, öğrenci takibi, ödeme yönetimi ve veli iletişimini tek platformda gerçekleştirin.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background: 'white', border: 'none', color: '#4f46e5', borderRadius: '12px', padding: '1rem 2rem', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', animation: 'float 3s ease-in-out infinite' }}>
              <GraduationCap size={19} /> Öğretmen Paneli <ChevronRight size={17} />
            </button>
            <button onClick={() => selectRole('parent')}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', padding: '1rem 2rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', backdropFilter: 'blur(15px)', animation: 'float 3s ease-in-out infinite 0.15s' }}>
              <Users size={19} /> Veli Paneli <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '5rem', position: 'relative' }}>
          {[['500+', 'Aktif Öğretmen'], ['8K+', 'Öğrenci'], ['₺2M+', 'Yönetilen Ödeme'], ['4.9★', 'Kullanıcı Puanı']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.9rem', fontWeight: '950', letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: '500' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BİR ÖĞRETMENİN SIRADAN GÜNÜ */}
      <SiradanGun />

      {/* NASIL ÇALIŞIR */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4338ca', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>Nasıl Çalışır?</span>
          <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.8px' }}>4 Adımda Başlayın</h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>Kurulum gerektirmez, hemen kullanmaya başlayın</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {STEPS.map(({ icon: Icon, title, desc, color, num }) => (
            <div key={num} style={{ background: 'white', borderRadius: 18, padding: '2rem 1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%', background: color + '18', color, fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{num}</div>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Icon size={24} color={color} />
              </div>
              <h4 style={{ fontWeight: 800, color: '#111827', marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h4>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f5f7fa 100%)', borderTop: '1px solid rgba(229,231,235,0.5)', padding: '5.5rem 2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: '#15803d', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>Özellikler</span>
            <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.8px' }}>Güçlü araçlar, basit arayüz</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>Tüm ihtiyacınız olan özellikleri tek platformda bulun</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: 'white', borderRadius: '18px', border: '1.5px solid #e5e7eb', padding: '2rem', transition: 'all 0.3s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `linear-gradient(135deg, ${color}15, transparent)`, borderRadius: '50%', transform: 'translate(40px, -40px)' }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={22} color={color} strokeWidth={1.5} />
                </div>
                <h4 style={{ color: '#111827', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.7' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>Kullanıcı Yorumları</span>
          <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.8px' }}>Öğretmenler EduTakip'i Seviyor</h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Binlerce öğretmenin güvendiği platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {TESTIMONIALS.map(({ name, role, text, stars, city }) => (
            <div key={name} style={{ background: 'white', borderRadius: 18, padding: '1.75rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}>
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                {[...Array(stars)].map((_, i) => <Star key={i} size={16} fill='#f59e0b' color='#f59e0b' />)}
              </div>
              <p style={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{text}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>{name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.1rem' }}>{role}</div>
                </div>
                <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 20 }}>{city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: 'linear-gradient(180deg, #f9fafb, #f5f7fa)', borderTop: '1px solid rgba(229,231,235,0.5)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', color: '#6d28d9', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '25px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>Fiyatlandırma</span>
            <h2 style={{ color: '#111827', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.8px' }}>Şeffaf Fiyatlandırma</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>İlk ay ücretsiz — kredi kartı gerekmez</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '0.25rem' }}>{FREE_PLAN.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{FREE_PLAN.desc}</p>
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827' }}>{FREE_PLAN.price}</span>
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af', marginLeft: '0.4rem' }}>/ {FREE_PLAN.period}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                {FREE_PLAN.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={15} color='#10b981' />
                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => selectRole('teacher')}
                style={{ width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                {FREE_PLAN.cta}
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 22, padding: '1.8rem', border: '1.5px solid #ddd6fe', boxShadow: '0 16px 48px rgba(79,70,229,0.16)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '0.35rem 0.9rem', borderRadius: 20, boxShadow: '0 6px 14px rgba(249,115,22,0.3)' }}>
                İLK ÖĞRETMENLERE ÖZEL
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '0.6rem' }}>Pro Paket Hesaplayıcı</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '1.6rem', textDecoration: 'line-through', fontWeight: 600 }}>
                    {Math.round(totalWithoutVat * 1.25).toLocaleString('tr-TR')}₺
                  </span>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                    {totalWithoutVat.toLocaleString('tr-TR')}₺
                  </span>
                </div>
                <span style={{ display: 'inline-block', marginTop: '0.55rem', padding: '0.2rem 0.7rem', borderRadius: 999, border: '1px solid #e5e7eb', fontSize: '0.82rem', color: '#6b7280' }}>
                  {perStudentPrice}₺ / öğrenci / ay + KDV
                </span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: '0.95rem 1rem', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '0.95rem' }}>Aktif öğrenci sayısı</span>
                  <span style={{ color: '#f97316', fontWeight: 900, fontSize: '1.25rem' }}>{studentCount}</span>
                </div>
                <div style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 999, background: '#e5e7eb' }} />
                  <div style={{ position: 'absolute', left: 0, width: `${sliderPct}%`, height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #f59e0b, #f97316)', transition: 'width 0.25s ease' }} />
                  <input
                    type='range'
                    min={1}
                    max={60}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', opacity: 0, position: 'relative', zIndex: 3 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(${sliderPct}% - 12px)`,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'white',
                      border: '3px solid #f97316',
                      transition: 'left 0.25s ease',
                      animation: 'sliderGlow 2.2s ease-in-out infinite',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      WebkitUserDrag: 'none',
                      zIndex: 2,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '0.8rem', textAlign: 'center' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>Aylık Toplam Tutar</div>
                  <div style={{ color: '#111827', fontSize: '1.75rem', fontWeight: 900 }}>{totalWithoutVat.toLocaleString('tr-TR')}₺</div>
                </div>
                <div style={{ background: '#10b981', border: '1.5px solid #10b981', borderRadius: 12, padding: '0.8rem', textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>Kazancınız</div>
                  <div style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900 }}>~{timeSavedHours} saat</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.1rem' }}>
                {[
                  '30 gün ücretsiz deneme',
                  'Tüm özellikler tam sürüm',
                  'Pasif öğrenciler ücretsiz',
                  'İstediğiniz zaman iptal edin',
                  'AI ders raporu',
                  'Gelişmiş finans analizi',
                  'Veli paneli',
                  'Öncelikli destek',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <CheckCircle size={14} color='#10b981' />
                    <span style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => selectRole('teacher')}
                style={{ width: '100%', padding: '0.95rem', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(249,115,22,0.28)' }}>
                30 Gün Ücretsiz Başlayın
              </button>
              <p style={{ margin: '0.6rem 0 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', fontWeight: 600 }}>• Kredi kartı gerekmez</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.8px' }}>Hemen Başlayın</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>Binlerce öğretmenin tercih ettiği platforma katılın. Ücretsiz, kurulum gerektirmez.</p>
          <button onClick={() => selectRole('teacher')}
            style={{ background: 'white', border: 'none', color: '#4f46e5', borderRadius: 12, padding: '1rem 2.5rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <GraduationCap size={20} /> Ücretsiz Başla <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
        © 2026 EduTakip · Özel Ders Yönetim Platformu · Tüm hakları saklıdır.
      </footer>
    </div>
  );
}