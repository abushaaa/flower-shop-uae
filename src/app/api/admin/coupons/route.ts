import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching admin coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, minOrder, maxUses, isActive, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'code, type, and value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be percentage or fixed' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCode = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
