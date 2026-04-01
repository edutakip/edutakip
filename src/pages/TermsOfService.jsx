import React from 'react';

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <nav style={{ background: 'rgba(15,23,42,0.97)', padding: '0 5%', height: 66, display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>EduTakip</span>
        </a>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 5%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '.5rem' }}>Kullanım Koşulları</h1>
        <p style={{ color: '#9ca3af', fontSize: '.85rem', marginBottom: '2.5rem' }}>Son güncelleme: 1 Nisan 2026</p>

        {[
          {
            title: '1. Hizmet Tanımı',
            body: 'EduTakip ("Platform"), özel ders öğretmenlerine yönelik bir yönetim platformudur. Platform; öğrenci takibi, ders planlaması, finans yönetimi, gelişim raporları ve yapay zeka destekli asistan özelliklerini kapsar. Bu hizmetleri kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.'
          },
          {
            title: '2. Hesap ve Üyelik',
            body: 'Platforma kayıt olarak hesap açabilirsiniz. Hesap bilgilerinizin doğru ve güncel olmasından siz sorumlusunuz. Hesabınızın güvenliğini korumak için güçlü bir parola kullanmanız ve yetkisiz erişimleri bize bildirmeniz gerekmektedir.'
          },
          {
            title: '3. Abonelik ve Ödeme',
            body: 'Pro paket, aktif öğrenci başına aylık 50 ₺ (KDV hariç) olarak fiyatlandırılmıştır. İlk 30 gün ücretsiz deneme hakkı sunulmaktadır. Ay ortasında eklenen öğrenciler için kalan günler üzerinden orantılı (pro-rata) ücretlendirme yapılır. Ödemeler Paddle altyapısı üzerinden gerçekleştirilmekte olup abonelik her ay otomatik yenilenir.'
          },
          {
            title: '4. İptal ve İade',
            body: 'Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönemin sonuna kadar hizmet aktif kalır. İade koşulları için Geri Ödeme Politikamıza bakınız.'
          },
          {
            title: '5. Veri Gizliliği',
            body: 'Kişisel verileriniz ve öğrencilerinize ait veriler Gizlilik Politikamız kapsamında korunmaktadır. Verileriniz üçüncü şahıslarla ticari amaçla paylaşılmaz.'
          },
          {
            title: '6. Hizmetin Kullanımı',
            body: 'Platformu yalnızca yasal amaçlarla kullanabilirsiniz. Platformu kötüye kullanmak, güvenlik açıklarını istismar etmek veya başkalarına zarar verecek şekilde kullanmak kesinlikle yasaktır. EduTakip, ihlal tespit ettiğinde hesabı askıya alma veya kapatma hakkını saklı tutar.'
          },
          {
            title: '7. Sorumluluk Sınırlaması',
            body: 'EduTakip, platformun kesintisiz veya hatasız çalışacağını garanti etmez. Teknik arızalar, veri kayıpları veya üçüncü taraf hizmetlerinden kaynaklanan sorunlar için sorumluluk kabul edilmez.'
          },
          {
            title: '8. Değişiklikler',
            body: 'Bu koşullar zaman zaman güncellenebilir. Önemli değişiklikler e-posta veya uygulama içi bildirimle duyurulur. Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.'
          },
          {
            title: '9. İletişim',
            body: 'Bu koşullar hakkında sorularınız için destek@edutakip.com adresine yazabilirsiniz.'
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
        <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>Gizlilik Politikası</a>
        <a href="/refund" style={{ color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>İade Politikası</a>
      </footer>
    </div>
  );
}