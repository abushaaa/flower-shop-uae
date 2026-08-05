import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const where: Record<string, unknown> = { isActive: true };

    if (parentId !== null) {
      where.parentId = parentId === 'null' || parentId === '' ? null : parentId;
    } else {
      // By default, only return top-level categories
      where.parentId = null;
    }

    const categories = await db.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
