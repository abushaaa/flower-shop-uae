import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, nameEn: true, nameAr: true, slug: true, image: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products (same category, excluding current)
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        price: true,
        salePrice: true,
        images: true,
        rating: true,
        reviewCount: true,
        isBestSeller: true,
        sameDayDelivery: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
