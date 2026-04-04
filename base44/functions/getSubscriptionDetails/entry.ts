import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
const PADDLE_BASE = 'https://api.paddle.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const subscriptionId = user.paddleSubscriptionId;
    if (!subscriptionId) {
      return Response.json({ connected: false });
    }

    // Fetch subscription from Paddle
    const subRes = await fetch(`${PADDLE_BASE}/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${PADDLE_API_KEY}` },
    });
    if (!subRes.ok) {
      const err = await subRes.text();
      return Response.json({ error: `Paddle error: ${err}` }, { status: 500 });
    }
    const subData = await subRes.json();
    const sub = subData.data;

    // Fetch payment method via customer id
    let paymentMethod = null;
    const customerId = user.paddleCustomerId || sub?.customer_id;
    if (customerId) {
      const pmRes = await fetch(`${PADDLE_BASE}/customers/${customerId}/payment-methods`, {
        headers: { Authorization: `Bearer ${PADDLE_API_KEY}` },
      });
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        const methods = pmData.data || [];
        if (methods.length > 0) {
          const pm = methods[0];
          paymentMethod = {
            type: pm.type,
            card: pm.card ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expiry: `${pm.card.expiry_month}/${pm.card.expiry_year}`,
            } : null,
          };
        }
      }
    }

    return Response.json({
      connected: true,
      status: sub.status,
      nextBilledAt: sub.next_billed_at,
      currentBillingPeriodStart: sub.current_billing_period?.starts_at,
      currentBillingPeriodEnd: sub.current_billing_period?.ends_at,
      scheduledChange: sub.scheduled_change,
      managementUrl: sub.management_urls?.update_payment_method || null,
      cancelUrl: sub.management_urls?.cancel || null,
      paymentMethod,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});