import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(auth.role, 'reports.view')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const daysAgo = parseInt(period, 10);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysAgo);

    // Total orders count
    const totalOrders = await db.order.count();

    // Period orders count
    const periodOrders = await db.order.count({
      where: { createdAt: { gte: dateFrom } },
    });

    // Total revenue
    const revenueResult = await db.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { total: true },
    });

    // Period revenue
    const periodRevenueResult = await db.order.aggregate({
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: dateFrom },
      },
      _sum: { total: true },
    });

    // Average order value
    const avgOrderResult = await db.order.aggregate({
      where: { paymentStatus: 'paid' },
      _avg: { total: true },
    });

    // Total customers
    const totalCustomers = await db.user.count({
      where: { role: 'customer' },
    });

    // New customers in period
    const newCustomers = await db.user.count({
      where: {
        role: 'customer',
        createdAt: { gte: dateFrom },
      },
    });

    // Total products
    const totalProducts = await db.product.count();
    const activeProducts = await db.product.count({ where: { isActive: true } });

    // Low stock products (<= 10)
    const lowStockProducts = await db.product.findMany({
      where: { stock: { lte: 10 }, isActive: true },
      select: {
        id: true,
        nameEn: true,
        sku: true,
        stock: true,
        price: true,
      },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    // Top selling products
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            nameEn: true,
            sku: true,
            price: true,
            images: true,
          },
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          totalRevenue: item._sum.total,
        };
      })
    );

    // Orders by status
    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: true,
    });

    // Delivered orders count
    const deliveredOrders = await db.order.count({
      where: { status: 'delivered' },
    });

    // Pending orders count
    const pendingOrders = await db.order.count({
      where: { status: 'pending' },
    });

    // Cancelled orders count
    const cancelledOrders = await db.order.count({
      where: { status: 'cancelled' },
    });

    // Orders by payment status breakdown
    const ordersByPaymentStatus = await db.order.groupBy({
      by: ['paymentStatus'],
      _count: true,
    });

    // Revenue by payment method breakdown
    const revenueByPaymentMethod = await db.payment.groupBy({
      by: ['method'],
      where: { status: 'completed' },
      _sum: { amount: true },
      _count: true,
    });

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    // Revenue by day (last 7 days)
    const last7DaysRevenue: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = await db.order.aggregate({
        where: {
          paymentStatus: 'paid',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
        _sum: { total: true },
        _count: true,
      });

      last7DaysRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue._sum.total || 0,
        orders: dayRevenue._count,
      });
    }

    // Newsletter subscribers
    const newsletterCount = await db.newsletter.count({
      where: { isActive: true },
    });

    // Top categories by sales
    const categorySales = await db.orderItem.findMany({
      take: 100,
      include: {
        order: {
          select: { paymentStatus: true },
        },
      },
    });

    // Aggregate by category through products
    const productIds = [...new Set(categorySales.filter(i => i.order.paymentStatus === 'paid').map(i => i.productId))];
    const productsWithCategory = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categoryId: true, nameEn: true },
    });

    const categoryRevenueMap: Record<string, { name: string; revenue: number }> = {};
    for (const item of categorySales) {
      if (item.order.paymentStatus !== 'paid') continue;
      const prodInfo = productsWithCategory.find(p => p.id === item.productId);
      if (!prodInfo) continue;

      if (!categoryRevenueMap[prodInfo.categoryId]) {
        const cat = await db.category.findUnique({ where: { id: prodInfo.categoryId } });
        categoryRevenueMap[prodInfo.categoryId] = {
          name: cat?.nameEn || 'Unknown',
          revenue: 0,
        };
      }
      categoryRevenueMap[prodInfo.categoryId].revenue += item.total;
    }

    const topCategories = Object.entries(categoryRevenueMap)
      .map(([id, data]) => ({ categoryId: id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          periodOrders,
          totalRevenue: revenueResult._sum.total || 0,
          periodRevenue: periodRevenueResult._sum.total || 0,
          avgOrderValue: avgOrderResult._avg.total || 0,
          totalCustomers,
          newCustomers,
          totalProducts,
          activeProducts,
          newsletterSubscribers: newsletterCount,
          deliveredOrders,
          pendingOrders,
          cancelledOrders,
        },
        ordersByStatus: ordersByStatus.map((s) => ({
          status: s.status,
          count: s._count,
        })),
        ordersByPaymentStatus: ordersByPaymentStatus.map((s) => ({
          paymentStatus: s.paymentStatus,
          count: s._count,
        })),
        revenueByPaymentMethod: revenueByPaymentMethod.map((s) => ({
          method: s.method,
          revenue: s._sum.amount || 0,
          count: s._count,
        })),
        lowStockProducts,
        topProducts: topProductDetails,
        recentOrders,
        revenueChart: last7DaysRevenue,
        topCategories,
      },
    });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
