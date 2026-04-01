import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
const PRICE_ID = 'pri_01kn585navhk2x41damh8mawjn';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const studentCount = body.studentCount || 10;

    if (!studentCount || studentCount < 1 || studentCount > 60) {
      return Response.json(
        { error: 'Student count must be between 1 and 60' },
        { status: 400 }
      );
    }

    // Create Paddle transaction
    const transactionResponse = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            price_id: PRICE_ID,
            quantity: studentCount,
          },
        ],
        customer_email: user.email,
        custom_data: {
          user_id: user.id,
          user_email: user.email,
          student_count: studentCount,
        },
        checkout: {
          return_url: 'https://edutakip.com/checkout?transaction_id={transaction_id}',
        },
      }),
    });

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.text();
      console.error('Paddle transaction error:', errorData);
      return Response.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    const transactionData = await transactionResponse.json();

    return Response.json({
      transaction_id: transactionData.data?.id,
      checkout_url: transactionData.data?.checkout?.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});