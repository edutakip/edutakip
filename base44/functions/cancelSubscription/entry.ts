import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paddleSubId = user.paddleSubscriptionId;
    if (!paddleSubId) {
      return Response.json({ error: 'Aktif bir Paddle aboneliği bulunamadı.' }, { status: 400 });
    }

    const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
    const res = await fetch(`https://api.paddle.com/subscriptions/${paddleSubId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ effective_from: 'next_billing_period' }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data?.error?.detail || 'İptal işlemi başarısız.' }, { status: 400 });
    }

    // Kullanıcıya iptal bilgisini kaydet
    await base44.asServiceRole.entities.User.update(user.id, {
      subscriptionCancelledAt: new Date().toISOString(),
    });

    return Response.json({ success: true, message: 'Abonelik mevcut dönem sonunda iptal edilecek.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});