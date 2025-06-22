const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@equatorialimports.sc' }
    });

    if (!adminExists) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          email: 'admin@equatorialimports.sc',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('✅ Default admin user created');
    }

    // Define products data inline (converted from TypeScript)
    const allProducts = [
      {
        id: 'daniels-ristretto', name: 'Ristretto', brand: 'daniels-blend', type: 'capsules',
        intensity: 10, roast: 'dark', flavorNotes: ['Chocolate', 'Full-bodied'], price: 9.99,
        image: '/images/products/daniels-blend/daniel ristretto-1920w.jpg',
        description: 'Intense dark roast with rich chocolate notes and full-bodied flavor.',
        compatibility: ['Nespresso Original Line'], weight: '50g (1.76 OZ)', inStock: true,
      },
      {
        id: 'daniels-intenso', name: 'Intenso', brand: 'daniels-blend', type: 'capsules',
        intensity: 12, roast: 'dark', flavorNotes: ['Very intense', 'Earthy', 'Bold'], price: 9.99,
        image: '/images/products/daniels-blend/daniel intenso-1920w.jpg',
        description: 'The most intense blend with earthy, bold characteristics.',
        compatibility: ['Nespresso Original Line'], weight: '50g (1.76 OZ)', inStock: true,
      },
      {
        id: 'daniels-lungo', name: 'Lungo', brand: 'daniels-blend', type: 'capsules',
        intensity: 6, roast: 'medium', flavorNotes: ['Aromatic', 'Balanced', 'Smooth'], price: 9.99,
        image: '/images/products/daniels-blend/lungo-daniel-s-blend-para-nespresso.webp',
        description: 'Perfectly balanced medium roast with aromatic and smooth profile.',
        compatibility: ['Nespresso Original Line'], weight: '53g (1.87 OZ)', inStock: true,
      },
      {
        id: 'viaggio-italian-roast', name: 'Italian Roast', brand: 'viaggio-espresso', type: 'beans',
        intensity: 8, roast: 'dark', flavorNotes: ['Cocoa', 'Toasted', 'Rich'], price: 15.99,
        image: '/images/products/viaggio-espresso/vagio Italian Roast.png',
        description: 'Classic Italian dark roast with rich cocoa and toasted flavors.',
        compatibility: ['All brewing methods'], weight: '250g', inStock: true,
      },
      {
        id: 'viaggio-intenso-capsules', name: 'Intenso Capsules', brand: 'viaggio-espresso', type: 'capsules',
        intensity: 9, roast: 'dark', flavorNotes: ['Strong', 'Robust', 'Spicy'], price: 12.99,
        image: '/images/products/viaggio-espresso/viaggio-espresso-intenso.png',
        description: 'Intense dark roast capsules with strong, robust and spicy character.',
        compatibility: ['Nespresso Original Line'], weight: '112g (3.95 OZ)', inStock: true,
      }
    ];
    
    for (const product of allProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name, brand: product.brand }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            name: product.name,
            brand: product.brand,
            type: product.type,
            intensity: product.intensity,
            roast: product.roast,
            flavorNotes: JSON.stringify(product.flavorNotes),
            price: product.price,
            image: product.image,
            description: product.description,
            compatibility: product.compatibility ? JSON.stringify(product.compatibility) : null,
            weight: product.weight,
            inStock: product.inStock,
            currentStock: Math.floor(Math.random() * 50) + 10,
            minStockLevel: 5,
            maxStockLevel: 100,
            costPrice: product.price * 0.6,
            category: product.type,
            taxRate: 15,
          }
        });
      }
    }
    console.log('✅ Products migrated to database');

    // Create default store settings
    const defaultSettings = [
      { key: 'company_name', value: 'Equatorial Imports', description: 'Company name' },
      { key: 'company_email', value: 'info@equatorialimports.sc', description: 'Company email' },
      { key: 'company_phone', value: '+248 4 321 000', description: 'Company phone' },
      { key: 'company_address', value: 'Victoria, Mahé, Seychelles', description: 'Company address' },
      { key: 'tax_rate', value: '15', description: 'Default tax rate (%)' },
      { key: 'currency', value: 'SCR', description: 'Primary currency code' },
      { key: 'currency_symbol', value: '₨', description: 'Currency symbol' },
      { key: 'invoice_prefix', value: 'EQ', description: 'Invoice number prefix' },
      { key: 'receipt_footer', value: 'Thank you for choosing Equatorial Imports!', description: 'Receipt footer message' },
      { key: 'business_hours', value: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 8:00 AM - 2:00 PM', description: 'Business operating hours' },
      { key: 'website', value: 'www.equatorialimports.sc', description: 'Company website' },
      { key: 'vat_number', value: 'V12345678', description: 'VAT registration number' },
    ];

    for (const setting of defaultSettings) {
      const exists = await prisma.storeSetting.findUnique({
        where: { key: setting.key }
      });

      if (!exists) {
        await prisma.storeSetting.create({ data: setting });
      }
    }
    console.log('✅ Default store settings created');

    // Create default currency rates
    const defaultRates = [
      { baseCurrency: 'SCR', targetCurrency: 'USD', rate: 0.077 },
      { baseCurrency: 'SCR', targetCurrency: 'EUR', rate: 0.070 },
      { baseCurrency: 'SCR', targetCurrency: 'GBP', rate: 0.061 },
      { baseCurrency: 'USD', targetCurrency: 'SCR', rate: 13.0 },
      { baseCurrency: 'EUR', targetCurrency: 'SCR', rate: 14.3 },
      { baseCurrency: 'GBP', targetCurrency: 'SCR', rate: 16.4 },
    ];

    for (const rate of defaultRates) {
      const exists = await prisma.currencyRate.findUnique({
        where: { 
          baseCurrency_targetCurrency: {
            baseCurrency: rate.baseCurrency,
            targetCurrency: rate.targetCurrency
          }
        }
      });

      if (!exists) {
        await prisma.currencyRate.create({ data: rate });
      }
    }
    console.log('✅ Default currency rates created');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('✅ Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });