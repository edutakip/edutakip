import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ParentLessonsPayments from './pages/ParentLessonsPayments';
import TeacherReports from './pages/TeacherReports';
import ParentLessonRequests from './pages/ParentLessonRequests';
import ParentSettings from './pages/ParentSettings';
import AdminPanel from './pages/AdminPanel';
import TeacherAssistant from './pages/TeacherAssistant';
import Page1 from './pages/Page1';
import AdvertiseDemo from './pages/AdvertiseDemo';
import PricingPage from './pages/PricingPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import Checkout from './pages/Checkout';
import SubscriptionManagement from './pages/SubscriptionManagement';
import TeacherAccount from './pages/TeacherAccount';
import CertificateGenerator from './pages/CertificateGenerator';
import AIHomeworkGenerator from './pages/AIHomeworkGenerator';
import HomeworkAnalytics from './pages/HomeworkAnalytics';
import HomeworkSolver from './pages/HomeworkSolver';
import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ToastNotification from './components/ToastNotification';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// ── Güncelleme tespiti ────────────────────────────────────────
// index.html'deki script hash'ini okur, değişince banner gösterir
function useUpdateDetection() {
  const [updateReady, setUpdateReady] = useState(false);
  const currentHash = useRef(null);

  const getScriptHash = async () => {
    try {
      const res = await fetch('/?_=' + Date.now(), { cache: 'no-store' });
      const html = await res.text();
      // Vite'ın ürettiği /assets/index-HASH.js veya /assets/main-HASH.js satırını bul
      const match = html.match(/\/assets\/[^"']+\.js/);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // İlk hash'i kaydet
    getScriptHash().then(hash => { currentHash.current = hash; });

    // Her 2 dakikada kontrol et
    const interval = setInterval(async () => {
      const hash = await getScriptHash();
      if (hash && currentHash.current && hash !== currentHash.current) {
        setUpdateReady(true);
        clearInterval(interval);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return updateReady;
}

// ── Update Banner ─────────────────────────────────────────────
function UpdateBanner() {
  const updateReady = useUpdateDetection();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (updateReady) {
      // Küçük gecikmeyle slide-in animasyonu tetikle
      setTimeout(() => setVisible(true), 50);
    }
  }, [updateReady]);

  if (!updateReady) return null;

  return (
    <>
      <style>{`
        @keyframes banner-in {
          from { transform: translateY(-110%); }
          to   { transform: translateY(0); }
        }
        .update-banner-inner {
          transform: translateY(-110%);
          transition: none;
        }
        .update-banner-inner.visible {
          animation: banner-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .update-btn:hover {
          background: white !important;
          color: #1d4ed8 !important;
          transform: scale(1.03);
        }
        .update-btn {
          transition: all 0.15s ease;
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 99999, overflow: 'hidden',
      }}>
        <div className={`update-banner-inner${visible ? ' visible' : ''}`} style={{
          background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', padding: '0.6rem 1rem',
          boxShadow: '0 4px 20px rgba(29,78,216,0.35)',
        }}>
          <RefreshCw
            size={15}
            color="white"
            style={{ flexShrink: 0, animation: loading ? 'spin 0.8s linear infinite' : 'none' }}
          />
          <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
            Yeni güncelleme mevcut
          </span>
          <button
            className="update-btn"
            onClick={() => { setLoading(true); window.location.reload(); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: 'white',
              borderRadius: '8px',
              padding: '0.3rem 0.9rem',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            {loading ? 'Yükleniyor...' : 'Güncelle'}
          </button>
        </div>
      </div>
    </>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/TeacherReports" element={<LayoutWrapper currentPageName="TeacherReports"><TeacherReports /></LayoutWrapper>} />
      <Route path="/ParentLessonsPayments" element={<LayoutWrapper currentPageName="ParentLessonsPayments"><ParentLessonsPayments /></LayoutWrapper>} />
      <Route path="/ParentLessonRequests" element={<LayoutWrapper currentPageName="ParentLessonRequests"><ParentLessonRequests /></LayoutWrapper>} />
      <Route path="/ParentSettings" element={<LayoutWrapper currentPageName="ParentSettings"><ParentSettings /></LayoutWrapper>} />
      <Route path="/adminreis" element={<AdminPanel />} />
      <Route path="/TeacherAssistant" element={<LayoutWrapper currentPageName="TeacherAssistant"><TeacherAssistant /></LayoutWrapper>} />
      <Route path="/Page1" element={<LayoutWrapper currentPageName="Page1"><Page1 /></LayoutWrapper>} />
      <Route path="/SubscriptionManagement" element={<LayoutWrapper currentPageName="SubscriptionManagement"><SubscriptionManagement /></LayoutWrapper>} />
      <Route path="/TeacherAccount" element={<LayoutWrapper currentPageName="TeacherAccount"><TeacherAccount /></LayoutWrapper>} />
      <Route path="/CertificateGenerator" element={<LayoutWrapper currentPageName="CertificateGenerator"><CertificateGenerator /></LayoutWrapper>} />
      <Route path="/AIHomeworkGenerator" element={<LayoutWrapper currentPageName="AIHomeworkGenerator"><AIHomeworkGenerator /></LayoutWrapper>} />
      <Route path="/HomeworkAnalytics" element={<LayoutWrapper currentPageName="HomeworkAnalytics"><HomeworkAnalytics /></LayoutWrapper>} />
      <Route path="/HomeworkSolver" element={<HomeworkSolver />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <UpdateBanner />
          <Routes>
            <Route path="/advertise" element={<AdvertiseDemo />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        <ToastNotification />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App