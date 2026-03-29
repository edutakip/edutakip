import React, { useEffect, useState, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { CheckCircle, GraduationCap, Users, ChevronRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const FREE_PLAN = {
  name: 'Ücretsiz',
  price: '₺0',
  period: 'sonsuza kadar',
  desc: 'Başlamak için ideal',
  features: ['5 öğrenciye kadar', 'Ders takvimi', 'Temel finans takibi', 'WhatsApp bildirimleri'],
  cta: 'Hemen Başla',
};

// Helper: section that animates .anim-scroll children on scroll
function AnimSection({ children, id, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    ref.current.querySelectorAll('.anim-scroll').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return <section ref={ref} id={id} style={style}>{children}</section>;
}

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [studentCount, setStudentCount] = useState(20);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const perStudentPrice = 50;
  const totalWithoutVat = Math.round(studentCount * perStudentPrice);
  const timeSavedHours = Math.round(studentCount * 0.5);
  const sliderPct = ((studentCount - 1) / (60 - 1)) * 100;
  const isMobile = windowWidth < 768;
  const isNarrow = windowWidth < 430;

  useEffect(() => {
    document.body.style.background = '#fff';
    const role = localStorage.getItem('tilki_role');
    if (role === 'teacher') window.location.href = createPageUrl('TeacherDashboard');
    else if (role === 'parent') window.location.href = createPageUrl('ParentDashboard');
  }, []);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectRole = (role) => setSelectedRole(role);
  const handleAuthSuccess = () => {
    window.location.href = createPageUrl(selectedRole === 'teacher' ? 'TeacherDashboard' : 'ParentDashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif", color: '#1e293b', overflowX: 'hidden' }}>
      {selectedRole && <AuthModal role={selectedRole} onClose={() => setSelectedRole(null)} onSuccess={handleAuthSuccess} />}

      <style>{`
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(24px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes sliderGlow { 0%,100%{box-shadow:0 0 0 rgba(249,115,22,.35)} 50%{box-shadow:0 0 14px rgba(249,115,22,.45)} }
        .anim-scroll{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}
        .anim-scroll.visible{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s} .d4{transition-delay:.4s} .d5{transition-delay:.5s}
        .feature-card:hover{transform:translateY(-6px)!important;box-shadow:0 20px 60px rgba(124,58,237,.12)!important;border-color:#a78bfa!important}
        .sc-card:hover{transform:translateY(-4px) scale(1.02)!important;box-shadow:0 20px 50px rgba(124,58,237,.25)!important}
        .sc-card:hover .sc-overlay{opacity:1!important}
        .testimonial-card:hover{box-shadow:0 12px 40px rgba(124,58,237,.1)!important;transform:translateY(-3px)!important}
        .step-badge{display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:rgba(16,185,129,.1);color:#10b981;padding:5px 14px;border-radius:20px;font-size:.78rem;font-weight:600}
        .tab-btn{padding:8px 20px;border-radius:50px;font-size:.85rem;font-weight:600;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;cursor:pointer;transition:all .2s}
        .tab-btn.active{background:#7c3aed;color:#fff;border-color:#7c3aed}
        .tab-btn:hover:not(.active){border-color:#7c3aed;color:#7c3aed}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 5%', height:70, background:'rgba(15,23,42,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(124,58,237,.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width:38, height:38, borderRadius:10 }} />
          <span style={{ fontWeight:800, fontSize:'1.4rem', color:'#fff', letterSpacing:'-.5px' }}>EduTakip</span>
        </div>
        {!isMobile && (
          <ul style={{ display:'flex', gap:'2rem', listStyle:'none' }}>
            {[['#features','Özellikler'],['#how-it-works','Nasıl Çalışır'],['#screenshots','Ekran Görüntüleri'],['#pricing','Fiyatlar']].map(([href,label]) => (
              <li key={href}><a href={href} style={{ color:'rgba(255,255,255,.75)', textDecoration:'none', fontSize:'.9rem', fontWeight:500 }}>{label}</a></li>
            ))}
          </ul>
        )}
        {/* ── GİRİŞ BUTONLARI (orijinal) ── */}
        <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
          <button onClick={() => selectRole('parent')}
            style={{ background:'none', border:'1.5px solid rgba(255,255,255,.25)', color:'rgba(255,255,255,.85)', borderRadius:8, padding:'8px 18px', fontWeight:600, fontSize:'.85rem', cursor:'pointer' }}>
            Veli Girişi
          </button>
          <button onClick={() => selectRole('teacher')}
            style={{ background:'#7c3aed', border:'none', color:'white', borderRadius:8, padding:'9px 22px', fontWeight:700, fontSize:'.85rem', cursor:'pointer', boxShadow:'0 4px 15px rgba(124,58,237,.4)' }}>
            Öğretmen Girişi
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 100%)', position:'relative', overflow:'hidden', padding:'100px 5% 60px' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', filter:'blur(80px)', opacity:.25, background:'#7c3aed', top:-200, right:-150, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', filter:'blur(80px)', opacity:.25, background:'#f97316', bottom:-100, left:-100, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', filter:'blur(80px)', opacity:.25, background:'#10b981', top:'40%', left:'30%', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:820, margin:'0 auto' }}>
          <div style={{ marginBottom:28, animation:'fadeInDown .6s ease both' }}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width:80, height:80, borderRadius:20, boxShadow:'0 8px 30px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,58,237,.25)', border:'1px solid rgba(167,139,250,.4)', color:'#a78bfa', padding:'7px 18px', borderRadius:50, fontSize:'.82rem', fontWeight:600, marginBottom:28, animation:'fadeInDown .6s ease both' }}>
            <span style={{ width:7, height:7, background:'#a78bfa', borderRadius:'50%', animation:'pulse 1.5s infinite', display:'inline-block' }} />
            Özel Ders Öğretmenleri İçin Tasarlandı
          </div>
          <h1 style={{ fontSize:'clamp(2.4rem,5vw,3.8rem)', fontWeight:900, color:'#fff', lineHeight:1.15, marginBottom:22, animation:'fadeInUp .7s ease .1s both' }}>
            Tüm Öğrencilerinizi <span style={{ color:'#a78bfa' }}>Tek Platformda</span> Yönetin
          </h1>
          <p style={{ fontSize:'clamp(1rem,2vw,1.18rem)', color:'rgba(255,255,255,.75)', maxWidth:600, margin:'0 auto 38px', lineHeight:1.7, animation:'fadeInUp .7s ease .2s both' }}>
            EduTakip ile ders planlamasından finansal takibe, gelişim raporlarından AI destekli asistana kadar özel ders işinizi kolayca ve profesyonelce yönetin.
          </p>
          {/* ── HERO GİRİŞ BUTONLARI (orijinal) ── */}
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', animation:'fadeInUp .7s ease .3s both' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background:'#7c3aed', color:'#fff', padding:'14px 32px', borderRadius:10, fontWeight:700, fontSize:'1rem', cursor:'pointer', border:'none', boxShadow:'0 8px 30px rgba(124,58,237,.4)', display:'inline-flex', alignItems:'center', gap:8, animation:'float 3s ease-in-out infinite' }}>
              <GraduationCap size={19} /> Öğretmen Paneli <ChevronRight size={17} />
            </button>
            <button onClick={() => selectRole('parent')}
              style={{ background:'rgba(255,255,255,.1)', color:'#fff', padding:'14px 32px', borderRadius:10, fontWeight:600, fontSize:'1rem', cursor:'pointer', border:'1px solid rgba(255,255,255,.25)', display:'inline-flex', alignItems:'center', gap:8, animation:'float 3s ease-in-out infinite .15s' }}>
              <Users size={19} /> Veli Paneli <ChevronRight size={17} />
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:40, marginTop:56, flexWrap:'wrap', animation:'fadeInUp .7s ease .45s both' }}>
            {[['10+','Öğrenci Takibi'],['100%','Devam Takibi'],['AI','Destekli Asistan'],['₺0','Başlangıç Ücreti']].map(([val,lbl],i,arr) => (
              <React.Fragment key={lbl}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'2rem', fontWeight:800, color:'#fff' }}>{val}</div>
                  <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.55)', marginTop:3, fontWeight:500 }}>{lbl}</div>
                </div>
                {i < arr.length-1 && <div style={{ width:1, background:'rgba(255,255,255,.15)', alignSelf:'stretch' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <AnimSection id="features" style={{ background:'#f8fafc', padding:'90px 5%' }}>
        <div className="anim-scroll" style={{ textAlign:'center' }}>
          <span style={{ color:'#7c3aed', fontSize:'.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:2 }}>✦ Özellikler</span>
          <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'#0f172a', lineHeight:1.25, margin:'14px 0 16px' }}>Her Şey Bir Arada</h2>
          <p style={{ fontSize:'1.05rem', color:'#64748b', maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>Özel ders vermenin her adımını kolaylaştıran güçlü araçlar, tek bir platformda.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24, marginTop:56 }}>
          {[
            { icon:'📚', bg:'rgba(124,58,237,.1)', title:'Ders Yönetimi', desc:'Dersleri kolayca planlayın, konu ve notlarını kaydedin. Yüz yüze veya online ders tiplerini destekleyin. Tekrarlayan dersleri otomatik ekleyin.', tag:'Haftalık Tekrar', delay:'d1' },
            { icon:'👥', bg:'rgba(249,115,22,.1)', title:'Öğrenci Yönetimi', desc:'Tüm öğrencilerinizi kart görünümünde takip edin. Sınıf seviyesi, ders saati ücreti, aylık kazanç ve bakiye bilgilerine tek bakışta ulaşın.', tag:'Kart Görünümü', delay:'d2' },
            { icon:'💰', bg:'rgba(16,185,129,.1)', title:'Finans Takibi', desc:'Aylık gelir grafiklerinizi görün, bekleyen ödemeleri takip edin ve öğrenci bazlı kazanç analizinizi yapın. Düzenli gelir projeksiyonu oluşturun.', tag:'Gelir Analizi', delay:'d3' },
            { icon:'📊', bg:'rgba(59,130,246,.1)', title:'Gelişim Raporları', desc:'Her ders sonrası ayrıntılı gelişim raporu oluşturun. İşlenen konular, değerlendirme, ödev ve bir sonraki ders hedefini belirleyin. Veliyle paylaşın.', tag:'Veli Paylaşımı', delay:'d4' },
            { icon:'🗓️', bg:'rgba(124,58,237,.1)', title:'Akıllı Takvim', desc:'Haftalık ve günlük görünümde tüm derslerinizi takip edin. Ders durumunu (tamamlandı, gelmedi, iptal) anında güncelleyin.', tag:'Haftalık Görünüm', delay:'d5' },
            { icon:'🤖', bg:'rgba(234,179,8,.1)', title:'AI Destekli Asistan', desc:'"Bu ay kim ödeme yapmadı?", "Bugünkü derslerim neler?", "En çok zorlanan öğrencilerim kimler?" gibi sorularınızı anında cevaplayın.', tag:'AI Destekli', delay:'d1' },
          ].map(({ icon, bg, title, desc, tag, delay }) => (
            <div key={title} className={`anim-scroll feature-card ${delay}`}
              style={{ background:'#fff', borderRadius:18, padding:32, border:'1px solid #e2e8f0', transition:'all .3s', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              <div style={{ width:56, height:56, borderRadius:14, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', marginBottom:20 }}>{icon}</div>
              <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#0f172a', marginBottom:10 }}>{title}</h3>
              <p style={{ fontSize:'.93rem', color:'#64748b', lineHeight:1.65, marginBottom:16 }}>{desc}</p>
              <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, fontSize:'.75rem', fontWeight:600, background:'rgba(124,58,237,.1)', color:'#7c3aed' }}>{tag}</span>
            </div>
          ))}
        </div>
      </AnimSection>

      {/* ── HOW IT WORKS ── */}
      <AnimSection id="how-it-works" style={{ background:'#fff', padding:'90px 5%' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div className="anim-scroll">
            <span style={{ color:'#7c3aed', fontSize:'.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:2 }}>✦ Nasıl Çalışır</span>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'#0f172a', lineHeight:1.25, margin:'14px 0 16px' }}>3 Adımda Başlayın</h2>
            <p style={{ fontSize:'1.05rem', color:'#64748b', lineHeight:1.7 }}>Dakikalar içinde kurulum yapın ve hemen kullanmaya başlayın.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', marginTop:60, position:'relative' }}>
            <div style={{ position:'absolute', left:35, top:0, bottom:0, width:2, background:'linear-gradient(to bottom,#7c3aed,#a78bfa,transparent)', pointerEvents:'none' }} />
            {[
              { num:1, title:'Öğrencilerinizi Ekleyin', desc:'4 adımlı sihirbaz arayüzü ile öğrenci bilgilerini, veli iletişim bilgilerini, haftalık ders programını ve finansal detayları kolayca kaydedin. Her öğrenciye özel davet kodu oluşturulur.', badge:'✅ Kurulum 2 dakika sürer', delay:'d1' },
              { num:2, title:'Derslerinizi Planlayın', desc:'Takvim üzerinden veya "Ders Planla" butonu ile saniyeler içinde yeni ders oluşturun. Konu, ücret, yer ve ders türünü belirleyin. Tekrarlayan dersler için "Sonraki haftalara da ekle" seçeneğini kullanın.', badge:'✅ Otomatik tekrarlama desteği', delay:'d2' },
              { num:3, title:'Takip Edin ve Büyüyün', desc:'Genel bakış panelinden günlük özetinize bakın, finans ekranından gelirlerinizi analiz edin, gelişim raporlarıyla öğrencilerinizin ilerlemesini belgeleyin ve AI asistanınıza istediğiniz soruyu sorun.', badge:'✅ Gerçek zamanlı istatistikler', delay:'d3' },
            ].map(({ num, title, desc, badge, delay }) => (
              <div key={num} className={`anim-scroll ${delay}`} style={{ display:'flex', gap:28, paddingBottom:48 }}>
                <div style={{ width:70, height:70, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontWeight:800, color:'#fff', position:'relative', zIndex:1, boxShadow:'0 8px 24px rgba(124,58,237,.35)' }}>{num}</div>
                <div style={{ paddingTop:12, flex:1 }}>
                  <h3 style={{ fontSize:'1.2rem', fontWeight:700, color:'#0f172a', marginBottom:10 }}>{title}</h3>
                  <p style={{ fontSize:'.95rem', color:'#64748b', lineHeight:1.7, maxWidth:560 }}>{desc}</p>
                  <span className="step-badge">{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimSection>

      {/* ── SCREENSHOTS ── */}
      <AnimSection id="screenshots" style={{ background:'#f8fafc', padding:'90px 5%' }}>
        <div className="anim-scroll" style={{ textAlign:'center' }}>
          <span style={{ color:'#7c3aed', fontSize:'.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:2 }}>✦ Arayüz</span>
          <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'#0f172a', lineHeight:1.25, margin:'14px 0 16px' }}>Modern ve Kullanıcı Dostu</h2>
          <p style={{ fontSize:'1.05rem', color:'#64748b', maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>Tüm cihazlarda sorunsuz çalışan, sezgisel ve şık bir öğretmen paneli.</p>
        </div>
        <div className="anim-scroll" style={{ display:'flex', gap:10, flexWrap:'wrap', margin:'40px 0 36px', justifyContent:'center' }}>
          {['Tümü','Öğrenciler','Dersler','Finans','Raporlar'].map((label,i) => (
            <button key={label} className={`tab-btn${i===0?' active':''}`} onClick={e => {
              document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              e.currentTarget.classList.add('active');
              const cats = { Tümü:'all', Öğrenciler:'ogrenci', Dersler:'ders', Finans:'finans', Raporlar:'rapor' };
              const cat = cats[label];
              document.querySelectorAll('.sc-card').forEach(card => {
                card.style.display = (cat==='all' || card.dataset.cat===cat) ? 'flex' : 'none';
              });
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {[
            { icon:'🏠', label:'Genel Bakış',       sub:'EduTakip Dashboard',            overlay:'📊 Günlük Özet Paneli',         cat:'genel',  delay:'d1' },
            { icon:'👥', label:'Öğrencilerim',       sub:'EduTakip – Öğrenci Kartları',   overlay:'🎓 Tüm Öğrenci Kartları',       cat:'ogrenci',delay:'d2' },
            { icon:'📚', label:'Dersler',            sub:'EduTakip – Ders Listesi',       overlay:'📋 Ders Listesi ve Takibi',     cat:'ders',   delay:'d3' },
            { icon:'🗓️', label:'Takvim',            sub:'EduTakip – Haftalık Takvim',    overlay:'📅 Haftalık Ders Takvimi',      cat:'ders',   delay:'d4' },
            { icon:'💰', label:'Finans Yönetimi',   sub:'EduTakip – Gelir Analizi',      overlay:'📈 Aylık Gelir Grafiği',        cat:'finans', delay:'d1' },
            { icon:'📊', label:'Gelişim Raporları', sub:'EduTakip – Performans Takibi',  overlay:'⭐ Öğrenci Gelişim Raporları',  cat:'rapor',  delay:'d2' },
            { icon:'➕', label:'Yeni Öğrenci Ekle', sub:'EduTakip – 4 Adımlı Kayıt',    overlay:'👤 Hızlı Öğrenci Kaydı',       cat:'ogrenci',delay:'d3' },
            { icon:'🤖', label:'EduTakip Asistan',  sub:'AI Destekli Öğretmen Asistanı', overlay:'🧠 AI Asistanınıza Sorun',      cat:'ai',     delay:'d4' },
          ].map(({ icon, label, sub, overlay, cat, delay }) => (
            <div key={label} data-cat={cat} className={`sc-card anim-scroll ${delay}`}
              style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)', borderRadius:16, aspectRatio:'16/10', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', cursor:'pointer', transition:'transform .3s,box-shadow .3s', border:'1px solid rgba(124,58,237,.3)' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:32, background:'rgba(0,0,0,.3)', display:'flex', alignItems:'center', padding:'0 12px', gap:6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c }} />)}
              </div>
              <div style={{ fontSize:'2.5rem', marginBottom:12, marginTop:20 }}>{icon}</div>
              <div style={{ fontSize:'.9rem', fontWeight:700, color:'rgba(255,255,255,.9)' }}>{label}</div>
              <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.55)', marginTop:4 }}>{sub}</div>
              <div style={{ width:'85%', marginTop:12 }}>
                {['75%','50%','100%'].map((w,i) => <div key={i} style={{ height:8, borderRadius:4, background:'rgba(255,255,255,.15)', marginBottom:8, width:w }} />)}
              </div>
              <div className="sc-overlay" style={{ position:'absolute', inset:0, background:'rgba(124,58,237,.85)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .3s', fontSize:'.85rem', fontWeight:600, color:'#fff' }}>{overlay}</div>
            </div>
          ))}
        </div>
      </AnimSection>

      {/* ── TESTIMONIALS ── */}
      <AnimSection style={{ background:'#fff', padding:'90px 5%' }}>
        <div className="anim-scroll" style={{ textAlign:'center' }}>
          <span style={{ color:'#7c3aed', fontSize:'.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:2 }}>✦ Yorumlar</span>
          <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:800, color:'#0f172a', lineHeight:1.25, margin:'14px 0 16px' }}>Öğretmenler Ne Diyor?</h2>
          <p style={{ fontSize:'1.05rem', color:'#64748b', maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>Binlerce öğretmenin güvendiği EduTakip hakkında gerçek deneyimler.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:22, marginTop:50 }}>
          {[
            { initial:'A', bg:'linear-gradient(135deg,#7c3aed,#a78bfa)', name:'Ayşe H.', role:'İngilizce Özel Ders Öğretmeni', text:'EduTakip sayesinde artık ödemeleri unutmuyorum. Finans takibi inanılmaz kolay, her öğrencinin bakiyesini tek bakışta görüyorum.', delay:'d1' },
            { initial:'M', bg:'linear-gradient(135deg,#f97316,#fb923c)', name:'Mehmet K.', role:'Matematik Öğretmeni', text:'Gelişim raporları özelliği harika! Velilere artık profesyonel raporlar gönderebiliyorum. Öğrencilerimin aileleri çok memnun.', delay:'d2' },
            { initial:'Z', bg:'linear-gradient(135deg,#10b981,#34d399)', name:'Zeynep A.', role:'Fizik & Kimya Öğretmeni', text:'AI asistana "Bu ay kim ödeme yapmadı?" diye soruyorum ve anında yanıt alıyorum. Artık deftere not almak yok!', delay:'d3' },
          ].map(({ initial, bg, name, role, text, delay }) => (
            <div key={name} className={`anim-scroll testimonial-card ${delay}`}
              style={{ background:'#f8fafc', borderRadius:16, padding:28, border:'1px solid #e2e8f0', transition:'all .3s' }}>
              <div style={{ color:'#f59e0b', fontSize:'1rem', marginBottom:14 }}>★★★★★</div>
              <p style={{ fontSize:'.93rem', color:'#64748b', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>"{text}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', color:'#fff' }}>{initial}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'.9rem', color:'#0f172a' }}>{name}</div>
                  <div style={{ fontSize:'.78rem', color:'#64748b' }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimSection>

      {/* ── PRICING (orijinalden korundu — aynen aynı) ── */}
      <section id="pricing" style={{ background:'linear-gradient(180deg,#f9fafb,#f5f7fa)', borderTop:'1px solid rgba(229,231,235,.5)', padding: isMobile ? '4rem 1rem' : '6rem 2rem' }}>
        <div style={{ maxWidth:980, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom: isMobile ? '2.2rem' : '3.5rem' }}>
            <span style={{ display:'inline-block', background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', color:'#6d28d9', fontWeight:800, fontSize:'.75rem', textTransform:'uppercase', letterSpacing:2, borderRadius:25, padding:'.4rem 1rem', marginBottom:'1rem' }}>Fiyatlandırma</span>
            <h2 style={{ color:'#111827', fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, marginBottom:'.75rem', letterSpacing:'-.8px' }}>Şeffaf Fiyatlandırma</h2>
            <p style={{ color:'#6b7280', fontSize:'1rem' }}>İlk ay ücretsiz — kredi kartı gerekmez</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(320px,1fr))', gap: isMobile ? '1rem' : '1.5rem', alignItems:'stretch' }}>
            {/* Ücretsiz */}
            <div style={{ background:'white', borderRadius:20, padding: isMobile ? '1.2rem' : '2rem', border:'1.5px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{ marginBottom:'1.5rem' }}>
                <h3 style={{ fontWeight:800, fontSize:'1.1rem', color:'#111827', marginBottom:'.25rem' }}>{FREE_PLAN.name}</h3>
                <p style={{ fontSize:'.82rem', color:'#9ca3af' }}>{FREE_PLAN.desc}</p>
                <div style={{ marginTop:'1rem' }}>
                  <span style={{ fontSize:'2.5rem', fontWeight:900, color:'#111827' }}>{FREE_PLAN.price}</span>
                  <span style={{ fontSize:'.85rem', color:'#9ca3af', marginLeft:'.4rem' }}>/ {FREE_PLAN.period}</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'.6rem', marginBottom:'1.75rem' }}>
                {FREE_PLAN.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                    <CheckCircle size={15} color='#10b981' />
                    <span style={{ fontSize:'.85rem', color:'#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => selectRole('teacher')}
                style={{ width:'100%', padding:'.85rem', borderRadius:12, border:'none', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'white', fontWeight:800, fontSize:'.9rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,.35)' }}>
                {FREE_PLAN.cta}
              </button>
            </div>

            {/* Pro Hesaplayıcı */}
            <div style={{ background:'white', borderRadius:22, padding: isMobile ? '1rem' : '1.8rem', border:'1.5px solid #ddd6fe', boxShadow:'0 16px 48px rgba(79,70,229,.16)', position:'relative' }}>
              <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'white', fontSize: isMobile ? '.66rem' : '.72rem', fontWeight:800, padding: isMobile ? '.3rem .7rem' : '.35rem .9rem', borderRadius:20, boxShadow:'0 6px 14px rgba(249,115,22,.3)', whiteSpace:'nowrap' }}>
                İLK ÖĞRETMENLERE ÖZEL
              </div>
              <div style={{ textAlign:'center', marginBottom:'1rem', marginTop: isMobile ? '.25rem' : 0 }}>
                <h3 style={{ fontWeight:800, fontSize: isMobile ? '1rem' : '1.1rem', color:'#111827', marginBottom:'.6rem' }}>Pro Paket Hesaplayıcı</h3>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'baseline', gap:'.4rem' }}>
                  <span style={{ color:'#9ca3af', fontSize: isMobile ? '1.2rem' : '1.6rem', textDecoration:'line-through', fontWeight:600 }}>
                    {Math.round(totalWithoutVat * 1.25).toLocaleString('tr-TR')}₺
                  </span>
                  <span style={{ fontSize: isMobile ? '2.6rem' : '3rem', fontWeight:900, color:'#111827', lineHeight:1 }}>
                    {totalWithoutVat.toLocaleString('tr-TR')}₺
                  </span>
                </div>
                <span style={{ display:'inline-block', marginTop:'.55rem', padding:'.2rem .7rem', borderRadius:999, border:'1px solid #e5e7eb', fontSize:'.82rem', color:'#6b7280' }}>
                  {perStudentPrice}₺ / öğrenci / ay + KDV
                </span>
              </div>
              <div style={{ background:'#f8fafc', borderRadius:14, border:'1.5px solid #e5e7eb', padding:'.95rem 1rem', marginBottom:'.9rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.85rem' }}>
                  <span style={{ color:'#1f2937', fontWeight:700, fontSize:'.95rem' }}>Aktif öğrenci sayısı</span>
                  <span style={{ color:'#f97316', fontWeight:900, fontSize:'1.25rem' }}>{studentCount}</span>
                </div>
                <div style={{ position:'relative', height:30, display:'flex', alignItems:'center' }}>
                  <div style={{ position:'absolute', left:0, right:0, height:8, borderRadius:999, background:'#e5e7eb' }} />
                  <div style={{ position:'absolute', left:0, width:`${sliderPct}%`, height:8, borderRadius:999, background:'linear-gradient(90deg,#f59e0b,#f97316)', transition:'width .25s ease' }} />
                  <input type='range' min={1} max={60} value={studentCount} onChange={e => setStudentCount(Number(e.target.value))}
                    style={{ width:'100%', cursor:'pointer', opacity:0, position:'relative', zIndex:3 }} />
                  <div style={{ position:'absolute', left:`calc(${sliderPct}% - 12px)`, width:24, height:24, borderRadius:'50%', background:'white', border:'3px solid #f97316', transition:'left .25s ease', animation:'sliderGlow 2.2s ease-in-out infinite', pointerEvents:'none', zIndex:2 }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap:'.75rem', marginBottom:'1rem' }}>
                <div style={{ background:'#f8fafc', border:'1.5px solid #e5e7eb', borderRadius:12, padding:'.8rem', textAlign:'center' }}>
                  <div style={{ color:'#6b7280', fontSize:'.78rem', fontWeight:700, marginBottom:'.25rem' }}>Aylık Toplam Tutar</div>
                  <div style={{ color:'#111827', fontSize: isMobile ? '1.55rem' : '1.75rem', fontWeight:900 }}>{totalWithoutVat.toLocaleString('tr-TR')}₺</div>
                </div>
                <div style={{ background:'#10b981', border:'1.5px solid #10b981', borderRadius:12, padding:'.8rem', textAlign:'center' }}>
                  <div style={{ color:'rgba(255,255,255,.9)', fontSize:'.78rem', fontWeight:700, marginBottom:'.25rem' }}>Kazancınız</div>
                  <div style={{ color:'white', fontSize: isMobile ? '1.55rem' : '1.75rem', fontWeight:900 }}>~{timeSavedHours} saat</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'.5rem', marginBottom:'1.1rem' }}>
                {['30 gün ücretsiz deneme','Tüm özellikler tam sürüm','Pasif öğrenciler ücretsiz','İstediğiniz zaman iptal edin','AI ders raporu','Gelişmiş finans analizi','Veli paneli','Öncelikli destek'].map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'.45rem' }}>
                    <CheckCircle size={14} color='#10b981' />
                    <span style={{ color:'#374151', fontSize:'.82rem', fontWeight:600 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => selectRole('teacher')}
                style={{ width:'100%', padding: isMobile ? '.85rem' : '.95rem', borderRadius:999, border:'none', background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'white', fontWeight:900, fontSize: isMobile ? '.95rem' : '1.05rem', cursor:'pointer', boxShadow:'0 10px 20px rgba(249,115,22,.28)' }}>
                30 Gün Ücretsiz Başlayın
              </button>
              <p style={{ margin:'.6rem 0 0', textAlign:'center', color:'#9ca3af', fontSize:'.82rem', fontWeight:600 }}>• Kredi kartı gerekmez</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)', padding:'100px 5%', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(167,139,250,.1)', top:-200, right:-200, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(249,115,22,.08)', bottom:-150, left:-100, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'#fff', marginBottom:18 }}>Öğrencilerinizi Bugün<br />Profesyonelce Yönetin</h2>
          <p style={{ fontSize:'1.1rem', color:'rgba(255,255,255,.75)', maxWidth:520, margin:'0 auto 38px', lineHeight:1.7 }}>Kayıt olmak ücretsiz ve kredi kartı gerektirmez. Dakikalar içinde başlayın.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => selectRole('teacher')}
              style={{ background:'#fff', color:'#7c3aed', padding:'15px 36px', borderRadius:10, fontWeight:800, fontSize:'1.05rem', cursor:'pointer', border:'none', boxShadow:'0 8px 30px rgba(0,0,0,.2)', display:'inline-flex', alignItems:'center', gap:8 }}>
              🚀 Ücretsiz Hesap Aç
            </button>
            <a href="#features" style={{ background:'transparent', color:'rgba(255,255,255,.85)', padding:'15px 36px', borderRadius:10, fontWeight:600, fontSize:'1rem', textDecoration:'none', border:'2px solid rgba(255,255,255,.3)', display:'inline-flex', alignItems:'center' }}>
              Özellikleri Keşfet
            </a>
          </div>
          <div style={{ marginTop:40, display:'flex', alignItems:'center', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
            {['🔒 Güvenli & Şifreli','💳 Kredi kartı gerekmez','⚡ 2 dakikada kurulum','🇹🇷 Türkçe destek'].map(item => (
              <span key={item} style={{ color:'rgba(255,255,255,.6)', fontSize:'.82rem' }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0f172a', color:'rgba(255,255,255,.6)', padding:'50px 5% 30px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:30, marginBottom:40 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" style={{ width:32, height:32, borderRadius:8 }} alt="" />
              <span style={{ fontWeight:800, fontSize:'1.2rem', color:'#fff' }}>EduTakip</span>
            </div>
            <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.45)', maxWidth:260, lineHeight:1.6 }}>Özel ders öğretmenlerinin iş süreçlerini kolaylaştıran akıllı yönetim platformu.</p>
          </div>
          {[
            { title:'Ürün', links:[['#features','Özellikler'],['#pricing','Fiyatlar'],['#screenshots','Ekran Görüntüleri']] },
            { title:'Özellikler', links:[['#','Öğrenci Yönetimi'],['#','Ders Planlaması'],['#','Finans Takibi'],['#','AI Asistan']] },
            { title:'Destek', links:[['#','Yardım Merkezi'],['#','İletişim'],['#','Gizlilik Politikası']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ color:'#fff', fontSize:'.88rem', fontWeight:700, marginBottom:14 }}>{title}</h4>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                {links.map(([href, label]) => (
                  <li key={label}><a href={href} style={{ color:'rgba(255,255,255,.5)', textDecoration:'none', fontSize:'.85rem' }}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:'.82rem' }}>
          <span>© 2026 EduTakip. Tüm hakları saklıdır.</span>
          <span>🇹🇷 Türkiye'de geliştirildi</span>
        </div>
      </footer>
    </div>
  );
}
