import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, method } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const validMethods = ['stripe', 'apple_pay', 'google_pay', 'tabby', 'tamara'];
    if (!method || !validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: `Valid payment method required: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment is already in progress
    const existingPayment = await db.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Create or update payment record with status "processing"
    const payment = await db.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method,
        amount: order.total,
        currency: order.currency,
        status: 'processing',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
      update: {
        method,
        status: 'processing',
        amount: order.total,
      },
    });

    // Simulate a payment intent (in production this would call Stripe/checkout.com)
    const clientSecret = `pi_${payment.id}_secret_${Date.now()}`;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    await createAuditLog({
      userId: auth.id,
      action: 'payment_intent_created',
      entityType: 'payment',
      entityId: payment.id,
      details: {
        orderId,
        method,
        amount: order.total,
        currency: order.currency,
        transactionId,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        clientSecret,
        transactionId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
