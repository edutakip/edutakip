import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET') || 'ntfset_01kn57v2v7961mm11w040xmw7z';

// Paddle webhook imza doğrulaması
async function verifyPaddleSignature(body, signature) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(body)
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Kullanıcı bulma fonksiyonu
async function findUserByEmail(base44, email) {
  try {
    const users = await base44.asServiceRole.entities.User.filter({
      email: email,
    });
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('User lookup error:', error);
    return null;
  }
}

// Subscription event'lerini işle
async function handleSubscriptionEvent(base44, event) {
  const { type, data } = event;
  const subscription = data.subscription || data;
  const customData = subscription.custom_data || {};
  const userEmail = customData.user_email || subscription.customer_email;

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
    const studentCount = customData.student_count || 10;
    updateData.plan = 'pro';
    updateData.studentLimit = studentCount;
    updateData.subscriptionStatus = 'active';
    updateData.trialUsed = true;
    updateData.aiReportsEnabled = true;
    updateData.detailedFinanceEnabled = true;
    updateData.whatsappEnabled = true;
    console.log(`Subscription created for ${userEmail}: ${studentCount} students`);
  } else if (type === 'subscription.updated') {
    // Subscription durumunu kontrol et
    if (subscription.status === 'active') {
      updateData.plan = 'pro';
      updateData.subscriptionStatus = 'active';
    } else if (subscription.status === 'trialing') {
      updateData.plan = 'trialing';
      updateData.subscriptionStatus = 'trialing';
    } else if (subscription.status === 'paused' || subscription.status === 'past_due') {
      updateData.plan = 'expired';
      updateData.subscriptionStatus = subscription.status;
    } else {
      updateData.plan = 'expired';
      updateData.subscriptionStatus = subscription.status;
    }
    console.log(`Subscription updated for ${userEmail}: ${subscription.status}`);
  } else if (type === 'subscription.canceled') {
    updateData.plan = 'free';
    updateData.subscriptionStatus = 'canceled';
    updateData.aiReportsEnabled = false;
    updateData.detailedFinanceEnabled = false;
    updateData.whatsappEnabled = false;
    console.log(`Subscription canceled for ${userEmail}`);
  }

  // User'ı güncelle
  try {
    await base44.asServiceRole.entities.User.update(user.id, updateData);
    console.log(`User updated: ${user.id}`, updateData);
  } catch (error) {
    console.error(`Failed to update user ${user.id}:`, error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('X-Paddle-Signature');
    if (!signature) {
      console.warn('Missing X-Paddle-Signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();

    // İmza doğrulaması
    const isValid = await verifyPaddleSignature(body, signature);
    if (!isValid) {
      console.warn('Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.type;

    // Desteklenen event'leri kontrol et
    if (!['subscription.created', 'subscription.updated', 'subscription.canceled'].includes(eventType)) {
      console.log(`Ignored event type: ${eventType}`);
      return Response.json({ success: true, message: 'Event received but not processed' });
    }

    const base44 = createClientFromRequest(req);

    // Event'i işle
    await handleSubscriptionEvent(base44, event);

    return Response.json({ success: true, message: 'Event processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
});