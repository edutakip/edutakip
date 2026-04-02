import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sadece öğretmen ve henüz plan'ı olmayan kullanıcılar için çalışsın
    if (user.role !== 'teacher' || user.plan) {
      return Response.json({ message: 'User already has a plan or not a teacher' });
    }

    // 30 gün deneme sürümü başlat
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const updateData = {
      plan: 'trialing',
      studentLimit: 10,
      subscriptionStatus: 'trialing',
      trialEndDate: trialEndDate.toISOString(),
      aiReportsEnabled: true,
      detailedFinanceEnabled: true,
      whatsappEnabled: true,
      trialUsed: true,
    };

    await base44.auth.updateMe(updateData);
    console.log(`[initializeTeacherTrial] User ${user.email} activated with 30-day trial`);

    return Response.json({ success: true, plan: 'trialing' });
  } catch (error) {
    console.error('[initializeTeacherTrial] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});