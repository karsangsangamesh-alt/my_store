import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Disable body parsing, we need the raw body to verify the signature
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!WEBHOOK_SECRET) {
      throw new Error('Webhook secret not configured');
    }

    // Get the raw body as text
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify the webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload.payment?.entity;
    const orderId = payment?.notes?.order_id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID in webhook payload' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Update order status to 'paid' and clear cart
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_id: payment.id,
            payment_method: payment.method,
            payment_timestamp: new Date(payment.created_at * 1000).toISOString()
          })
          .eq('id', orderId);

        // Clear the user's cart
        if (payment.notes?.user_id) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', payment.notes.user_id);
        }
        break;

      case 'payment.failed':
        // Update order status to 'payment_failed'
        await supabase
          .from('orders')
          .update({
            status: 'payment_failed',
            payment_id: payment.id,
            payment_method: payment.method,
            payment_error: payment.error_description || 'Payment failed'
          })
          .eq('id', orderId);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Add this to ensure the body is not automatically parsed by Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};