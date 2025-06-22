import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Fetch all active products for the website
    const products = await prisma.product.findMany({
      where: {
        inStock: true, // Only show products that are marked as in stock
      },
      orderBy: [
        { brand: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
        intensity: true,
        roast: true,
        flavorNotes: true,
        price: true,
        image: true,
        description: true,
        compatibility: true,
        weight: true,
        inStock: true,
        currentStock: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Format products for website consumption
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      type: product.type,
      intensity: product.intensity,
      roast: product.roast,
      flavorNotes: product.flavorNotes ? JSON.parse(product.flavorNotes) : [],
      price: parseFloat(product.price.toString()),
      image: product.image,
      description: product.description,
      compatibility: product.compatibility ? JSON.parse(product.compatibility) : [],
      weight: product.weight,
      inStock: product.inStock && product.currentStock > 0, // Check both flags and stock level
      currentStock: product.currentStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // Group products by brand for website structure
    const danielsBlendProducts = formattedProducts.filter(p => p.brand === 'daniels-blend');
    const viaggioEspressoProducts = formattedProducts.filter(p => p.brand === 'viaggio-espresso');

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      danielsBlendProducts,
      viaggioEspressoProducts,
      totalCount: formattedProducts.length,
    });

  } catch (error) {
    console.error('Products API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        success: false,
        products: [],
        danielsBlendProducts: [],
        viaggioEspressoProducts: [],
        totalCount: 0,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for the API
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}