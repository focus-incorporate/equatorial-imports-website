import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import existing product data
const danielsBlendProducts = [
  {
    id: 'daniels-ristretto',
    name: 'Ristretto',
    brand: 'daniels-blend',
    type: 'capsules',
    intensity: 10,
    roast: 'dark',
    flavorNotes: JSON.stringify(['Chocolate', 'Full-bodied']),
    price: 9.99,
    image: '/images/products/daniels-blend/daniel ristretto-1920w.jpg',
    description: 'Intense dark roast with rich chocolate notes and full-bodied flavor.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '50g (1.76 OZ)',
    inStock: true,
    currentStock: 50,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'daniels-intenso',
    name: 'Intenso',
    brand: 'daniels-blend',
    type: 'capsules',
    intensity: 12,
    roast: 'dark',
    flavorNotes: JSON.stringify(['Very intense', 'Earthy', 'Bold']),
    price: 9.99,
    image: '/images/products/daniels-blend/daniel intenso-1920w.jpg',
    description: 'The most intense blend with earthy, bold characteristics.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '50g (1.76 OZ)',
    inStock: true,
    currentStock: 45,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'daniels-lungo',
    name: 'Lungo',
    brand: 'daniels-blend',
    type: 'capsules',
    intensity: 6,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Aromatic', 'Balanced', 'Smooth']),
    price: 9.99,
    image: '/images/products/daniels-blend/lungo-daniel-s-blend-para-nespresso.webp',
    description: 'Perfectly balanced medium roast with aromatic and smooth profile.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '53g (1.87 OZ)',
    inStock: true,
    currentStock: 60,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'daniels-decaffeinato',
    name: 'Decaffeinato',
    brand: 'daniels-blend',
    type: 'capsules',
    intensity: 5,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Mild', 'Nutty', 'Gentle']),
    price: 10.49,
    image: '/images/products/daniels-blend/descafeinado-daniel-s-blend-para-nespresso-c-psula-de-aluminio.webp',
    description: 'Decaffeinated blend with mild, nutty flavors for any time of day.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '50g (1.76 OZ)',
    inStock: true,
    currentStock: 30,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'daniels-vaniglia',
    name: 'Vaniglia',
    brand: 'daniels-blend',
    type: 'capsules',
    intensity: 5,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Vanilla', 'Sweet', 'Creamy']),
    price: 10.99,
    image: '/images/products/daniels-blend/daniel vaniglia-1920w.jpg',
    description: 'Flavored medium roast with vanilla sweetness and creamy texture.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '50g (1.76 OZ)',
    inStock: true,
    currentStock: 40,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
];

const viaggioEspressoProducts = [
  {
    id: 'viaggio-cafe-03-arabica',
    name: 'Café 03 Arabica',
    brand: 'viaggio-espresso',
    type: 'beans',
    intensity: 6,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Molasses', 'Nutty', 'Floral']),
    price: 14.99,
    image: '/images/products/viaggio-espresso/viaggio-expresso-decaffeinato.jpg',
    description: 'Premium Arabica beans with complex molasses and floral notes.',
    compatibility: JSON.stringify(['All brewing methods']),
    weight: '250g',
    inStock: true,
    currentStock: 25,
    minStockLevel: 5,
    maxStockLevel: 50,
    taxRate: 15,
    category: 'beans',
  },
  {
    id: 'viaggio-italian-roast',
    name: 'Italian Roast',
    brand: 'viaggio-espresso',
    type: 'beans',
    intensity: 8,
    roast: 'dark',
    flavorNotes: JSON.stringify(['Cocoa', 'Toasted', 'Rich']),
    price: 15.99,
    image: '/images/products/viaggio-espresso/vagio Italian Roast.png',
    description: 'Classic Italian dark roast with rich cocoa and toasted flavors.',
    compatibility: JSON.stringify(['All brewing methods']),
    weight: '250g',
    inStock: true,
    currentStock: 20,
    minStockLevel: 5,
    maxStockLevel: 50,
    taxRate: 15,
    category: 'beans',
  },
  {
    id: 'viaggio-intenso-capsules',
    name: 'Intenso Capsules',
    brand: 'viaggio-espresso',
    type: 'capsules',
    intensity: 9,
    roast: 'dark',
    flavorNotes: JSON.stringify(['Strong', 'Robust', 'Spicy']),
    price: 12.99,
    image: '/images/products/viaggio-espresso/viaggio-espresso-intenso.png',
    description: 'Intense dark roast capsules with strong, robust and spicy character.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '112g (3.95 OZ)',
    inStock: true,
    currentStock: 35,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'viaggio-caramello',
    name: 'Caramello',
    brand: 'viaggio-espresso',
    type: 'capsules',
    intensity: 6,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Caramel', 'Buttery', 'Sweet']),
    price: 12.99,
    image: '/images/products/viaggio-espresso/Viaggio_Caramello-1920w.png',
    description: 'Flavored medium roast with indulgent caramel and buttery sweetness.',
    compatibility: JSON.stringify(['Nespresso Original Line']),
    weight: '112g (3.95 OZ)',
    inStock: true,
    currentStock: 30,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
  {
    id: 'viaggio-dolce-gusto-lungo',
    name: 'Dolce Gusto Lungo',
    brand: 'viaggio-espresso',
    type: 'capsules',
    intensity: 5,
    roast: 'medium',
    flavorNotes: JSON.stringify(['Balanced', 'Smooth', 'Mild']),
    price: 11.99,
    image: '/images/products/viaggio-espresso/Viaggio_Lungo-1920w.png',
    description: 'Perfectly balanced lungo with smooth and mild characteristics.',
    compatibility: JSON.stringify(['Dolce Gusto']),
    weight: '112g (3.95 OZ)',
    inStock: true,
    currentStock: 40,
    minStockLevel: 5,
    maxStockLevel: 100,
    taxRate: 15,
    category: 'capsules',
  },
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    // Combine all products
    const allProducts = [...danielsBlendProducts, ...viaggioEspressoProducts];

    // Seed products using upsert to handle existing products
    for (const product of allProducts) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          brand: product.brand,
          type: product.type,
          intensity: product.intensity,
          roast: product.roast,
          flavorNotes: product.flavorNotes,
          price: product.price,
          image: product.image,
          description: product.description,
          compatibility: product.compatibility,
          weight: product.weight,
          inStock: product.inStock,
          currentStock: product.currentStock,
          minStockLevel: product.minStockLevel,
          maxStockLevel: product.maxStockLevel,
          taxRate: product.taxRate,
          category: product.category,
        },
        create: product,
      });
      
      console.log(`✅ Seeded product: ${product.name} (${product.brand})`);
    }

    console.log(`🎉 Successfully seeded ${allProducts.length} products!`);
    
    // Display summary
    const totalProducts = await prisma.product.count();
    const danielsCount = await prisma.product.count({ where: { brand: 'daniels-blend' } });
    const viaggioCount = await prisma.product.count({ where: { brand: 'viaggio-espresso' } });
    
    console.log('\n📊 Database Summary:');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Daniel's Blend: ${danielsCount}`);
    console.log(`Viaggio Espresso: ${viaggioCount}`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('✅ Product seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product seeding failed:', error);
      process.exit(1);
    });
}

export default seedProducts;