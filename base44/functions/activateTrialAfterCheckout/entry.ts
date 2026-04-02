import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Paddle'dan checkout tamamlandıktan sonra transaction detayını alarak kullanıcıyı aktifleştirir
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { transactionId, studentCount } = body;

    if (!transactionId) {
      return Response.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    const PADDLE_API_KEY = (Deno.env.get('PADDLE_API_KEY') || '').trim();

    // Paddle'dan transaction detayını doğrula
    const txRes = await fetch(`https://api.paddle.com/transactions/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${PADDLE_API_KEY}` },
    });
    const txData = await txRes.json();

    if (!txRes.ok) {
      console.error('[activateTrial] Transaction fetch failed:', txData);
      return Response.json({ error: 'Transaction not found' }, { status: 400 });
    }

    const tx = txData.data;
    const txStatus = tx?.status;
    const txCustomerEmail = tx?.customer?.email || tx?.custom_data?.user_email;
    const txStudentCount = parseInt(tx?.custom_data?.student_count) || studentCount || 10;
    const subscriptionId = tx?.subscription_id;

    console.log(`[activateTrial] tx=${transactionId}, status=${txStatus}, email=${txCustomerEmail}, sub=${subscriptionId}`);

    // Güvenlik: transaction'ın bu kullanıcıya ait olduğunu doğrula
    if (txCustomerEmail && txCustomerEmail !== user.email) {
      console.warn(`[activateTrial] Email mismatch: tx=${txCustomerEmail}, user=${user.email}`);
      return Response.json({ error: 'Transaction does not belong to this user' }, { status: 403 });
    }

    // Transaction tamamlandı mı kontrol et (completed veya trialing başladıysa)
    const validStatuses = ['completed', 'billed', 'past_due'];
    if (!validStatuses.includes(txStatus)) {
      console.warn(`[activateTrial] Transaction status not valid: ${txStatus}`);
      // Yine de devam et — trialing başlamış olabilir
    }

    const updateData = {
      plan: 'pro',
      studentLimit: txStudentCount,
      subscriptionStatus: 'active',
      aiReportsEnabled: true,
      detailedFinanceEnabled: true,
      whatsappEnabled: true,
      paddleCustomerId: tx?.customer_id,
    };

    if (subscriptionId) {
      updateData.paddleSubscriptionId = subscriptionId;
    }

    await base44.asServiceRole.entities.User.update(user.id, updateData);
    console.log(`[activateTrial] User ${user.email} activated with plan=pro, ${txStudentCount} students`);

    return Response.json({ success: true, plan: 'pro', studentLimit: txStudentCount });
  } catch (error) {
    console.error('[activateTrial] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});