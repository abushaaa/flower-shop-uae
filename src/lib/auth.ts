import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { ROLE_PERMISSIONS } from './types';

// Helper to verify user session from Authorization header
export async function getSessionUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '');
    // In production, verify JWT token. For demo, extract user ID from token
    let userId = token;
    if (token.startsWith('demo-')) {
      // Demo token format: demo-{userId}-{timestamp}
      const parts = token.split('-');
      userId = parts.slice(1, -1).join('-'); // Handle user IDs that may contain hyphens (cuid)
    }
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

// Check if user has a specific permission
export function hasPermission(userRole: string, permission: string): boolean {
  if (userRole === 'super_admin') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

// Check if user has any of the given roles
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Middleware factory for role-based access
export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const user = await getSessionUser(request);
    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        ),
        user: null,
      };
    }
    if (allowedRoles && !hasRole(user.role, allowedRoles)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        ),
        user: null,
      };
    }
    return { authorized: true, response: null, user };
  };
}

// Get the user ID from Authorization header (for API routes that accept userId in body too)
export function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  if (token.startsWith('demo-')) {
    const parts = token.split('-');
    return parts.slice(1, -1).join('-');
  }
  return token;
}

// Create an audit log entry
export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        details: JSON.stringify(params.details || {}),
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// Create a notification for a user
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  orderId?: string;
  channel?: string;
}) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        titleAr: params.titleAr || params.title,
        message: params.message,
        messageAr: params.messageAr || params.message,
        orderId: params.orderId || null,
        channel: params.channel || 'in_app',
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// Add a delivery tracking entry
export async function addDeliveryTrackingEntry(params: {
  orderId: string;
  status: string;
  note?: string;
  performedBy?: string;
  performedByRole?: string;
  courierName?: string;
  courierPhone?: string;
  providerName?: string;
  providerTrackId?: string;
}) {
  try {
    const entry = await db.deliveryTracking.create({
      data: {
        orderId: params.orderId,
        status: params.status,
        note: params.note || null,
        performedBy: params.performedBy || null,
        performedByRole: params.performedByRole || null,
        courierName: params.courierName || null,
        courierPhone: params.courierPhone || null,
        providerName: params.providerName || null,
        providerTrackId: params.providerTrackId || null,
      },
    });
    return entry;
  } catch (error) {
    console.error('Failed to create delivery tracking entry:', error);
    return null;
  }
}

// Delivery provider abstraction layer
export interface DeliveryProvider {
  name: string;
  createShipment(params: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    area?: string;
    street?: string;
    building?: string;
    notes?: string;
    deliveryDate?: string;
    deliveryTime?: string;
  }): Promise<{ success: boolean; trackingId?: string; error?: string }>;
  getTrackingStatus(trackingId: string): Promise<{
    success: boolean;
    status?: string;
    courierName?: string;
    courierPhone?: string;
    error?: string;
  }>;
  cancelShipment(trackingId: string): Promise<{ success: boolean; error?: string }>;
}

// Careem Delivery provider (placeholder)
class CareemDeliveryProvider implements DeliveryProvider {
  name = 'careem';

  async createShipment(params: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    area?: string;
    street?: string;
    building?: string;
    notes?: string;
    deliveryDate?: string;
    deliveryTime?: string;
  }): Promise<{ success: boolean; trackingId?: string; error?: string }> {
    // In production: integrate with Careem Delivery API
    console.log(`[Careem] Creating shipment for order ${params.orderId}`);
    return { success: true, trackingId: `CAREEM-${params.orderId.slice(-6)}` };
  }

  async getTrackingStatus(trackingId: string): Promise<{
    success: boolean;
    status?: string;
    courierName?: string;
    courierPhone?: string;
    error?: string;
  }> {
    // In production: call Careem tracking API
    console.log(`[Careem] Tracking ${trackingId}`);
    return { success: true, status: 'picked_up', courierName: 'Careem Driver' };
  }

  async cancelShipment(trackingId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Careem] Canceling ${trackingId}`);
    return { success: true };
  }
}

// Jeebly provider (placeholder)
class JeeblyDeliveryProvider implements DeliveryProvider {
  name = 'jeebly';

  async createShipment(params: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    area?: string;
    street?: string;
    building?: string;
    notes?: string;
    deliveryDate?: string;
    deliveryTime?: string;
  }): Promise<{ success: boolean; trackingId?: string; error?: string }> {
    console.log(`[Jeebly] Creating shipment for order ${params.orderId}`);
    return { success: true, trackingId: `JEEBLY-${params.orderId.slice(-6)}` };
  }

  async getTrackingStatus(trackingId: string): Promise<{
    success: boolean;
    status?: string;
    courierName?: string;
    courierPhone?: string;
    error?: string;
  }> {
    console.log(`[Jeebly] Tracking ${trackingId}`);
    return { success: true, status: 'out_for_delivery', courierName: 'Jeebly Courier' };
  }

  async cancelShipment(trackingId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Jeebly] Canceling ${trackingId}`);
    return { success: true };
  }
}

// Custom/Internal courier provider
class CustomCourierProvider implements DeliveryProvider {
  name = 'custom';

  async createShipment(params: {
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    area?: string;
    street?: string;
    building?: string;
    notes?: string;
    deliveryDate?: string;
    deliveryTime?: string;
  }): Promise<{ success: boolean; trackingId?: string; error?: string }> {
    console.log(`[Custom] Creating shipment for order ${params.orderId}`);
    return { success: true, trackingId: `INTERNAL-${params.orderId.slice(-6)}` };
  }

  async getTrackingStatus(trackingId: string): Promise<{
    success: boolean;
    status?: string;
    courierName?: string;
    courierPhone?: string;
    error?: string;
  }> {
    console.log(`[Custom] Tracking ${trackingId}`);
    return { success: true, status: 'assigned_to_courier', courierName: 'Internal Courier' };
  }

  async cancelShipment(trackingId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Custom] Canceling ${trackingId}`);
    return { success: true };
  }
}

// Provider factory
export function getDeliveryProvider(providerName: string): DeliveryProvider {
  switch (providerName) {
    case 'careem':
      return new CareemDeliveryProvider();
    case 'jeebly':
      return new JeeblyDeliveryProvider();
    case 'quiqup':
      // Quiqup uses same interface, for now fallback to custom
      return new CustomCourierProvider();
    default:
      return new CustomCourierProvider();
  }
}
