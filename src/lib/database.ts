import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database utility functions
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Seed function for initial data
export async function seedDatabase() {
  try {
    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@equatorialimports.sc' }
    });

    if (!adminExists) {
      // Create default admin user
      const bcrypt = require('bcryptjs');
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

    // Migrate existing products from static data to database
    const { allProducts } = await import('@/data/products');
    
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
            currentStock: Math.floor(Math.random() * 50) + 10, // Random initial stock
            minStockLevel: 5,
            maxStockLevel: 100,
            costPrice: product.price * 0.6, // Assume 40% markup
            category: product.type,
            taxRate: 15, // 15% tax rate for Seychelles
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

    // Create sample customers
    const sampleCustomers = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+248 4 567 890',
        address: 'Victoria, Mahé',
        customerGroup: 'regular'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+248 4 567 891',
        address: 'Beau Vallon, Mahé',
        customerGroup: 'premium'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '+248 4 567 892',
        address: 'Praslin',
        customerGroup: 'regular'
      }
    ];

    for (const customer of sampleCustomers) {
      const exists = await prisma.customer.findFirst({
        where: { email: customer.email }
      });

      if (!exists) {
        await prisma.customer.create({ data: customer });
      }
    }
    console.log('✅ Sample customers created');

    // Create sample orders
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    
    if (customers.length > 0 && products.length > 0) {
      const sampleOrders = [
        {
          customerId: customers[0].id,
          customerName: customers[0].name,
          customerEmail: customers[0].email,
          customerPhone: customers[0].phone || '',
          deliveryAddress: customers[0].address || 'Victoria, Mahé',
          subtotal: 29.97,
          deliveryFee: 0,
          taxAmount: 4.50,
          total: 34.47,
          status: 'delivered',
          paymentStatus: 'paid'
        },
        {
          customerId: customers[1].id,
          customerName: customers[1].name,
          customerEmail: customers[1].email,
          customerPhone: customers[1].phone || '',
          deliveryAddress: customers[1].address || 'Beau Vallon, Mahé',
          subtotal: 45.98,
          deliveryFee: 25,
          taxAmount: 6.90,
          total: 77.88,
          status: 'confirmed',
          paymentStatus: 'pending'
        },
        {
          customerId: customers[2].id,
          customerName: customers[2].name,
          customerEmail: customers[2].email,
          customerPhone: customers[2].phone || '',
          deliveryAddress: customers[2].address || 'Praslin',
          subtotal: 19.99,
          deliveryFee: 25,
          taxAmount: 3.00,
          total: 47.99,
          status: 'pending',
          paymentStatus: 'pending'
        }
      ];

      for (const orderData of sampleOrders) {
        const existingOrder = await prisma.order.findFirst({
          where: { 
            customerEmail: orderData.customerEmail,
            total: orderData.total
          }
        });

        if (!existingOrder) {
          const order = await prisma.order.create({
            data: orderData
          });

          // Add order items
          const orderItems = [
            {
              orderId: order.id,
              productId: products[0].id,
              quantity: 3,
              unitPrice: products[0].price,
              lineTotal: products[0].price * 3
            }
          ];

          for (const item of orderItems) {
            await prisma.orderItem.create({ data: item });
          }
        }
      }
      console.log('✅ Sample orders created');
    }

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
  }
}