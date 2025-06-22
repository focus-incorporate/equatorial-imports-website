import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager', 'staff']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.type = category;
    }

    if (brand) {
      where.brand = brand;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          brand: true,
          type: true,
          price: true,
          image: true,
          description: true,
          currentStock: true,
          minStockLevel: true,
          maxStockLevel: true,
          inStock: true,
          category: true,
          costPrice: true,
          taxRate: true,
          barcode: true,
          intensity: true,
          roast: true,
          weight: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format products for frontend
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      type: product.type,
      price: parseFloat(product.price.toString()),
      image: product.image,
      description: product.description,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      inStock: product.inStock,
      category: product.category,
      costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : null,
      taxRate: parseFloat(product.taxRate.toString()),
      barcode: product.barcode,
      intensity: product.intensity,
      roast: product.roast,
      weight: product.weight,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireRole(['admin', 'manager']);

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'brand', 'type', 'price', 'currentStock'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand,
        type: body.type,
        intensity: body.intensity || 5,
        roast: body.roast || 'medium',
        flavorNotes: JSON.stringify(body.flavorNotes || []),
        price: parseFloat(body.price),
        image: body.image || '/images/placeholder-product.jpg',
        description: body.description || '',
        compatibility: body.compatibility ? JSON.stringify(body.compatibility) : null,
        weight: body.weight || '',
        inStock: body.inStock !== false,
        currentStock: parseInt(body.currentStock),
        minStockLevel: parseInt(body.minStockLevel || '5'),
        maxStockLevel: parseInt(body.maxStockLevel || '100'),
        costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
        barcode: body.barcode || null,
        category: body.category || body.type,
        taxRate: parseFloat(body.taxRate || '15'),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'created',
        entity: 'product',
        entityId: product.id,
        description: `Created product: ${product.name}`,
        metadata: JSON.stringify({ productId: product.id, name: product.name }),
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}