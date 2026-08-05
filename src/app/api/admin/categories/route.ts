import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { products: true, children: true },
        },
        parent: {
          select: { id: true, nameEn: true, nameAr: true },
        },
        children: {
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
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameEn, nameAr, slug, description, image, parentId, isActive, sortOrder } = body;

    if (!nameEn || !nameAr || !slug) {
      return NextResponse.json(
        { success: false, error: 'nameEn, nameAr, and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db.category.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        nameEn,
        nameAr,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
