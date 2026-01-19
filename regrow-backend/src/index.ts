import { database } from './config/database';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Initialize Database and Models
 * 
 * This script:
 * 1. Connects to MongoDB Atlas
 * 2. Loads all Mongoose models
 * 3. Creates/syncs all indexes
 * 4. Displays connection status
 */

async function initializeDatabase() {
  try {
    console.log('🚀 Starting REGROW Backend Database Initialization...\n');

    // Step 1: Connect to MongoDB
    await database.connect();

    // Step 2: Import models (this triggers schema registration)
    console.log('\n📦 Loading Mongoose models...');
    await import('./models');
    console.log('  ✓ DamageAssessment');
    console.log('  ✓ RecoveryCost');
    console.log('  ✓ Donation');
    console.log('  ✓ RecoveryTracking');

    // Step 3: Initialize indexes
    console.log('');
    await database.initializeIndexes();

    // Step 4: Display health check
    console.log('\n📊 Database Health Check:');
    const health = await database.healthCheck();
    console.log(`  Status: ${health.status}`);
    console.log(`  Database: ${health.database}`);
    console.log(`  Ready State: ${health.readyState} (1 = connected)`);

    console.log('\n✅ Database initialization complete!');
    console.log('\n💡 Models available:');
    console.log('  - DamageAssessment: Satellite damage assessments');
    console.log('  - RecoveryCost: Recovery cost calculations');
    console.log('  - Donation: Payment gateway tracking');
    console.log('  - RecoveryTracking: Weekly NDVI monitoring');

    // Keep connection open for testing
    // Uncomment the line below to auto-disconnect
    // await database.disconnect();
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();

export { database };
export * from './models';
