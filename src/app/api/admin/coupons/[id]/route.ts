import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['code', 'type', 'value', 'minOrder', 'maxUses', 'isActive', 'expiresAt'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['value', 'minOrder'].includes(field)) {
          updateData[field] = parseFloat(body[field]);
        } else if (field === 'maxUses') {
          updateData[field] = body[field] !== null ? parseInt(body[field], 10) : null;
        } else if (field === 'expiresAt') {
          updateData[field] = body[field] !== null ? new Date(body[field]) : null;
        } else if (field === 'code') {
          updateData[field] = body[field].toUpperCase();
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedCoupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coupon = await db.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Coupon deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
