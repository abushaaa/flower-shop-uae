import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { recipientName: { contains: search } },
        { recipientPhone: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = toDate;
      }
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sort) {
      case 'total_asc': orderBy = { total: 'asc' }; break;
      case 'total_desc': orderBy = { total: 'desc' }; break;
      case 'order_asc': orderBy = { orderNumber: 'asc' }; break;
      case 'newest': default: orderBy = { createdAt: 'desc' }; break;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, trackingInfo } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }
    if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus;
    }

    // If order is cancelled, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await db.orderItem.findMany({
        where: { orderId },
      });

      for (const item of orderItems) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating admin order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
