import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
const PRICE_ID = 'pri_01kn585navhk2x41damh8mawjn';

// Detect sandbox vs live based on API key prefix
// Sandbox keys start with "test_", live keys start with "live_"
const isSandbox = PADDLE_API_KEY?.startsWith('test_');
const PADDLE_BASE_URL = isSandbox
  ? 'https://sandbox-api.paddle.com'
  : 'https://api.paddle.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const studentCount = Math.max(1, Math.min(60, parseInt(body.studentCount) || 10));

    console.log(`[paddleCheckout] user=${user.email}, studentCount=${studentCount}`);
    console.log(`[paddleCheckout] environment=${isSandbox ? 'SANDBOX' : 'LIVE'}, baseUrl=${PADDLE_BASE_URL}`);
    console.log(`[paddleCheckout] priceId=${PRICE_ID}`);

    const requestBody = {
      items: [
        {
          price_id: PRICE_ID,
          quantity: studentCount,
        },
      ],
      customer: {
        email: user.email,
      },
      custom_data: {
        user_id: user.id,
        user_email: user.email,
        student_count: String(studentCount),
      },
      checkout: {
        return_url: 'https://edutakip.com/checkout?transaction_id={transaction_id}',
      },
    };

    console.log('[paddleCheckout] Request body:', JSON.stringify(requestBody));

    const transactionResponse = await fetch(`${PADDLE_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await transactionResponse.text();
    console.log(`[paddleCheckout] Paddle response status: ${transactionResponse.status}`);
    console.log(`[paddleCheckout] Paddle response body: ${responseText}`);

    if (!transactionResponse.ok) {
      let parsedError;
      try {
        parsedError = JSON.parse(responseText);
      } catch {
        parsedError = { raw: responseText };
      }
      console.error('[paddleCheckout] Paddle API error:', JSON.stringify(parsedError, null, 2));
      return Response.json(
        {
          error: 'Paddle API error',
          details: parsedError,
          status: transactionResponse.status,
        },
        { status: 500 }
      );
    }

    const transactionData = JSON.parse(responseText);
    const checkoutUrl = transactionData.data?.checkout?.url;
    console.log('[paddleCheckout] Success! checkout_url:', checkoutUrl);

    return Response.json({
      transaction_id: transactionData.data?.id,
      checkout_url: checkoutUrl,
    });
  } catch (error) {
    console.error('[paddleCheckout] Unexpected error:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});