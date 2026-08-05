import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hasPermission, createAuditLog } from '@/lib/auth';

export async function GET(
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

    if (!hasPermission(auth.role, 'customers.view')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    if (!hasPermission(auth.role, 'users.edit')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, isActive } = body;

    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent non-super_admin from changing roles
    if (role && auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can change user roles' },
        { status: 403 }
      );
    }

    // Prevent deactivating the last super admin
    if (isActive === false && existingUser.role === 'super_admin') {
      const superAdminCount = await db.user.count({
        where: { role: 'super_admin', isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot deactivate the last super admin' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: auth.id,
      action: 'user_updated',
      entityType: 'user',
      entityId: id,
      details: {
        changes: updateData,
        previous: {
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Super admin only for deletion
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === auth.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the last super admin
    if (existingUser.role === 'super_admin') {
      const superAdminCount = await db.user.count({
        where: { role: 'super_admin', isActive: true },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last super admin' },
          { status: 400 }
        );
      }
    }

    // Soft delete
    const user = await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: auth.id,
      action: 'user_deleted',
      entityType: 'user',
      entityId: id,
      details: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
