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
        category: true,
        reviews: {
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

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for duplicate SKU if changed
    if (body.sku && body.sku !== product.sku) {
      const existingSku = await db.product.findUnique({ where: { sku: body.sku } });
      if (existingSku) {
        return NextResponse.json(
          { success: false, error: 'SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate slug if changed
    if (body.slug && body.slug !== product.slug) {
      const existingSlug = await db.product.findUnique({ where: { slug: body.slug } });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'nameEn', 'nameAr', 'slug', 'sku', 'descriptionEn', 'descriptionAr',
      'price', 'salePrice', 'costPrice', 'categoryId', 'occasion', 'color',
      'stock', 'isFeatured', 'isNewArrival', 'isBestSeller', 'isActive',
      'sameDayDelivery', 'rating', 'reviewCount',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['price', 'salePrice', 'costPrice', 'stock', 'rating', 'reviewCount'].includes(field)) {
          updateData[field] = parseFloat(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.images !== undefined) {
      updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
    }
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, nameEn: true, nameAr: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
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
    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Soft delete - just deactivate
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Product deactivated successfully' },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
