import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out expired coupons
    const now = new Date();
    const activeCoupons = coupons.filter(
      (coupon) => !coupon.expiresAt || coupon.expiresAt > now
    );

    return NextResponse.json({
      success: true,
      data: activeCoupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, error: 'This coupon has reached its maximum usage limit' },
        { status: 400 }
      );
    }

    if (orderTotal && orderTotal < coupon.minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount for this coupon is AED ${coupon.minOrder}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    const effectiveTotal = orderTotal || 0;

    if (coupon.type === 'percentage') {
      discount = effectiveTotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        minOrder: coupon.minOrder,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
