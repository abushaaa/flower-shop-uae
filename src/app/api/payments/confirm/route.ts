import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, createAuditLog, createNotification } from '@/lib/auth';

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
    const { paymentId, status } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    if (!status || !['completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required (completed, failed)' },
        { status: 400 }
      );
    }

    // Fetch the payment with order info
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Payment already completed' },
        { status: 400 }
      );
    }

    if (status === 'completed') {
      // Update payment
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      // Update order payment status
      await db.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'paid' },
      });

      // Create audit log
      await createAuditLog({
        userId: auth.id,
        action: 'payment_completed',
        entityType: 'payment',
        entityId: paymentId,
        details: {
          orderId: payment.orderId,
          orderNumber: payment.order?.orderNumber,
          method: payment.method,
          amount: payment.amount,
          currency: payment.currency,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      // Notify the customer
      if (payment.order?.userId) {
        await createNotification({
          userId: payment.order.userId,
          type: 'payment_received',
          title: 'Payment Received',
          titleAr: 'تم استلام الدفعة',
          message: `Payment of ${payment.currency} ${payment.amount} received for order ${payment.order.orderNumber}.`,
          messageAr: `تم استلام دفعة قدرها ${payment.amount} ${payment.currency} للطلب ${payment.order.orderNumber}.`,
          orderId: payment.orderId,
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment confirmed successfully',
      });
    } else {
      // Failed payment
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          failedAt: new Date(),
        },
      });

      // Create audit log
      await createAuditLog({
        userId: auth.id,
        action: 'payment_failed',
        entityType: 'payment',
        entityId: paymentId,
        details: {
          orderId: payment.orderId,
          orderNumber: payment.order?.orderNumber,
          method: payment.method,
          amount: payment.amount,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment failed',
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
