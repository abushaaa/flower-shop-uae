import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      recipientName,
      recipientPhone,
      deliveryCity,
      deliveryArea,
      deliveryStreet,
      deliveryBuilding,
      deliveryApartment,
      deliveryNotes,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      deliveryFee,
      giftWrap,
      greetingCard,
      couponCode,
    } = body;

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    if (!recipientName || !recipientPhone || !deliveryCity) {
      return NextResponse.json(
        { success: false, error: 'Recipient name, phone, and delivery city are required' },
        { status: 400 }
      );
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.nameEn}` },
          { status: 400 }
        );
      }

      const price = product.salePrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      const images = JSON.parse(product.images || '[]') as string[];
      orderItems.push({
        productId: product.id,
        productName: product.nameEn,
        productImage: images[0] || null,
        price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Handle coupon
    let discount = 0;
    let couponId: string | null = null;
    const giftWrapPrice = giftWrap ? 15 : 0;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) {
          return NextResponse.json(
            { success: false, error: 'Coupon has expired' },
            { status: 400 }
          );
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json(
            { success: false, error: 'Coupon has reached maximum uses' },
            { status: 400 }
          );
        }
        if (subtotal < coupon.minOrder) {
          return NextResponse.json(
            { success: false, error: `Minimum order amount for this coupon is AED ${coupon.minOrder}` },
            { status: 400 }
          );
        }

        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }

        couponId = coupon.id;
      }
    }

    const total = subtotal + (deliveryFee || 0) + giftWrapPrice - discount;

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `BG-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        status: 'pending',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        subtotal,
        deliveryFee: deliveryFee || 0,
        discount,
        total: Math.max(total, 0),
        currency: 'AED',
        recipientName,
        recipientPhone,
        deliveryCity,
        deliveryArea: deliveryArea || null,
        deliveryStreet: deliveryStreet || null,
        deliveryBuilding: deliveryBuilding || null,
        deliveryApartment: deliveryApartment || null,
        deliveryNotes: deliveryNotes || null,
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        giftWrap: giftWrap || false,
        giftWrapPrice,
        greetingCard: greetingCard || null,
        couponId,
        couponCode: couponCode?.toUpperCase() || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Increment coupon usage
    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create FloristTask for the new order
    await db.floristTask.create({
      data: {
        orderId: order.id,
        status: 'pending',
        priority: deliveryDate === new Date().toISOString().split('T')[0] ? 'urgent' : 'normal',
      },
    });

    // Create Payment record if payment method is NOT cash on delivery
    if (paymentMethod && paymentMethod !== 'cod') {
      await db.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          amount: Math.max(total, 0),
          currency: 'AED',
          status: 'pending',
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
        },
      });
    }

    // Audit log for order creation
    await createAuditLog({
      userId: userId || undefined,
      action: 'order_created',
      entityType: 'order',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: paymentMethod || 'cod',
        itemCount: items.length,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
