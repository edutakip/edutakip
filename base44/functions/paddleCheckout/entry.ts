import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PADDLE_API_KEY = (Deno.env.get('PADDLE_API_KEY') || '').trim();
const PRICE_ID = 'pri_01kn585navhk2x41damh8mawjn';
const PADDLE_BASE = 'https://api.paddle.com';

async function paddleRequest(method, path, body) {
  const url = `${PADDLE_BASE}${path}`;
  const options = {
    method,
    headers: {
      'Authorization': 'Bearer ' + PADDLE_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  console.log(`[Paddle] ${method} ${url}`);
  if (body) console.log(`[Paddle] Request body:`, JSON.stringify(body));

  const res = await fetch(url, options);
  const text = await res.text();
  console.log(`[Paddle] Response status: ${res.status}`);
  console.log(`[Paddle] Response body: ${text}`);

  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const studentCount = Math.max(1, Math.min(60, parseInt(body.studentCount) || 10));

    console.log(`[paddleCheckout] user=${user.email}, studentCount=${studentCount}`);
    console.log(`[paddleCheckout] API key length=${PADDLE_API_KEY.length}, starts="${PADDLE_API_KEY.slice(0,12)}...", ends="...${PADDLE_API_KEY.slice(-6)}"`);

    // Step 1: Look up existing customer by email
    let customerId = null;
    const searchRes = await paddleRequest('GET', `/customers?search=${encodeURIComponent(user.email)}`, null);
    if (!searchRes.ok) {
      return Response.json({ error: 'Customer lookup failed', details: searchRes.data }, { status: 500 });
    }

    const existingCustomers = searchRes.data?.data || [];
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      console.log(`[paddleCheckout] Found existing customer: ${customerId}`);
    } else {
      // Step 2: Create new customer
      const createRes = await paddleRequest('POST', '/customers', {
        email: user.email,
        name: user.full_name || user.email,
      });
      if (!createRes.ok) {
        return Response.json({ error: 'Customer creation failed', details: createRes.data }, { status: 500 });
      }
      customerId = createRes.data?.data?.id;
      console.log(`[paddleCheckout] Created new customer: ${customerId}`);
    }

    if (!customerId) {
      return Response.json({ error: 'Could not resolve customer ID' }, { status: 500 });
    }

    // Step 3: Create transaction
    const txRes = await paddleRequest('POST', '/transactions', {
      items: [{ price_id: PRICE_ID, quantity: 1 }],
      customer_id: customerId,
      custom_data: {
        user_id: user.id,
        user_email: user.email,
        student_count: String(studentCount),
      },
      checkout: {
        url: true,
      },
    });

    if (!txRes.ok) {
      return Response.json({ error: 'Transaction creation failed', details: txRes.data }, { status: 500 });
    }

    const checkoutUrl = txRes.data?.data?.checkout?.url;
    console.log(`[paddleCheckout] Success! checkout_url: ${checkoutUrl}`);

    return Response.json({
      transaction_id: txRes.data?.data?.id,
      checkout_url: checkoutUrl,
    });

  } catch (error) {
    console.error('[paddleCheckout] Unexpected error:', error.message, error.stack);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});