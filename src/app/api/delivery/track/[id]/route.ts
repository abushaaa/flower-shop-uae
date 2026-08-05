import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, addDeliveryTrackingEntry, createNotification, createAuditLog } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if the order exists
    const order = await db.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const tracking = await db.deliveryTracking.findMany({
      where: { orderId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
        timeline: tracking,
      },
    });
  } catch (error) {
    console.error('Error fetching delivery tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery tracking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, note, courierName, courierPhone } = body;

    const validStatuses = [
      'assigned_to_courier',
      'picked_up',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Valid status required: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch the order with related records
    const order = await db.order.findUnique({
      where: { id },
      include: {
        payment: true,
        floristTask: true,
        user: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create tracking entry
    await addDeliveryTrackingEntry({
      orderId: id,
      status,
      note: note || undefined,
      performedBy: auth.id,
      performedByRole: auth.role,
      courierName: courierName || undefined,
      courierPhone: courierPhone || undefined,
    });

    // Update order status
    await db.order.update({
      where: { id },
      data: { status },
    });

    // Handle delivered status
    if (status === 'delivered') {
      // Mark payment as completed if it exists and is processing
      if (order.payment && order.payment.status === 'processing') {
        await db.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'completed',
            paidAt: new Date(),
          },
        });
      }

      // Update order payment status
      if (order.paymentStatus !== 'paid') {
        await db.order.update({
          where: { id },
          data: { paymentStatus: 'paid' },
        });
      }

      // Create audit log
      await createAuditLog({
        userId: auth.id,
        action: 'order_delivered',
        entityType: 'order',
        entityId: id,
        details: {
          orderNumber: order.orderNumber,
          status,
          courierName,
          courierPhone,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      // Notify the customer
      if (order.userId) {
        await createNotification({
          userId: order.userId,
          type: 'delivered',
          title: 'Order Delivered!',
          titleAr: 'تم تسليم الطلب!',
          message: `Your order ${order.orderNumber} has been delivered successfully. Enjoy your flowers!`,
          messageAr: `تم تسليم طلبك ${order.orderNumber} بنجاح. استمتع بزهورك!`,
          orderId: id,
        });
      }

      // Update florist task to completed
      if (order.floristTask && order.floristTask.status !== 'completed') {
        await db.floristTask.update({
          where: { id: order.floristTask.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });
      }
    }

    // Handle failed delivery
    if (status === 'failed_delivery') {
      // Notify admins
      const admins = await db.user.findMany({
        where: { role: { in: ['admin', 'super_admin'] }, isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'failed_delivery',
          title: 'Delivery Failed',
          titleAr: 'فشل التوصيل',
          message: `Delivery failed for order ${order.orderNumber}. Note: ${note || 'No details provided'}`,
          messageAr: `فشل توصيل الطلب ${order.orderNumber}. ملاحظة: ${note || 'لا توجد تفاصيل'}`,
          orderId: id,
        });
      }

      // Notify customer
      if (order.userId) {
        await createNotification({
          userId: order.userId,
          type: 'failed_delivery',
          title: 'Delivery Attempt Failed',
          titleAr: 'محاولة التوصيل فشلت',
          message: `We were unable to deliver your order ${order.orderNumber}. Our team will contact you shortly.`,
          messageAr: `لم نتمكن من تسليم طلبك ${order.orderNumber}. سيتواصل فريقنا معك قريباً.`,
          orderId: id,
        });
      }
    }

    // Return updated timeline
    const updatedTracking = await db.deliveryTracking.findMany({
      where: { orderId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderStatus: status,
        timeline: updatedTracking,
      },
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}
