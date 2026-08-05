import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(auth.role, 'florist_tasks.view')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const where: Record<string, unknown> = {};

    // Florists only see their own tasks
    if (auth.role === 'florist') {
      where.assignedToId = auth.id;
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      db.floristTask.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          order: {
            include: {
              items: true,
              user: {
                select: { id: true, name: true, phone: true, email: true },
              },
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.floristTask.count({ where }),
    ]);

    // Enrich tasks with formatted order details
    const enrichedTasks = tasks.map((task) => ({
      ...task,
      order: task.order
        ? {
            ...task.order,
            customerInfo: task.order.user
              ? {
                  name: task.order.user.name,
                  phone: task.order.user.phone,
                  email: task.order.user.email,
                }
              : null,
            deliveryInfo: {
              recipientName: task.order.recipientName,
              recipientPhone: task.order.recipientPhone,
              city: task.order.deliveryCity,
              area: task.order.deliveryArea,
              street: task.order.deliveryStreet,
              building: task.order.deliveryBuilding,
              apartment: task.order.deliveryApartment,
              notes: task.order.deliveryNotes,
              deliveryDate: task.order.deliveryDate,
              deliveryTime: task.order.deliveryTime,
            },
            greetingCard: task.order.greetingCard,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks: enrichedTasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching florist tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch florist tasks' },
      { status: 500 }
    );
  }
}
