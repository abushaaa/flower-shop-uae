import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const isNewArrival = searchParams.get('isNewArrival');
    const lowStock = searchParams.get('lowStock');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nameEn: { contains: search } },
        { nameAr: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured === 'true') where.isFeatured = true;
    if (isNewArrival === 'true') where.isNewArrival = true;
    if (lowStock === 'true') where.stock = { lte: 10 };

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break;
      case 'price_desc': orderBy = { price: 'desc' }; break;
      case 'name_asc': orderBy = { nameEn: 'asc' }; break;
      case 'stock_asc': orderBy = { stock: 'asc' }; break;
      case 'stock_desc': orderBy = { stock: 'desc' }; break;
      case 'newest': default: orderBy = { createdAt: 'desc' }; break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, nameEn: true, nameAr: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
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
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameEn, nameAr, slug, sku, price, salePrice, costPrice,
      descriptionEn, descriptionAr, images, categoryId, tags,
      occasion, color, stock, isFeatured, isNewArrival, isBestSeller,
      isActive, sameDayDelivery,
    } = body;

    if (!nameEn || !nameAr || !slug || !sku || !categoryId || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nameEn, nameAr, slug, sku, categoryId, price' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingSku = await db.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'SKU already exists' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const product = await db.product.create({
      data: {
        nameEn,
        nameAr,
        slug,
        sku,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        descriptionEn: descriptionEn || null,
        descriptionAr: descriptionAr || null,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        categoryId,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        occasion: occasion || null,
        color: color || null,
        stock: stock || 0,
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isBestSeller: isBestSeller || false,
        isActive: isActive !== undefined ? isActive : true,
        sameDayDelivery: sameDayDelivery || false,
      },
      include: {
        category: {
          select: { id: true, nameEn: true, nameAr: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
