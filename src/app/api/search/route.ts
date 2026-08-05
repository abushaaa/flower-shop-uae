import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const query = q.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: {
          isActive: true,
          OR: [
            { nameEn: { contains: query } },
            { nameAr: { contains: query } },
            { descriptionEn: { contains: query } },
            { descriptionAr: { contains: query } },
            { tags: { contains: query } },
            { sku: { contains: query } },
            {
              category: {
                OR: [
                  { nameEn: { contains: query } },
                  { nameAr: { contains: query } },
                ],
              },
            },
          ],
        },
        include: {
          category: {
            select: { id: true, nameEn: true, nameAr: true, slug: true },
          },
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({
        where: {
          isActive: true,
          OR: [
            { nameEn: { contains: query } },
            { nameAr: { contains: query } },
            { descriptionEn: { contains: query } },
            { descriptionAr: { contains: query } },
            { tags: { contains: query } },
            { sku: { contains: query } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        query,
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
