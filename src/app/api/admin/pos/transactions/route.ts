import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filter conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.pOSTransaction.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.pOSTransaction.count({ where })
    ]);

    // Format the response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      customer: transaction.customer ? {
        id: transaction.customer.id,
        name: transaction.customer.name,
        email: transaction.customer.email,
        phone: transaction.customer.phone,
      } : null,
      staff: {
        id: transaction.staff.id,
        name: transaction.staff.name,
        email: transaction.staff.email,
      },
      subtotal: parseFloat(transaction.subtotal.toString()),
      taxAmount: parseFloat(transaction.taxAmount.toString()),
      discountAmount: parseFloat(transaction.discountAmount.toString()),
      totalAmount: parseFloat(transaction.totalAmount.toString()),
      paymentMethod: transaction.paymentMethod,
      cashReceived: transaction.cashReceived ? parseFloat(transaction.cashReceived.toString()) : null,
      changeGiven: transaction.changeGiven ? parseFloat(transaction.changeGiven.toString()) : null,
      cardAmount: transaction.cardAmount ? parseFloat(transaction.cardAmount.toString()) : null,
      status: transaction.status,
      notes: transaction.notes,
      receiptPrinted: transaction.receiptPrinted,
      itemCount: transaction.items.length,
      items: transaction.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productBrand: item.product.brand,
        productCategory: item.product.category,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        lineTotal: parseFloat(item.lineTotal.toString()),
        discountAmount: parseFloat(item.discountAmount.toString()),
      }))
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      }
    });

  } catch (error) {
    console.error('POS Transactions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch POS transactions' },
      { status: 500 }
    );
  }
}