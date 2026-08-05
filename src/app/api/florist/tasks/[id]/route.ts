import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission, addDeliveryTrackingEntry, getDeliveryProvider, createNotification } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(auth.role, 'florist_tasks.update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['started', 'in_preparation', 'package_ready', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid task status is required (started, in_preparation, package_ready, completed)' },
        { status: 400 }
      );
    }

    // Fetch the task with order details
    const task = await db.floristTask.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Florists can only update their own tasks
    if (auth.role === 'florist' && task.assignedToId !== auth.id) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own tasks' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      assignedToId: auth.id,
    };

    // Handle each status transition
    if (status === 'started') {
      updateData.startedAt = new Date();
    } else if (status === 'in_preparation') {
      // Update order status to preparing
      await db.order.update({
        where: { id: task.orderId },
        data: { status: 'preparing' },
      });

      await addDeliveryTrackingEntry({
        orderId: task.orderId,
        status: 'preparing',
        note: 'Florist started preparing the arrangement',
        performedBy: auth.id,
        performedByRole: auth.role,
      });
    } else if (status === 'package_ready') {
      updateData.packageReadyAt = new Date();

      // Update order status to ready_for_pickup
      await db.order.update({
        where: { id: task.orderId },
        data: { status: 'ready_for_pickup' },
      });

      // Create delivery tracking entry
      await addDeliveryTrackingEntry({
        orderId: task.orderId,
        status: 'ready_for_pickup',
        note: 'Package ready for pickup / delivery dispatch',
        performedBy: auth.id,
        performedByRole: auth.role,
      });

      // Dispatch to delivery provider
      const order = task.order;
      const provider = getDeliveryProvider('custom');
      const shipmentResult = await provider.createShipment({
        orderId: order.id,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        city: order.deliveryCity,
        area: order.deliveryArea || undefined,
        street: order.deliveryStreet || undefined,
        building: order.deliveryBuilding || undefined,
        notes: order.deliveryNotes || undefined,
        deliveryDate: order.deliveryDate || undefined,
        deliveryTime: order.deliveryTime || undefined,
      });

      if (shipmentResult.success && shipmentResult.trackingId) {
        // Store tracking info
        await db.order.update({
          where: { id: task.orderId },
          data: { paymentId: shipmentResult.trackingId },
        });

        // Notify admin about package ready for delivery
        const admins = await db.user.findMany({
          where: { role: { in: ['admin', 'super_admin'] }, isActive: true },
          select: { id: true },
        });

        for (const admin of admins) {
          await createNotification({
            userId: admin.id,
            type: 'ready_for_pickup',
            title: 'Package Ready for Delivery',
            titleAr: 'الطلب جاهز للتوصيل',
            message: `Order ${order.orderNumber} is ready for delivery. Tracking ID: ${shipmentResult.trackingId}`,
            messageAr: `الطلب ${order.orderNumber} جاهز للتوصيل. رقم التتبع: ${shipmentResult.trackingId}`,
            orderId: order.id,
          });
        }
      }
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedTask = await db.floristTask.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
        order: {
          include: {
            items: true,
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Error updating florist task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update florist task' },
      { status: 500 }
    );
  }
}
