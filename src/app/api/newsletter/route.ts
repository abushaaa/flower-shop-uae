import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed' },
          { status: 409 }
        );
      } else {
        // Reactivate
        await db.newsletter.update({
          where: { email },
          data: { isActive: true },
        });

        return NextResponse.json({
          success: true,
          data: { message: 'Subscription reactivated successfully' },
        });
      }
    }

    // Create subscription
    await db.newsletter.create({
      data: { email, isActive: true },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Successfully subscribed to newsletter' },
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
