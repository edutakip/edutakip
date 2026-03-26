/**
 * DemoContext - Demo modunda base44 SDK'sını taklit eden mock client.
 * Bu sayfa login gerektirmeden gerçek dashboard bileşenlerini demo verilerle gösterir.
 */
import { format, addDays, subDays } from 'date-fns';

const today = new Date();
const fmt = (d) => format(d, 'yyyy-MM-dd');

export const DEMO_USER = {
  id: 'usr_demo',
  email: 'demo@edutakip.com',
  full_name: 'Demo Öğretmen',
  role: 'teacher',
  plan: 'pro',
  studentLimit: 999,
  trialUsed: false,
  aiReportsEnabled: true,
  detailedFinanceEnabled: true,
  whatsappEnabled: true,
};

const STUDENTS = [
  { id: 's1', name: 'Zeynep Arslan',  grade: '10. Sınıf', subject: 'Matematik', feePerLesson: 400, parentName: 'Ayşe Arslan',    parentPhone: '0532 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'active', monthlyFee: 1600, weeklyLessons: 4, lessonDuration: 60 },
  { id: 's2', name: 'Mert Kaya',      grade: '11. Sınıf', subject: 'Fizik',     feePerLesson: 450, parentName: 'Ali Kaya',       parentPhone: '0541 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'active', monthlyFee: 1800, weeklyLessons: 4, lessonDuration: 60 },
  { id: 's3', name: 'Elif Demir',     grade: '9. Sınıf',  subject: 'Kimya',     feePerLesson: 380, parentName: 'Fatma Demir',    parentPhone: '0555 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'active', monthlyFee: 1520, weeklyLessons: 4, lessonDuration: 60 },
  { id: 's4', name: 'Can Yılmaz',     grade: '12. Sınıf', subject: 'Türkçe',    feePerLesson: 350, parentName: 'Hüseyin Yılmaz', parentPhone: '0544 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'active', monthlyFee: 1400, weeklyLessons: 4, lessonDuration: 60 },
  { id: 's5', name: 'Selin Çelik',    grade: '8. Sınıf',  subject: 'İngilizce', feePerLesson: 320, parentName: 'Merve Çelik',    parentPhone: '0533 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'active', monthlyFee: 1280, weeklyLessons: 4, lessonDuration: 60 },
  { id: 's6', name: 'Arda Güler',     grade: '9. Sınıf',  subject: 'Matematik', feePerLesson: 300, parentName: 'Deniz Güler',    parentPhone: '0532 xxx xxxx', teacherEmail: DEMO_USER.email, status: 'archived', monthlyFee: 1200, weeklyLessons: 4, lessonDuration: 60 },
];

const LESSONS = [
  { id: 'l1',  studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, date: fmt(today),            startTime: '10:00', endTime: '11:00', subject: 'Türev ve İntegral',    status: 'planlandı',   lessonFee: 400, duration: 60 },
  { id: 'l2',  studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, date: fmt(today),            startTime: '13:00', endTime: '14:30', subject: 'Elektromagnetizma',    status: 'tamamlandı',  lessonFee: 450, duration: 90 },
  { id: 'l3',  studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, date: fmt(addDays(today,1)), startTime: '09:00', endTime: '10:00', subject: 'Organik Kimya',        status: 'planlandı',   lessonFee: 380, duration: 60 },
  { id: 'l4',  studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, date: fmt(addDays(today,1)), startTime: '15:00', endTime: '16:00', subject: 'Divan Edebiyatı',      status: 'planlandı',   lessonFee: 350, duration: 60 },
  { id: 'l5',  studentId: 's5', studentName: 'Selin Çelik',   teacherEmail: DEMO_USER.email, date: fmt(addDays(today,2)), startTime: '11:00', endTime: '12:00', subject: 'Present Perfect',      status: 'planlandı',   lessonFee: 320, duration: 60 },
  { id: 'l6',  studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, date: fmt(subDays(today,1)), startTime: '10:00', endTime: '11:00', subject: 'Limit ve Süreklilik',  status: 'tamamlandı',  lessonFee: 400, duration: 60 },
  { id: 'l7',  studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, date: fmt(subDays(today,2)), startTime: '13:00', endTime: '14:30', subject: 'Mekanik Dalgalar',     status: 'tamamlandı',  lessonFee: 450, duration: 90 },
  { id: 'l8',  studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, date: fmt(subDays(today,3)), startTime: '09:00', endTime: '10:00', subject: 'Asit-Baz Dengesi',     status: 'tamamlandı',  lessonFee: 380, duration: 60 },
  { id: 'l9',  studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, date: fmt(subDays(today,4)), startTime: '15:00', endTime: '16:00', subject: 'Şiir Analizi',         status: 'tamamlandı',  lessonFee: 350, duration: 60 },
  { id: 'l10', studentId: 's5', studentName: 'Selin Çelik',   teacherEmail: DEMO_USER.email, date: fmt(subDays(today,5)), startTime: '11:00', endTime: '12:00', subject: 'Past Tense',           status: 'tamamlandı',  lessonFee: 320, duration: 60 },
  { id: 'l11', studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, date: fmt(subDays(today,8)), startTime: '10:00', endTime: '11:00', subject: 'Fonksiyonlar',         status: 'tamamlandı',  lessonFee: 400, duration: 60 },
  { id: 'l12', studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, date: fmt(subDays(today,9)), startTime: '13:00', endTime: '14:30', subject: 'Kuvvet ve Hareket',    status: 'tamamlandı',  lessonFee: 450, duration: 90 },
];

const PAYMENTS = [
  { id: 'p1', studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, amount: 1200, status: 'bekliyor',  date: fmt(addDays(today,5)),   method: 'havale', description: 'Mayıs ayı ödemesi' },
  { id: 'p2', studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, amount: 900,  status: 'bekliyor',  date: fmt(addDays(today,3)),   method: 'nakit',  description: 'Nisan ayı kalanı' },
  { id: 'p3', studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, amount: 700,  status: 'gecikmiş',  date: fmt(subDays(today,12)),  method: 'nakit',  description: 'Mart ayı ödemesi' },
  { id: 'p4', studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, amount: 380,  status: 'alındı',    date: fmt(subDays(today,2)),   method: 'havale', description: 'Mart ayı ders ücreti' },
  { id: 'p5', studentId: 's5', studentName: 'Selin Çelik',   teacherEmail: DEMO_USER.email, amount: 960,  status: 'alındı',    date: fmt(subDays(today,7)),   method: 'nakit',  description: 'Şubat ayı ödemesi' },
  { id: 'p6', studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, amount: 400,  status: 'alındı',    date: fmt(subDays(today,10)),  method: 'nakit',  description: 'Nisan ek ders' },
  { id: 'p7', studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, amount: 450,  status: 'alındı',    date: fmt(subDays(today,15)),  method: 'havale', description: 'Şubat son ders' },
  { id: 'p8', studentId: 's5', studentName: 'Selin Çelik',   teacherEmail: DEMO_USER.email, amount: 640,  status: 'alındı',    date: fmt(subDays(today,20)),  method: 'nakit',  description: 'Ocak ayı ödemesi' },
  { id: 'p9', studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, amount: 760,  status: 'alındı',    date: fmt(subDays(today,25)),  method: 'havale', description: 'Ocak-Şubat ödemesi' },
  { id: 'p10',studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, amount: 700,  status: 'alındı',    date: fmt(subDays(today,30)),  method: 'nakit',  description: 'Ocak ayı ödemesi' },
];

const REPORTS = [
  { id: 'r1', studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, date: fmt(subDays(today,1)), subject: 'Matematik', rating: 5, attendance: 'katıldı',   generalNote: 'Türev konusunu çok hızlı kavradı. İntegrale hazır.', improvements: 'Hız hesaplamalarında dikkat', understood: 'tam',    participation: 'aktif', motivation: 'yuksek', homework: 'İntegral testleri',               nextGoal: 'İntegral uygulamalarına geçiş', topicsCovered: 'Türev tanımı, zincir kuralı' },
  { id: 'r2', studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, date: fmt(subDays(today,2)), subject: 'Fizik',     rating: 4, attendance: 'katıldı',   generalNote: 'Dalgalar konusunda iyiydi, formülleri karıştırıyor.', improvements: 'Formül kartları çıkarması önerildi', understood: 'kismen', participation: 'orta',  motivation: 'normal', homework: 'Dalga mekaniği problemleri',      nextGoal: 'Elektromanyetik dalgalar',      topicsCovered: 'Dalga özellikleri, frekans' },
  { id: 'r3', studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, date: fmt(subDays(today,3)), subject: 'Kimya',     rating: 3, attendance: 'geç kaldı', generalNote: 'Asit-baz konusu tekrar gerektirebilir.', improvements: 'pH hesaplamalarını tekrar et', understood: 'tekrar', participation: 'pasif', motivation: 'dusuk', homework: 'Asit-baz dengesi alıştırmaları', nextGoal: 'Tuzlar ve çözeltiler',          topicsCovered: 'pH, pOH, tampon çözeltiler' },
  { id: 'r4', studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, date: fmt(subDays(today,5)), subject: 'Türkçe',    rating: 4, attendance: 'katıldı',   generalNote: 'Divan edebiyatı yorumlama yeteneği gelişiyor.', improvements: 'Daha fazla okuma faydalı olacak', understood: 'tam',    participation: 'aktif', motivation: 'yuksek', homework: '5 divan şiiri analizi',           nextGoal: 'Halk edebiyatına giriş',        topicsCovered: 'Divan şiiri nazım biçimleri' },
  { id: 'r5', studentId: 's5', studentName: 'Selin Çelik',   teacherEmail: DEMO_USER.email, date: fmt(subDays(today,6)), subject: 'İngilizce', rating: 5, attendance: 'katıldı',   generalNote: 'Present Perfect\'ı çok iyi kavradı.', improvements: 'Telaffuz üzerine daha fazla çalışma', understood: 'tam',    participation: 'aktif', motivation: 'yuksek', homework: 'Cümle kurma alıştırmaları',       nextGoal: 'Past Perfect',                  topicsCovered: 'Present Perfect, since/for' },
];

const HOMEWORK = [
  { id: 'h1', studentId: 's1', studentName: 'Zeynep Arslan', teacherEmail: DEMO_USER.email, lessonId: 'l6', title: 'İntegral Testleri',          description: 'Kitaptaki tüm testleri çöz', dueDate: fmt(addDays(today,2)), status: 'verildi' },
  { id: 'h2', studentId: 's3', studentName: 'Elif Demir',    teacherEmail: DEMO_USER.email, lessonId: 'l8', title: 'Asit-Baz Dengesi Problemleri', description: 'Çalışma kağıdındaki problemleri bitir', dueDate: fmt(subDays(today,1)), status: 'gecikmiş' },
  { id: 'h3', studentId: 's2', studentName: 'Mert Kaya',     teacherEmail: DEMO_USER.email, lessonId: 'l7', title: 'Mekanik Dalgalar Özet',        description: 'Konuyla ilgili özet çıkar', dueDate: fmt(subDays(today,5)), status: 'tamamlandı' },
  { id: 'h4', studentId: 's4', studentName: 'Can Yılmaz',    teacherEmail: DEMO_USER.email, lessonId: 'l9', title: '5 Divan Şiiri Analizi',        description: 'Her şiir için bir sayfa analiz yaz', dueDate: fmt(addDays(today,4)), status: 'verildi' },
];

// ─── Mock filter helper ───────────────────────────────────────
function mockFilter(list, query) {
  return list.filter(item =>
    Object.entries(query).every(([key, val]) => item[key] === val)
  );
}

// ─── Mock subscriptions for agent ────────────────────────────
const _agentListeners = {};
const _agentConvs = {};

function buildAgentConv(convId) {
  if (!_agentConvs[convId]) {
    _agentConvs[convId] = {
      id: convId,
      messages: [
        { role: 'assistant', content: 'Merhaba Hocam! 👋 Ben EduTakip Asistanı. Öğrenci takibi, ödemeler ve ders programınız hakkında yardımcı olabilirim.' }
      ]
    };
  }
  return _agentConvs[convId];
}

function getAIResponse(userText) {
  const t = userText.toLowerCase();
  const todayStr = fmt(today);
  if (t.includes('ödeme yapmadı') || t.includes('bekleyen ödeme')) {
    const unpaid = PAYMENTS.filter(p => p.status !== 'alındı');
    const total = unpaid.reduce((s, p) => s + p.amount, 0);
    let msg = `Bu ay **${unpaid.length} öğrencinizden** toplam **₺${total.toLocaleString('tr-TR')} bekleyen ödeme** bulunuyor:\n\n`;
    unpaid.forEach(p => { msg += `- ${p.status === 'gecikmiş' ? '🔴' : '🟡'} **${p.studentName}** — ₺${p.amount.toLocaleString('tr-TR')} (${p.status})\n`; });
    msg += '\nWhatsApp hatırlatması göndermemi ister misiniz?';
    return msg;
  }
  if (t.includes('bugün') || t.includes('derslerim')) {
    const todayL = LESSONS.filter(l => l.date === todayStr);
    if (!todayL.length) return 'Bugün planlanmış dersiniz yok.';
    let msg = `Bugün **${todayL.length} dersiniz** var:\n\n`;
    todayL.forEach(l => { msg += `- ${l.status === 'tamamlandı' ? '✅' : '📝'} **${l.startTime}** ${l.studentName} — ${l.subject}\n`; });
    msg += '\nİyi dersler Hocam! 🌟';
    return msg;
  }
  if (t.includes('aktif öğrenci') || t.includes('kaç öğrenci')) {
    return `Şu anda **${STUDENTS.filter(s => s.status === 'active').length} aktif öğrenciniz** bulunuyor: ${STUDENTS.filter(s=>s.status==='active').map(s=>s.name).join(', ')}.`;
  }
  if (t.includes('zorlanan') || t.includes('düşük')) {
    const low = REPORTS.filter(r => r.rating < 4);
    if (!low.length) return 'Harika! Son raporlara göre zorlanan öğrenciniz yok.';
    let msg = 'Dikkat etmeniz gerekenler:\n\n';
    low.forEach(r => { msg += `- **${r.studentName}** (${r.subject}, ${r.rating}/5) — ${r.improvements}\n`; });
    return msg;
  }
  if (t.includes('ödev')) {
    const pending = HOMEWORK.filter(h => h.status !== 'tamamlandı');
    if (!pending.length) return 'Tüm ödevler tamamlanmış, harika! 🎉';
    let msg = `**${pending.length} tamamlanmamış ödev** var:\n\n`;
    pending.forEach(h => { msg += `- ${h.status === 'gecikmiş' ? '⚠️' : '📚'} **${h.studentName}** — ${h.title}\n`; });
    return msg;
  }
  if (t.includes('motivasyon')) {
    return `Motivasyon için önerilerim:\n\n- **Küçük hedefler:** Sık başarı hissi yaşatın\n- **Kişisel ilgi:** Sevdiği konularla dersi bağdaştırın\n- **Takdir:** Başarıları mutlaka kutlayın\n- **Oyunlaştırma:** Dersleri interaktif yapın 🎮`;
  }
  return 'Anladım Hocam! Gerçek hesapta tüm verilerinize erişimim olacak ve daha detaylı yardım edebileceğim. 😊';
}

// ─── The mock base44 client ───────────────────────────────────
export const demoBase44 = {
  auth: {
    me: async () => ({ ...DEMO_USER }),
    isAuthenticated: async () => true,
    updateMe: async () => ({ ...DEMO_USER }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Student: {
      list:   async () => [...STUDENTS],
      filter: async (query) => mockFilter(STUDENTS, query),
      create: async (data) => ({ id: `s_${Date.now()}`, ...data }),
      update: async (id, data) => data,
      delete: async () => ({}),
      schema: async () => ({}),
    },
    Lesson: {
      list:   async () => [...LESSONS],
      filter: async (query) => mockFilter(LESSONS, query),
      create: async (data) => ({ id: `l_${Date.now()}`, ...data }),
      update: async (id, data) => data,
      delete: async () => ({}),
    },
    Payment: {
      list:   async () => [...PAYMENTS],
      filter: async (query) => mockFilter(PAYMENTS, query),
      create: async (data) => ({ id: `p_${Date.now()}`, ...data }),
      update: async (id, data) => data,
      delete: async () => ({}),
    },
    LessonReport: {
      list:   async () => [...REPORTS],
      filter: async (query) => mockFilter(REPORTS, query),
      create: async (data) => ({ id: `r_${Date.now()}`, ...data }),
      update: async (id, data) => data,
      delete: async () => ({}),
    },
    Homework: {
      list:   async () => [...HOMEWORK],
      filter: async (query) => mockFilter(HOMEWORK, query),
      create: async (data) => ({ id: `h_${Date.now()}`, ...data }),
      update: async (id, data) => data,
      delete: async () => ({}),
    },
    MessageTemplate: {
      list:   async () => [],
      filter: async () => [],
      create: async (data) => ({ id: `mt_${Date.now()}`, ...data }),
    },
    Message: {
      list:   async () => [],
      filter: async () => [],
      create: async (data) => ({ id: `msg_${Date.now()}`, ...data }),
    },
  },
  agents: {
    createConversation: async () => {
      const id = `demo_conv_${Date.now()}`;
      buildAgentConv(id);
      return { id, messages: [] };
    },
    getConversation: async (id) => buildAgentConv(id),
    subscribeToConversation: (id, cb) => {
      if (!_agentListeners[id]) _agentListeners[id] = [];
      _agentListeners[id].push(cb);
      // Send current messages immediately
      setTimeout(() => cb({ messages: buildAgentConv(id).messages }), 50);
      return () => { _agentListeners[id] = _agentListeners[id].filter(l => l !== cb); };
    },
    addMessage: async (conv, msg) => {
      const c = buildAgentConv(conv.id);
      c.messages = [...c.messages, msg];
      // Notify typing
      (_agentListeners[conv.id] || []).forEach(l => l({ messages: c.messages }));
      // Simulate AI response after delay
      setTimeout(() => {
        const aiMsg = { role: 'assistant', content: getAIResponse(msg.content) };
        c.messages = [...c.messages, aiMsg];
        (_agentListeners[conv.id] || []).forEach(l => l({ messages: c.messages }));
      }, 1000);
      return { success: true };
    },
  },
  functions: {
    invoke: async () => ({ data: {} }),
  },
  integrations: {
    Core: {
      SendEmail: async () => ({ success: true }),
    },
  },
};