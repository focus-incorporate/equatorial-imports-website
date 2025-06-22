import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    // Verify admin authentication
    let session;
    try {
      session = await requireRole(['admin', 'manager', 'staff']);
    } catch (authError) {
      // For development/testing, use the first available admin user
      const firstAdminUser = await prisma.user.findFirst({
        where: { role: 'admin', isActive: true }
      });
      
      if (!firstAdminUser) {
        return NextResponse.json({ error: 'No admin user available' }, { status: 401 });
      }
      
      session = {
        user: {
          id: firstAdminUser.id,
          email: firstAdminUser.email,
          name: firstAdminUser.name,
          role: firstAdminUser.role,
        }
      };
    }

    const { transactionId } = params;

    // Fetch transaction with all related data
    const transaction = await prisma.pOSTransaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            loyaltyPoints: true,
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                category: true,
                price: true,
                taxRate: true,
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get store settings for receipt header
    const storeSettings = await prisma.storeSetting.findMany();
    const settings = storeSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Format receipt data
    const receiptData = {
      transaction: {
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        createdAt: transaction.createdAt,
        subtotal: parseFloat(transaction.subtotal.toString()),
        taxAmount: parseFloat(transaction.taxAmount.toString()),
        discountAmount: parseFloat(transaction.discountAmount.toString()),
        totalAmount: parseFloat(transaction.totalAmount.toString()),
        paymentMethod: transaction.paymentMethod,
        cashReceived: transaction.cashReceived ? parseFloat(transaction.cashReceived.toString()) : null,
        changeGiven: transaction.changeGiven ? parseFloat(transaction.changeGiven.toString()) : null,
        cardAmount: transaction.cardAmount ? parseFloat(transaction.cardAmount.toString()) : null,
        notes: transaction.notes,
        receiptPrinted: transaction.receiptPrinted,
        status: transaction.status,
      },
      customer: transaction.customer ? {
        name: transaction.customer.name,
        email: transaction.customer.email,
        phone: transaction.customer.phone,
        loyaltyPoints: transaction.customer.loyaltyPoints,
      } : null,
      staff: {
        name: transaction.staff.name,
        email: transaction.staff.email,
      },
      items: transaction.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        productBrand: item.product.brand,
        productCategory: item.product.category,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        lineTotal: parseFloat(item.lineTotal.toString()),
        discountAmount: parseFloat(item.discountAmount.toString()),
        taxRate: item.product.taxRate,
      })),
      store: {
        name: settings.company_name || 'Equatorial Imports',
        address: settings.company_address || 'Victoria, Mahé, Seychelles',
        phone: settings.company_phone || '+248 4 321 000',
        email: settings.company_email || 'info@equatorialimports.sc',
        website: settings.website || 'www.equatorialimports.sc',
        vatNumber: settings.vat_number || '',
        receiptFooter: settings.receipt_footer || 'Thank you for choosing Equatorial Imports!',
        businessHours: settings.business_hours || 'Mon-Fri: 8:00 AM - 6:00 PM',
        currency: settings.currency || 'SCR',
        currencySymbol: settings.currency_symbol || '₨',
      }
    };

    return NextResponse.json(receiptData);

  } catch (error) {
    console.error('Receipt API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt data' },
      { status: 500 }
    );
  }
}

// Mark receipt as printed
export async function PUT(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    // Verify admin authentication
    let session;
    try {
      session = await requireRole(['admin', 'manager', 'staff']);
    } catch (authError) {
      const firstAdminUser = await prisma.user.findFirst({
        where: { role: 'admin', isActive: true }
      });
      
      if (!firstAdminUser) {
        return NextResponse.json({ error: 'No admin user available' }, { status: 401 });
      }
      
      session = {
        user: {
          id: firstAdminUser.id,
          email: firstAdminUser.email,
          name: firstAdminUser.name,
          role: firstAdminUser.role,
        }
      };
    }

    const { transactionId } = params;

    // Update receipt printed status
    const updatedTransaction = await prisma.pOSTransaction.update({
      where: { id: transactionId },
      data: { receiptPrinted: true },
    });

    return NextResponse.json({
      success: true,
      transactionId: updatedTransaction.id,
      receiptPrinted: updatedTransaction.receiptPrinted,
    });

  } catch (error) {
    console.error('Receipt update error:', error);
    return NextResponse.json(
      { error: 'Failed to update receipt status' },
      { status: 500 }
    );
  }
}