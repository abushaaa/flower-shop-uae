import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hasPermission } from '@/lib/auth';

interface DeliveryProviderInfo {
  name: string;
  displayName: string;
  description: string;
  status: 'active' | 'inactive' | 'test';
  supportedAreas: string[];
}

const PROVIDERS: DeliveryProviderInfo[] = [
  {
    name: 'careem',
    displayName: 'Careem Delivery',
    description: 'On-demand delivery via Careem\'s courier network. Fast same-day delivery across UAE.',
    status: 'active',
    supportedAreas: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  },
  {
    name: 'jeebly',
    displayName: 'Jeebly',
    description: 'E-commerce logistics provider with scheduled and on-demand delivery options.',
    status: 'active',
    supportedAreas: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
  },
  {
    name: 'custom',
    displayName: 'Internal Courier',
    description: 'In-house delivery team for premium and local Dubai deliveries.',
    status: 'active',
    supportedAreas: ['Dubai'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(auth.role, 'delivery.view')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        providers: PROVIDERS,
      },
    });
  } catch (error) {
    console.error('Error fetching delivery providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery providers' },
      { status: 500 }
    );
  }
}
