import { seedDatabase, connectDatabase, disconnectDatabase } from '../src/lib/database';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();
    await seedDatabase();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();