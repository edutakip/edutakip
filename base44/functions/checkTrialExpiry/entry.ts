import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Tüm kullanıcıları kontrol et (service role)
    const users = await base44.asServiceRole.entities.User.list();
    const today = new Date().toISOString().slice(0, 10);
    let expiredCount = 0;

    for (const user of users) {
      if (user.plan === 'trialing' && user.trialEndDate && user.trialEndDate < today) {
        await base44.asServiceRole.entities.User.update(user.id, {
          plan: 'expired',
          aiReportsEnabled: false,
          detailedFinanceEnabled: false,
        });
        expiredCount++;
      }
    }

    return Response.json({ success: true, expiredCount, checked: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});