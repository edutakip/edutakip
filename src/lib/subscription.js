// Abonelik yardımcı fonksiyonları

export function isPro(user) {
  if (!user) return false;
  return user.plan === 'pro' || user.plan === 'trialing';
}

export function isTrialExpired(user) {
  if (!user || user.plan !== 'trialing') return false;
  if (!user.trialEndDate) return false;
  return new Date(user.trialEndDate) < new Date();
}

export function canAddStudent(user, currentActiveCount) {
  if (isPro(user) && !isTrialExpired(user)) return true;
  const limit = user?.studentLimit || 3;
  return currentActiveCount < limit;
}

export function canUseAI(user) {
  if (isTrialExpired(user)) return false;
  return isPro(user) || user?.aiReportsEnabled === true;
}

export function canUseDetailedFinance(user) {
  if (isTrialExpired(user)) return false;
  return isPro(user) || user?.detailedFinanceEnabled === true;
}

export function canUseWhatsApp(user) {
  if (isTrialExpired(user)) return false;
  if (user?.plan === 'free') return true; // free'de temel WhatsApp var
  return true;
}

export function getPlanLabel(plan) {
  const labels = {
    free: 'Ücretsiz',
    trialing: 'Pro (Deneme)',
    pro: 'Pro',
    expired: 'Süresi Doldu',
  };
  return labels[plan] || 'Ücretsiz';
}

export function getDaysLeft(user) {
  if (!user?.trialEndDate) return null;
  const diff = Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}