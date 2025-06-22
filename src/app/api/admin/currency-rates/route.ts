import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    // Fetch all currency rates
    const rates = await prisma.currencyRate.findMany({
      orderBy: [
        { baseCurrency: 'asc' },
        { targetCurrency: 'asc' },
      ],
    });

    // Format rates for frontend
    const formattedRates = rates.map((rate) => ({
      baseCurrency: rate.baseCurrency,
      targetCurrency: rate.targetCurrency,
      rate: parseFloat(rate.rate.toString()),
      updatedAt: rate.updatedAt,
    }));

    return NextResponse.json({
      rates: formattedRates,
    });
  } catch (error) {
    console.error('Currency rates API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}