import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const WEBHOOK_SECRET = (Deno.env.get('PADDLE_WEBHOOK_SECRET') || 'ntfset_01kn57v2v7961mm11w040xmw7z').trim();

// Paddle webhook imza doğrulaması (Paddle v2 formatı: h1=HASH;ts=TIMESTAMP)
async function verifyPaddleSignature(body, signatureHeader) {
  try {
    // Paddle header formatı: "ts=TIMESTAMP;h1=HASH"
    const parts = {};
    signatureHeader.split(';').forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) parts[key.trim()] = value.trim();
    });

    const timestamp = parts['ts'];
    const hash = parts['h1'];

    if (!timestamp || !hash) {
      console.error('Missing ts or h1 in signature header:', signatureHeader);
      return false;
    }

    // Paddle imza payload'u: timestamp + ":" + body
    const signedPayload = `${timestamp}:${body}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log(`[webhook] computed: ${computedHash}`);
    console.log(`[webhook] received: ${hash}`);

    return computedHash === hash;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function findUserByEmail(base44, email) {
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email });
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('User lookup error:', error);
    return null;
  }
}

async function handleSubscriptionEvent(base44, event) {
  const { type, data } = event;
  const subscription = data.subscription || data;
  const customData = subscription.custom_data || {};
  const userEmail = customData.user_email || subscription.customer_email;

  console.log(`[webhook] Event: ${type}, email: ${userEmail}`);

  if (!userEmail) {
    console.warn('No user email found in webhook');
    return;
  }

  const user = await findUserByEmail(base44, userEmail);
  if (!user) {
    console.warn(`User not found: ${userEmail}`);
    return;
  }

  const updateData = {
    paddleSubscriptionId: subscription.id,
    paddleCustomerId: subscription.customer_id,
  };

  if (type === 'subscription.created') {
    const studentCount = parseInt(customData.student_count) || 10;
    updateData.plan = 'pro';
    updateData.studentLimit = studentCount;
    updateData.subscriptionStatus = 'active';
    updateData.trialUsed = true;
    updateData.aiReportsEnabled = true;
    updateData.detailedFinanceEnabled = true;
    updateData.whatsappEnabled = true;
    console.log(`[webhook] Subscription created for ${userEmail}: ${studentCount} students`);
  } else if (type === 'subscription.updated') {
    if (subscription.status === 'active') {
      updateData.plan = 'pro';
      updateData.subscriptionStatus = 'active';
    } else if (subscription.status === 'trialing') {
      updateData.plan = 'trialing';
      updateData.subscriptionStatus = 'trialing';
    } else {
      updateData.plan = 'expired';
      updateData.subscriptionStatus = subscription.status;
    }
    console.log(`[webhook] Subscription updated for ${userEmail}: ${subscription.status}`);
  } else if (type === 'subscription.canceled') {
    updateData.plan = 'free';
    updateData.subscriptionStatus = 'canceled';
    updateData.aiReportsEnabled = false;
    updateData.detailedFinanceEnabled = false;
    updateData.whatsappEnabled = false;
    console.log(`[webhook] Subscription canceled for ${userEmail}`);
  }

  await base44.asServiceRole.entities.User.update(user.id, updateData);
  console.log(`[webhook] User updated: ${user.id}`, updateData);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signatureHeader = req.headers.get('Paddle-Signature') || req.headers.get('X-Paddle-Signature');
    if (!signatureHeader) {
      console.warn('Missing Paddle-Signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();
    console.log(`[webhook] Body: ${body.slice(0, 200)}`);

    const isValid = await verifyPaddleSignature(body, signatureHeader);
    if (!isValid) {
      console.warn('[webhook] Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[webhook] Event type: ${event.type}`);

    if (!['subscription.created', 'subscription.updated', 'subscription.canceled'].includes(event.type)) {
      console.log(`[webhook] Ignored event: ${event.type}`);
      return Response.json({ success: true, message: 'Event received but not processed' });
    }

    const base44 = createClientFromRequest(req);
    await handleSubscriptionEvent(base44, event);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[webhook] Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});