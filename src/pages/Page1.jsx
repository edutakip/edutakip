import { useState, useMemo, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { isPro, isTrialExpired } from "@/lib/subscription";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────
// 81 İL — Türkiye'nin tüm illeri (alfabetik)
// ─────────────────────────────────────────────
const ALL_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
  "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
  "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne",
  "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
  "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
  "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya",
  "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun",
  "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

const GRADES = [
  "İlkokul (1-4)", "Ortaokul (5-8)", "9. Sınıf", "10. Sınıf",
  "11. Sınıf", "12. Sınıf", "Üniversite", "Yetişkin",
];

const SUBJECTS = [
  "Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "İngilizce",
  "Almanca", "Fransızca", "Tarih", "Coğrafya", "Felsefe",
  "Fen Bilimleri", "TYT/AYT Hazırlık", "Müzik", "Diğer",
];

const FALLBACK_STUDENTS = [
  { id: "mock-1", name: "Elif Kaya", status: "active", feePerLesson: 450, grade: "11. Sınıf", subject: "Matematik", weeklyLessons: 2, lessonDuration: 60, city: "İstanbul", district: "Kadıköy", lastRaiseDate: "2024-09-01", lessonType: "Yüz Yüze", schoolType: "Devlet", parentPhone: "5321234567" },
  { id: "mock-2", name: "Ahmet Demir", status: "active", feePerLesson: 350, grade: "Ortaokul (5-8)", subject: "Fen Bilimleri", weeklyLessons: 3, lessonDuration: 60, city: "Ankara", district: "Çankaya", lastRaiseDate: "2024-06-15", lessonType: "Online", schoolType: "Devlet", parentPhone: "5339876543" },
  { id: "mock-3", name: "Zeynep Arslan", status: "active", feePerLesson: 650, grade: "12. Sınıf", subject: "İngilizce", weeklyLessons: 2, lessonDuration: 90, city: "İstanbul", district: "Beşiktaş", lastRaiseDate: "2025-01-10", lessonType: "Yüz Yüze", schoolType: "Kolej-Özel", parentPhone: "5305556677" },
  { id: "mock-4", name: "Can Yılmaz", status: "active", feePerLesson: 400, grade: "İlkokul (1-4)", subject: "Türkçe", weeklyLessons: 1, lessonDuration: 45, city: "İzmir", district: "Bornova", lastRaiseDate: "2024-03-20", lessonType: "Yüz Yüze", schoolType: "Devlet", parentPhone: null },
  { id: "mock-5", name: "Selin Çelik", status: "active", feePerLesson: 550, grade: "10. Sınıf", subject: "Fizik", weeklyLessons: 2, lessonDuration: 60, city: "Bursa", district: null, lastRaiseDate: "2024-11-05", lessonType: "Online", schoolType: "Kolej-Özel", parentPhone: "5441112233" },
  { id: "mock-6", name: "Mert Özkan", status: "active", feePerLesson: 300, grade: "Ortaokul (5-8)", subject: "Matematik", weeklyLessons: 2, lessonDuration: 60, city: "Konya", district: null, lastRaiseDate: "2023-09-01", lessonType: "Online", schoolType: "Devlet", parentPhone: "5367778899" },
];

function normalizeStudent(s) {
  return {
    ...s,
    currentHourlyPrice: Number(s.feePerLesson)    || Number(s.currentHourlyPrice) || 0,
    schoolLevel:        s.grade                   || s.schoolLevel                || "",
    weeklyFrequency:    Number(s.weeklyLessons)   || Number(s.weeklyFrequency)    || 1,
    lessonType:         s.lessonType              || "",
    schoolType:         s.schoolType             || "",
    lastRaiseDate:      s.lastRaiseDate          || "",
    city:               s.city                   || "",
    district:           s.district               || "",
  };
}

const CITY_MULTIPLIER = {
  İstanbul: 1.20, Ankara: 1.12, İzmir: 1.10, Kocaeli: 1.08, Bursa: 1.07, Antalya: 1.06,
  Eskişehir: 1.05, Muğla: 1.05, Tekirdağ: 1.04, Yalova: 1.04, Balıkesir: 1.03, Sakarya: 1.03,
  Gaziantep: 1.02, Kayseri: 1.01, Mersin: 1.01, Denizli: 1.01, Samsun: 1.00, Trabzon: 1.00,
  Manisa: 1.00, Konya: 0.99, Adana: 0.98, Hatay: 0.97, Malatya: 0.97, Kahramanmaraş: 0.96,
  Diyarbakır: 0.95, Şanlıurfa: 0.94, Elazığ: 0.94, Erzurum: 0.94, Van: 0.93, Mardin: 0.93,
  Siirt: 0.92, Batman: 0.92, Şırnak: 0.91, Hakkari: 0.91, Iğdır: 0.91, Ağrı: 0.91,
};

function calculateRecommendations(form) {
  const base = parseFloat(form.currentPrice) || 0;
  if (base === 0) return null;
  const cityMult   = CITY_MULTIPLIER[form.city] || 1.0;
  const schoolMult = form.schoolType === "Kolej-Özel" ? 1.12 : 1.0;
  const lessonMult = form.lessonType === "Yüz Yüze" ? 1.08 : 1.0;
  let monthsSinceRaise = 0;
  if (form.lastRaiseDate) {
    const diff = new Date() - new Date(form.lastRaiseDate);
    monthsSinceRaise = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  }
  const timeFactor     = Math.min(1 + monthsSinceRaise * 0.012, 1.35);
  const positionFactor = base < 350 ? 1.10 : base < 550 ? 1.05 : 1.02;
  const composite      = cityMult * schoolMult * lessonMult * timeFactor * positionFactor;
  const safe     = Math.round((base * Math.min(composite * 0.85, 1.15)) / 25) * 25;
  const balanced = Math.round((base * Math.min(composite * 0.95, 1.28)) / 25) * 25;
  const upper    = Math.round((base * Math.min(composite * 1.05, 1.42)) / 25) * 25;
  return {
    safe, balanced, upper,
    pctSafe:     Math.round(((safe     - base) / base) * 100),
    pctBalanced: Math.round(((balanced - base) / base) * 100),
    pctUpper:    Math.round(((upper    - base) / base) * 100),
    base, monthsSinceRaise,
  };
}

function generateReasoning(form, result) {
  const m = result.monthsSinceRaise;
  const timeText = m >= 12
    ? `Son zamdan bu yana ${m} ay geçmiş; enflasyon ve piyasa koşulları ciddi ölçüde değişmiştir.`
    : m >= 6
    ? `Son zamdan ${m} ay geçmiş; makul bir zam aralığına gelinmiştir.`
    : `Son zam oldukça yakın (${m} ay); öneriler temkinli tutulmuştur.`;
  const schoolText = form.schoolType === "Kolej-Özel"
    ? "özel/kolej öğrencisi olduğu için premium band seçildi"
    : "devlet okulu öğrencisi olduğu için standart band kullanıldı";
  const lessonText = form.lessonType === "Yüz Yüze"
    ? "yüz yüze ders için ulaşım ve zaman maliyeti dikkate alındı"
    : "online ders formatı verimlilik avantajı sağlamaktadır";
  const incomeNote = form.incomeLevel === "Düşük"
    ? " Ailenin ekonomik durumu göz önünde bulundurulduğundan öneriler basamaklı sunulmuştur."
    : form.incomeLevel === "Yüksek"
    ? " Ailenin gelir düzeyi üst bant önerinin değerlendirilebilir olduğunu göstermektedir."
    : "";
  return `${timeText} ${form.city} için piyasa çarpanı uygulandı, ${schoolText} ve ${lessonText}. Mevcut ücret (${result.base} ₺) branş ve seviye parametreleriyle birlikte değerlendirilerek üç kademeli öneri oluşturuldu.${incomeNote}`;
}

function generateMessage(student, result, tone) {
  const lastName = student?.name?.split(" ").slice(-1)[0] || "Veli";
  const firstName = student?.name?.split(" ")[0] || "";
  const price = result?.balanced || 0;
  const base  = result?.base || 0;
  const pct   = result?.pctBalanced || 0;
  if (tone === "resmi") {
    return `Sayın ${lastName} ailesi,\n\nÖğrencinizle olan derslerimizde bu döneme kadar ücret güncellemesi yapılmamış olup mevcut ekonomik koşullar ve piyasa değerleri dikkate alındığında saatlik ücretin ${base} ₺'den ${price} ₺'ye (yaklaşık %${pct} artış) güncellenmesini önermek isterim.\n\nBu düzenlemenin eğitim sürecimizi kesintisiz sürdürmemize katkı sağlayacağını düşünmekteyim. Herhangi bir sorunuz olursa görüşmekten memnuniyet duyarım.\n\nSaygılarımla`;
  }
  if (tone === "samimi") {
    return `Merhaba,\n\n${firstName} ile derslerimiz çok iyi gidiyor! Bir süredir ücret güncellemesi yapmamıştım, biraz geç kaldım aslında 😊\n\nPiyasa koşulları ve diğer faktörleri göz önünde bulundurarak saatlik ücreti ${base} ₺'den ${price} ₺'ye güncellemeyi düşünüyorum. Bu konuda ne düşündüğünüzü öğrenmek isterim, konuşabiliriz.\n\nİyi günler!`;
  }
  return `Merhaba! ${firstName} ile dersler çok güzel ilerliyor 👍 Bir süredir ücret güncellemesi yapmamıştım. Saatlik ücretimi ${base} ₺ → ${price} ₺ olarak güncellemek istiyorum (+%${pct}). Uygun olur mu? 🙏`;
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #f0f9ff 100%)", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: "#1e1b4b", padding: "0 0 60px 0" },
  header: { background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #1e40af 100%)", padding: "36px 24px 32px", position: "relative", overflow: "hidden" },
  headerBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#c7d2fe", fontWeight: 500, marginBottom: 14, letterSpacing: 0.5 },
  headerTitle: { fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, color: "#fff", margin: "0 0 8px 0", lineHeight: 1.2 },
  headerSub: { color: "#a5b4fc", fontSize: 14, margin: 0, maxWidth: 520, lineHeight: 1.5 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 16px" },
  section: { marginTop: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#6366f1", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.08)", padding: "20px 24px", transition: "box-shadow 0.2s" },
  searchInput: { width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, border: "1.5px solid #e0e7ff", background: "#f8f7ff", fontSize: 14, color: "#1e1b4b", outline: "none", boxSizing: "border-box" },
  studentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginTop: 14 },
  studentCard: (sel) => ({ borderRadius: 12, border: sel ? "2px solid #6366f1" : "1.5px solid #e0e7ff", background: sel ? "linear-gradient(135deg, #eef2ff, #f5f3ff)" : "#fafafe", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s", transform: sel ? "translateY(-1px)" : "none", boxShadow: sel ? "0 4px 16px rgba(99,102,241,0.15)" : "none", position: "relative" }),
  badge: (c) => ({ display: "inline-block", background: c === "purple" ? "#ede9fe" : c === "blue" ? "#dbeafe" : "#dcfce7", color: c === "purple" ? "#6d28d9" : c === "blue" ? "#1d4ed8" : "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }),
  summaryCard: { background: "linear-gradient(135deg, #4f46e5, #3730a3)", borderRadius: 16, padding: "22px 24px", color: "#fff", boxShadow: "0 8px 32px rgba(79,70,229,0.25)", marginTop: 20 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  formGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#4338ca", marginBottom: 6, letterSpacing: 0.3 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e0e7ff", background: "#f8f7ff", fontSize: 14, color: "#1e1b4b", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e0e7ff", background: "#f8f7ff", fontSize: 14, color: "#1e1b4b", outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer" },
  analyzeBtn: (loading) => ({ width: "100%", padding: "14px 24px", borderRadius: 12, border: "none", background: loading ? "linear-gradient(135deg, #a5b4fc, #818cf8)" : "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer", letterSpacing: 0.4, boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }),
  resultGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  resultCard: (type) => {
    const m = { safe: { bg: "#fff", border: "#d1fae5" }, balanced: { bg: "linear-gradient(135deg,#4f46e5,#4338ca)", border: "transparent" }, upper: { bg: "#fff", border: "#fde8d8" } };
    return { borderRadius: 16, border: `2px solid ${m[type].border}`, background: m[type].bg, padding: "22px 20px", position: "relative", boxShadow: type === "balanced" ? "0 8px 32px rgba(79,70,229,0.25)" : "0 2px 8px rgba(0,0,0,0.04)", transform: type === "balanced" ? "scale(1.02)" : "scale(1)", transition: "all 0.3s" };
  },
  msgTab: (a) => ({ padding: "8px 16px", borderRadius: 8, border: "none", background: a ? "#6366f1" : "#f0efff", color: a ? "#fff" : "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }),
  msgBox: { background: "#f8f7ff", border: "1.5px solid #e0e7ff", borderRadius: 12, padding: "16px", fontSize: 14, lineHeight: 1.7, color: "#1e1b4b", whiteSpace: "pre-wrap", minHeight: 100, marginTop: 12 },
  copyBtn: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #6366f1", background: "transparent", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  disclaimer: { marginTop: 32, padding: "14px 20px", background: "#f8f7ff", borderRadius: 10, border: "1px solid #e0e7ff", fontSize: 12, color: "#818cf8", lineHeight: 1.6 },
};

function Divider() { return <div style={{ height: 1, background: "#e0e7ff", margin: "20px 0" }} />; }
function IconStar() { return <span style={{ fontSize: 16 }}>✦</span>; }

// ─── Mobil Engel Ekranı ───────────────────────────────────────
function MobileBlock() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "linear-gradient(135deg, #f5f3ff, #eef2ff)", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: "1.25rem" }}>💻</div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e1b4b", marginBottom: "0.75rem" }}>{isEn ? 'Desktop Required' : 'Masaüstü Gerekli'}</h2>
      <p style={{ fontSize: "0.9rem", color: "#6b7280", maxWidth: 320, lineHeight: 1.6 }}>
        {isEn ? 'The Smart Fee Suggestion tool is designed for desktop and tablet screens. Please try again on a larger screen.' : 'Akıllı Zam Önerisi aracı masaüstü ve tablet ekranlar için tasarlanmıştır. Daha geniş bir ekranda tekrar deneyin.'}
      </p>
    </div>
  );
}

// ─── Ana Component ─────────────────────────────────────────────
export default function Page1() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [user, setUser]                         = useState(null);
  const [userLoading, setUserLoading]           = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isMobile, setIsMobile]                 = useState(false);

  const [students, setStudents]               = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError]     = useState(null);
  const [search, setSearch]                   = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    city: "", subject: "", level: "", lessonType: "", schoolType: "",
    currentPrice: "", lastRaiseDate: "", district: "",
    incomeLevel: "", weeklyFrequency: "", duration: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [msgTone, setMsgTone] = useState("resmi");
  const [copied, setCopied]   = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Kullanıcı ve Pro kontrolü
  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      setUserLoading(false);
    }).catch(() => setUserLoading(false));
  }, []);

  // Öğrencileri yükle
  useEffect(() => {
    let cancelled = false;
    setStudentsLoading(true);
    (async () => {
      try {
        const me  = await base44.auth.me();
        const all = await base44.entities.Student.filter({ teacherEmail: me.email, status: "active" });
        if (!cancelled) {
          const norm = all.map(normalizeStudent);
          setStudents(norm.length > 0 ? norm : FALLBACK_STUDENTS);
        }
      } catch {
        if (!cancelled) {
          setStudents(FALLBACK_STUDENTS);
          setStudentsError("Öğrenci verileri yüklenemedi — örnek veriler gösteriliyor.");
        }
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredStudents = useMemo(
    () => students.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject?.toLowerCase().includes(search.toLowerCase())
    ),
    [search, students]
  );

  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent(student);
    setResult(null);
    setForm((prev) => ({
      ...prev,
      city:            student.city            || "",
      subject:         student.subject         || "",
      level:           student.schoolLevel     || "",
      lessonType:      student.lessonType      || "",
      schoolType:      student.schoolType      || "",
      currentPrice:    String(student.currentHourlyPrice || ""),
      lastRaiseDate:   student.lastRaiseDate   || "",
      district:        student.district        || "",
      weeklyFrequency: String(student.weeklyFrequency || ""),
      duration:        String(student.duration || ""),
    }));
  }, []);

  const handleForm = (key, val) => { setForm((p) => ({ ...p, [key]: val })); setResult(null); };

  const handleAnalyze = () => {
    if (!selectedStudent) return;
    setLoading(true); setResult(null);
    setTimeout(() => {
      const res = calculateRecommendations(form);
      setResult(res); setLoading(false);
      setTimeout(() => document.getElementById("edu-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 1400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage(selectedStudent, result, msgTone))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const monthsAgo = useMemo(() => {
    if (!selectedStudent?.lastRaiseDate) return null;
    return Math.floor((new Date() - new Date(selectedStudent.lastRaiseDate)) / (1000 * 60 * 60 * 24 * 30));
  }, [selectedStudent]);

  const isFormReady = selectedStudent &&
    form.city && form.subject && form.level &&
    form.lessonType && form.schoolType && form.currentPrice;

  // ── Mobil engeli ──
  if (isMobile) return <MobileBlock />;

  // ── Yükleniyor ──
  if (userLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e0e7ff", borderTopColor: "#6366f1", borderRadius: "50%", animation: "edu-spin 0.8s linear infinite" }} />
      <style>{`@keyframes edu-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Pro kontrolü: değilse upgrade modal göster ──
  const hasAccess = user && isPro(user) && !isTrialExpired(user);

  if (!hasAccess) {
    return (
      <>
        {/* Bulanık arka plan önizlemesi */}
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #f0f9ff 100%)" }}>
          <div style={S.header}>
            <div style={S.container}>
              <div style={S.headerBadge}><span>✦</span><span>{isEn ? 'AI-Powered Analysis' : 'AI Destekli Analiz'}</span></div>
                  <h1 style={S.headerTitle}>{isEn ? 'Smart Fee Suggestion' : 'Akıllı Zam Önerisi'}</h1>
                  <p style={S.headerSub}>{isEn ? 'Get a new lesson fee suggestion for the selected student based on city, school type and market conditions.' : 'Seçtiğiniz öğrenci için şehir, okul tipi ve piyasa koşullarına göre yeni ders ücreti önerisi alın.'}</p>
                </div>
              </div>
              </div>

              {/* Pro Modal — otomatik açık */}
        <ProUpgradeModal
          reason="finance"
          onClose={() => window.history.back()}
          onUpgraded={() => { setUser(prev => ({ ...prev, plan: 'trialing' })); }}
        />
      </>
    );
  }

  // ── Ana sayfa ──
  return (
    <div style={S.page}>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={S.container}>
          <div style={S.headerBadge}><span>✦</span><span>{isEn ? 'AI-Powered Analysis' : 'AI Destekli Analiz'}</span></div>
          <h1 style={S.headerTitle}>{isEn ? 'Smart Fee Suggestion' : 'Akıllı Zam Önerisi'}</h1>
          <p style={S.headerSub}>{isEn ? 'Get a new lesson fee suggestion based on city, school type and market conditions.' : 'Seçtiğiniz öğrenci için şehir, okul tipi ve piyasa koşullarına göre yeni ders ücreti önerisi alın.'}</p>
        </div>
      </div>

      <div style={S.container}>

        {/* STUDENT SELECTION */}
        <div style={S.section}>
          <div style={S.sectionLabel}><IconStar /> {isEn ? 'Student Selection' : 'Öğrenci Seçimi'}</div>
          <div style={S.card}>
            {studentsError && (
              <div style={{ marginBottom: 12, padding: "8px 14px", background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fde68a" }}>⚠️ {studentsError}</div>
            )}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#a5b4fc", fontSize: 16, pointerEvents: "none" }}>🔍</span>
              <input style={S.searchInput} placeholder={isEn ? 'Search by name or subject...' : 'İsim veya branş ile ara...'} value={search} onChange={(e) => setSearch(e.target.value)} disabled={studentsLoading} />
            </div>
            {studentsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#a5b4fc" }}>
                <div style={{ fontSize: 28, marginBottom: 8, display: "inline-block", animation: "edu-spin 1s linear infinite" }}>⟳</div>
                <div style={{ fontSize: 13 }}>{isEn ? 'Loading students...' : 'Öğrenciler yükleniyor...'}</div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#a5b4fc", fontSize: 13 }}>{isEn ? 'No results found.' : 'Arama sonucu bulunamadı.'}</div>
            ) : (
              <div style={S.studentGrid}>
                {filteredStudents.map((s) => {
                  const isSel = selectedStudent?.id === s.id;
                  return (
                    <div key={s.id} style={S.studentCard(isSel)} onClick={() => handleSelectStudent(s)}>
                      {isSel && <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</div>}
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#1e1b4b" }}>{s.name}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: isSel ? "#4f46e5" : "#374151", marginBottom: 8 }}>
                        {s.currentHourlyPrice} <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>₺/saat</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.lessonType  && <span style={S.badge("purple")}>{s.lessonType}</span>}
                        {s.schoolLevel && <span style={S.badge("blue")}>{s.schoolLevel}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{s.subject}{s.city ? ` · ${s.city}` : ""}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SELECTED STUDENT SUMMARY */}
        {selectedStudent && (
          <div style={S.summaryCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: "#a5b4fc", marginBottom: 4, textTransform: "uppercase" }}>{isEn ? 'Selected Student' : 'Seçili Öğrenci'}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{selectedStudent.name}</div>
                <div style={{ fontSize: 13, color: "#c7d2fe" }}>{selectedStudent.subject}{selectedStudent.city ? ` · ${selectedStudent.city}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: "#a5b4fc", textTransform: "uppercase" }}>{isEn ? 'Current Fee' : 'Güncel Ücret'}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{selectedStudent.currentHourlyPrice} <span style={{ fontSize: 16, fontWeight: 500 }}>₺</span></div>
                <div style={{ fontSize: 11, color: "#c7d2fe" }}>{isEn ? 'per hour' : 'saat başı'}</div>
              </div>
            </div>
            <Divider />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: isEn ? "Lesson Type" : "Ders Türü", val: selectedStudent.lessonType  || "—" },
                { label: isEn ? "School Type" : "Okul Tipi", val: selectedStudent.schoolType  || "—" },
                { label: isEn ? "Level" : "Seviye",    val: selectedStudent.schoolLevel || "—" },
                { label: isEn ? "Last Raise" : "Son Zam",   val: monthsAgo !== null ? `${monthsAgo} ${isEn ? 'months ago' : 'ay önce'}` : "—" },
                { label: isEn ? "Weekly" : "Haftalık",  val: selectedStudent.weeklyFrequency ? `${selectedStudent.weeklyFrequency} ${isEn ? 'lessons' : 'ders'}` : "—" },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px" }}>
                  <div style={{ fontSize: 10, color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYSIS FORM */}
        <div style={{ ...S.section, opacity: selectedStudent ? 1 : 0.45, pointerEvents: selectedStudent ? "auto" : "none", transition: "opacity 0.3s" }}>
          <div style={S.sectionLabel}><IconStar /> {isEn ? 'Analysis Parameters' : 'Analiz Parametreleri'}</div>
          {!selectedStudent ? (
            <div style={{ ...S.card, textAlign: "center", padding: "48px 24px", color: "#a5b4fc" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👆</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#a5b4fc" }}>{isEn ? 'First select a student for analysis' : 'Analiz için önce bir öğrenci seçin'}</div>
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>{isEn ? 'Required Fields' : 'Zorunlu Bilgiler'}</div>
              <div style={S.grid2}>
                <div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'City *' : 'Şehir *'}</label>
                    <select style={S.select} value={form.city} onChange={(e) => handleForm("city", e.target.value)}>
                      <option value="">{isEn ? 'Select city' : 'İl seçiniz'}</option>
                      {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Subject *' : 'Branş *'}</label>
                    <select style={S.select} value={form.subject} onChange={(e) => handleForm("subject", e.target.value)}>
                      <option value="">{isEn ? 'Select' : 'Seçiniz'}</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Student Level *' : 'Öğrenci Seviyesi *'}</label>
                    <select style={S.select} value={form.level} onChange={(e) => handleForm("level", e.target.value)}>
                      <option value="">{isEn ? 'Select' : 'Seçiniz'}</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Lesson Type *' : 'Ders Tipi *'}</label>
                    <select style={S.select} value={form.lessonType} onChange={(e) => handleForm("lessonType", e.target.value)}>
                      <option value="">{isEn ? 'Select' : 'Seçiniz'}</option>
                      <option value="Online">Online</option>
                      <option value="Yüz Yüze">{isEn ? 'Face to Face' : 'Yüz Yüze'}</option>
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'School Type *' : 'Okul Tipi *'}</label>
                    <select style={S.select} value={form.schoolType} onChange={(e) => handleForm("schoolType", e.target.value)}>
                      <option value="">{isEn ? 'Select' : 'Seçiniz'}</option>
                      <option value="Devlet">{isEn ? 'Public School' : 'Devlet'}</option>
                      <option value="Kolej-Özel">{isEn ? 'Private/College' : 'Kolej-Özel'}</option>
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Current Fee (₺/hr) *' : 'Mevcut Ücret (₺/saat) *'}</label>
                    <input style={S.input} type="number" min="0" value={form.currentPrice} onChange={(e) => handleForm("currentPrice", e.target.value)} placeholder={isEn ? 'e.g. 450' : 'örn. 450'} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Last Raise Date' : 'Son Zam Tarihi'}</label>
                    <input style={S.input} type="date" value={form.lastRaiseDate} onChange={(e) => handleForm("lastRaiseDate", e.target.value)} />
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>{isEn ? 'Optional Fields' : 'Opsiyonel Bilgiler'}</div>
              <div style={S.grid2}>
                <div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'District' : 'İlçe'}</label>
                    <input style={S.input} value={form.district} onChange={(e) => handleForm("district", e.target.value)} placeholder={isEn ? 'e.g. Kadıköy' : 'örn. Kadıköy'} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? "Family Income" : "Ailenin Gelir Durumu"} <span style={{ color: "#a5b4fc", fontWeight: 400 }}>{isEn ? "(affects tone, not price)" : "(tonu etkiler, fiyatı değil)"}</span></label>
                    <select style={S.select} value={form.incomeLevel} onChange={(e) => handleForm("incomeLevel", e.target.value)}>
                      <option value="">{isEn ? "Prefer not to say" : "Belirtmek istemiyorum"}</option>
                      <option value="Düşük">{isEn ? "Low" : "Düşük"}</option>
                      <option value="Orta">{isEn ? "Medium" : "Orta"}</option>
                      <option value="Yüksek">{isEn ? "High" : "Yüksek"}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Weekly Frequency' : 'Haftalık Ders Sıklığı'}</label>
                    <input style={S.input} type="number" min="1" value={form.weeklyFrequency} onChange={(e) => handleForm("weeklyFrequency", e.target.value)} placeholder={isEn ? 'e.g. 2' : 'örn. 2'} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>{isEn ? 'Duration (months)' : 'Devam Süresi (ay)'}</label>
                    <input style={S.input} type="number" min="1" value={form.duration} onChange={(e) => handleForm("duration", e.target.value)} placeholder={isEn ? 'e.g. 12' : 'örn. 12'} />
                  </div>
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>{isEn ? 'Note / Extra Info' : 'Not / Ek Bilgi'}</label>
                <textarea style={{ ...S.input, minHeight: 70, resize: "vertical", lineHeight: 1.6 }} value={form.notes} onChange={(e) => handleForm("notes", e.target.value)} placeholder={isEn ? 'Any additional notes...' : 'Eklemek istediğiniz notlar...'} />
              </div>

              <button style={S.analyzeBtn(loading)} onClick={handleAnalyze} disabled={loading || !isFormReady}>
                {loading ? <><span style={{ display: "inline-block", animation: "edu-spin 1s linear infinite" }}>⟳</span> {isEn ? 'Analyzing...' : 'Analiz ediliyor...'}</> : <>✦ {isEn ? 'Analyze' : 'Analiz Et'}</>}
              </button>
              {!isFormReady && <div style={{ textAlign: "center", fontSize: 12, color: "#a5b4fc", marginTop: 8 }}>{isEn ? 'Analysis will be active when all required fields are filled' : 'Zorunlu alanların tamamı doldurulduğunda analiz aktif olacak'}</div>}
            </div>
          )}
        </div>

        {/* RECOMMENDATION RESULTS */}
        {result && (
          <div id="edu-results" style={S.section}>
            <div style={S.sectionLabel}><IconStar /> {isEn ? 'Recommendation Results' : 'Öneri Sonuçları'}</div>
            <div style={S.resultGrid}>
              {[
                { type: "safe",     label: isEn ? "Safe Suggestion" : "Güvenli Öneri", price: result.safe,     pct: result.pctSafe,     emoji: "🛡️", desc: isEn ? "Low risk, easy acceptance. Ideal for cautious transitions." : "Düşük risk, kolay kabul. Temkinli geçiş için ideal." },
                { type: "balanced", label: isEn ? "Balanced Suggestion" : "Dengeli Öneri", price: result.balanced, pct: result.pctBalanced, emoji: "⚖️", desc: isEn ? "Best aligned with market averages. Most recommended." : "Piyasa ortalamalarıyla en uyumlu seçenek. En çok önerilen." },
                { type: "upper",    label: isEn ? "Upper Band" : "Üst Bant",      price: result.upper,    pct: result.pctUpper,    emoji: "🚀", desc: isEn ? "Premium segment. Can be considered for college/private school students." : "Premium segment. Kolej/özel okul için değerlendirilebilir." },
              ].map(({ type, label, price, pct, emoji, desc }) => {
                const isB = type === "balanced";
                const sub = isB ? "#c7d2fe" : "#6b7280";
                return (
                  <div key={type} style={S.resultCard(type)}>
                    {isB && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#fbbf24", color: "#78350f", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>⭐ {isEn ? 'Recommended' : 'Önerilen'}</div>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: isB ? "#a5b4fc" : "#6366f1", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{emoji} {label}</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: isB ? "#fff" : type === "upper" ? "#ea580c" : "#059669", lineHeight: 1 }}>
                      {price} <span style={{ fontSize: 16, fontWeight: 500, color: sub }}>₺</span>
                    </div>
                    <div style={{ marginTop: 8, marginBottom: 12 }}>
                      <span style={{ background: isB ? "rgba(255,255,255,0.2)" : type === "upper" ? "#fde8d8" : "#d1fae5", color: isB ? "#fff" : type === "upper" ? "#9a3412" : "#065f46", borderRadius: 8, padding: "3px 10px", fontSize: 14, fontWeight: 700 }}>+%{pct}</span>
                    </div>
                    <div style={{ fontSize: 12, color: sub, lineHeight: 1.5, marginBottom: 12 }}>{desc}</div>
                    <div style={{ borderTop: `1px solid ${isB ? "rgba(255,255,255,0.15)" : "#f3f4f6"}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: sub }}>{isEn ? 'Current' : 'Mevcut'}</span>
                      <span style={{ fontWeight: 700, color: isB ? "#fff" : "#1e1b4b" }}>{result.base} ₺</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: sub }}>{isEn ? 'Increase' : 'Artış'}</span>
                      <span style={{ fontWeight: 700, color: isB ? "#86efac" : type === "upper" ? "#ea580c" : "#059669" }}>+{price - result.base} ₺</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REASONING PANEL */}
        {result && (
          <div style={S.section}>
            <div style={S.sectionLabel}><IconStar /> {isEn ? 'Analysis Rationale' : 'Analiz Gerekçesi'}</div>
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>🧠</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e1b4b", marginBottom: 8 }}>{isEn ? `Automatic evaluation for ${selectedStudent?.name}` : `${selectedStudent?.name} için otomatik değerlendirme`}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", margin: 0 }}>{generateReasoning(form, result)}</p>
                  {form.incomeLevel && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#065f46", borderLeft: "3px solid #34d399" }}>
                      💬 <strong>İletişim tonu:</strong>{" "}
                      {form.incomeLevel === "Düşük" ? "Basamaklı ve anlayışlı bir yaklaşım öneririz. Güvenli öneriyle başlayıp sonraki döneme erteleme seçeneği sunabilirsiniz."
                        : form.incomeLevel === "Yüksek" ? "Üst bant değerlendirilebilir. Doğrudan ve net bir iletişim uygundur."
                        : "Standart, profesyonel bir ton uygundur."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARENT MESSAGE GENERATOR */}
        {result && (
          <div style={S.section}>
            <div style={S.sectionLabel}><IconStar /> {isEn ? 'Message to Parent' : 'Veliye Gönderilebilecek Mesaj'}</div>
            <div style={S.card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                {[{ key: "resmi", label: isEn ? "📋 Formal" : "📋 Resmi" }, { key: "samimi", label: isEn ? "😊 Friendly" : "😊 Samimi" }, { key: "whatsapp", label: isEn ? "💬 Short WhatsApp" : "💬 Kısa WhatsApp" }].map(({ key, label }) => (
                  <button key={key} style={S.msgTab(msgTone === key)} onClick={() => setMsgTone(key)}>{label}</button>
                ))}
              </div>
              <div style={S.msgBox}>{generateMessage(selectedStudent, result, msgTone)}</div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button style={S.copyBtn} onClick={handleCopy}>{copied ? (isEn ? "✓ Copied" : "✓ Kopyalandı") : (isEn ? "📋 Copy" : "📋 Kopyala")}</button>
              </div>
            </div>
          </div>
        )}

        <div style={S.disclaimer}>
          <strong>{isEn ? 'Note' : 'Not'}:</strong> {isEn ? 'This system provides estimated suggestions based on general parameters, not real market data. The final fee decision belongs to the teacher.' : 'Bu sistem gerçek piyasa verilerine değil, genel parametrelere dayalı tahmini öneriler sunar. Nihai ücret kararı öğretmene aittir.'}
        </div>
      </div>

      <style>{`@keyframes edu-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}