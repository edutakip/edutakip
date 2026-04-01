import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <nav style={{ background: 'rgba(15,23,42,0.97)', padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>EduTakip</span>
        </a>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 5%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '.5rem' }}>Gizlilik Politikası</h1>
        <p style={{ color: '#9ca3af', fontSize: '.85rem', marginBottom: '2.5rem' }}>Son güncelleme: 1 Nisan 2026</p>

        {[
          {
            title: '1. Toplanan Veriler',
            body: 'EduTakip olarak platformumuzu kullandığınızda şu verileri topluyoruz: ad-soyad, e-posta adresi, eklediğiniz öğrenci bilgileri (isim, iletişim), ders ve ödeme kayıtları, uygulama içi kullanım verileri (log kayıtları, özellik kullanımı).'
          },
          {
            title: '2. Verilerin Kullanım Amacı',
            body: 'Topladığımız veriler yalnızca şu amaçlarla kullanılır: hizmetin sağlanması ve işletilmesi, hesap yönetimi, ödeme işlemlerinin gerçekleştirilmesi, destek taleplerinin karşılanması ve platformun geliştirilmesi. Verileriniz ticari amaçla üçüncü taraflarla paylaşılmaz.'
          },
          {
            title: '3. Veri Paylaşımı',
            body: 'Verileriniz yalnızca hizmetin sunulması için zorunlu olan altyapı sağlayıcılarıyla (barındırma, ödeme işlemcisi Paddle) paylaşılır. Bu sağlayıcılar verilerinizi kendi politikaları kapsamında korur. Yasal zorunluluk dışında verileriniz hiçbir üçüncü tarafla paylaşılmaz.'
          },
          {
            title: '4. Veri Güvenliği',
            body: 'Verileriniz şifreli (HTTPS/TLS) bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır. Yetkisiz erişimi önlemek için endüstri standartlarında güvenlik önlemleri uygulanmaktadır.'
          },
          {
            title: '5. Veri Saklama Süresi',
            body: 'Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı kapatmanız durumunda verileriniz 30 gün içinde sistemden silinir. Yasal zorunluluk gerektiren veriler ilgili mevzuat süresince saklanmaya devam edebilir.'
          },
          {
            title: '6. Çerezler',
            body: 'Platform, oturum yönetimi ve kullanım analizleri için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu bazı platform özelliklerini etkileyebilir.'
          },
          {
            title: '7. Haklarınız (KVKK)',
            body: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinize erişme, düzeltme, silme, aktarımını talep etme ve işlenmesine itiraz etme haklarına sahipsiniz. Bu haklarınızı kullanmak için destek@edutakip.com adresine yazabilirsiniz.'
          },
          {
            title: '8. İletişim',
            body: 'Gizlilik politikamız hakkında sorularınız için destek@edutakip.com adresine ulaşabilirsiniz.'
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
        <a href="/refund" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>İade Politikası</a>
      </footer>
    </div>
  );
}