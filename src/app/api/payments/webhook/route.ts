import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, payload } = body;

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider is required' },
        { status: 400 }
      );
    }

    const validProviders = ['stripe', 'checkout', 'tabby', 'tamara', 'paytabs', 'apple_pay', 'google_pay'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Log the webhook for debugging
    console.log(`[Webhook] Received from ${provider}:`, JSON.stringify(payload, null, 2));

    // Create audit log for the webhook
    await createAuditLog({
      action: `webhook_${provider}`,
      entityType: 'payment',
      entityId: payload?.id || payload?.paymentId || undefined,
      details: {
        provider,
        eventType: payload?.type || payload?.event_type || 'unknown',
        payload: {
          id: payload?.id,
          amount: payload?.amount,
          currency: payload?.currency,
          status: payload?.status,
        },
      },
    });

    // In production, you would:
    // 1. Verify the webhook signature
    // 2. Parse the event data
    // 3. Route to the appropriate handler
    // 4. Update payment and order status accordingly

    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      data: {
        provider,
        received: true,
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
