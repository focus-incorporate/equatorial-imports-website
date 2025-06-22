import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    // Fetch all store settings
    const settings = await prisma.storeSetting.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Update each setting
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return prisma.storeSetting.upsert({
        where: { key },
        update: { 
          value: String(value),
          updatedAt: new Date(),
        },
        create: {
          key,
          value: String(value),
          description: `Setting for ${key}`,
        },
      });
    });

    await Promise.all(updatePromises);

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'updated',
        entity: 'settings',
        description: `Updated store settings: ${Object.keys(settings).join(', ')}`,
        metadata: JSON.stringify({ updatedSettings: Object.keys(settings) }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}