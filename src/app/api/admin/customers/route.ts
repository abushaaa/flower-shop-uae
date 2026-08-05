import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { role: 'customer' };

    if (role) where.role = role;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    // Get total spent per customer
    const customerStats = await Promise.all(
      customers.map(async (customer) => {
        const result = await db.order.aggregate({
          where: {
            userId: customer.id,
            paymentStatus: 'paid',
          },
          _sum: { total: true },
          _count: true,
        });

        return {
          ...customer,
          totalSpent: result._sum.total || 0,
          paidOrderCount: result._count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        customers: customerStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
