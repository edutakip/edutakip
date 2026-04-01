import React from 'react';

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <nav style={{ background: 'rgba(15,23,42,0.97)', padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>EduTakip</span>
        </a>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 5%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '.5rem' }}>Geri Ödeme Politikası</h1>
        <p style={{ color: '#9ca3af', fontSize: '.85rem', marginBottom: '2.5rem' }}>Son güncelleme: 1 Nisan 2026</p>

        {[
          {
            title: '1. Ücretsiz Deneme Süresi',
            body: 'Tüm yeni kullanıcılara 30 günlük ücretsiz deneme sunulmaktadır. Bu süre içinde herhangi bir ücretlendirme yapılmaz ve iptal için iade talebi gerekmez.'
          },
          {
            title: '2. İade Hakkı',
            body: 'Ödeme tarihinden itibaren 7 gün içinde herhangi bir neden belirtmeksizin tam iade talep edebilirsiniz. 7 günlük süre geçtikten sonra yapılan iade talepleri değerlendirmeye alınmaz.'
          },
          {
            title: '3. Kısmi İade',
            body: 'Ay ortasında aboneliği iptal eden kullanıcılara kalan süre için kısmi iade yapılmaz; mevcut dönem sonuna kadar hizmete erişim aktif kalır.'
          },
          {
            title: '4. İade Süreci',
            body: 'İade talebi için destek@edutakip.com adresine e-posta gönderin. Ödeme hesabınızı ve talep nedeninizi belirtin. Geçerli talepler 5-10 iş günü içinde işleme alınır ve ödeme yöntemini bağlı hesabınıza iade edilir.'
          },
          {
            title: '5. İade Dışı Durumlar',
            body: 'Aşağıdaki durumlarda iade yapılmaz: Kullanım koşullarını ihlal nedeniyle kapatılan hesaplar, hile, sahtekârlık veya kötüye kullanım tespit edilen durumlar, ücretsiz deneme süresi içindeki işlemler.'
          },
          {
            title: '6. Teknik Sorunlar',
            body: 'Platformdan kaynaklanan teknik bir sorun nedeniyle hizmetten yararlanamadığınızı belgelerseniz, etkilenen dönem için iade veya kredi sağlanabilir.'
          },
          {
            title: '7. İletişim',
            body: 'Geri ödeme talepleriniz ve sorularınız için destek@edutakip.com adresine ulaşabilirsiniz. Çalışma saatlerimiz: Pazartesi–Cuma, 09:00–18:00 (Türkiye saati).'
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '.6rem' }}>{title}</h2>
            <p style={{ fontSize: '.92rem', color: '#374151', lineHeight: 1.75 }}>{body}</p>
          </div>
        ))}
      </div>

      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,.5)', padding: '24px 5%', textAlign: 'center', fontSize: '.82rem' }}>
        <span>© 2026 EduTakip. </span>
        <a href="/terms" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>Kullanım Koşulları</a>
        <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>Gizlilik Politikası</a>
      </footer>
    </div>
  );
}