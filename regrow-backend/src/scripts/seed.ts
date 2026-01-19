import { Types } from 'mongoose';
import { database } from '../config/database';
import {
  DamageAssessment,
  RecoveryCost,
  Donation,
  RecoveryTracking,
  SeverityLevel,
  ImagerySource,
  PaymentGateway
} from '../models';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Seed Database with Sample Data
 * 
 * This script populates the database with realistic sample data for testing:
 * - Multiple damaged zones across Vietnamese provinces
 * - Recovery cost calculations
 * - Sample donations
 * - Weekly recovery tracking
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed process...\n');

    // Connect to database
    await database.connect();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await DamageAssessment.deleteMany({});
    await RecoveryCost.deleteMany({});
    await Donation.deleteMany({});
    await RecoveryTracking.deleteMany({});
    console.log('  ✓ Data cleared\n');

    // Sample 1: Severe Damage in Quảng Trị Province
    console.log('📍 Creating damage assessment for Quảng Trị...');
    const zone1 = await DamageAssessment.create({
      zone_id: 'QT-FLOOD-2025-001',
      province: 'Quảng Trị',
      district: 'Triệu Phong',
      commune: 'Triệu An',
      coordinates: {
        type: 'Point',
        coordinates: [107.1, 16.8] // [longitude, latitude]
      },
      pre_flood_ndvi: 0.65,
      post_flood_ndvi: 0.38,
      delta_ndvi: -0.27,
      severity: SeverityLevel.SEVERE,
      affected_hectares: 2.5,
      timestamp: new Date('2025-12-12'),
      confidence_score: 0.92,
      imagery_source: ImagerySource.SENTINEL_2
    });
    console.log(`  ✓ Zone created: ${zone1.zone_id}\n`);

    // Calculate recovery cost for Zone 1
    console.log('💰 Calculating recovery cost for Quảng Trị zone...');
    const cost1 = await RecoveryCost.calculateCostForZone(
      zone1._id as Types.ObjectId,
      'rice',
      1.0, // alpha_crop for rice
      4.0, // 4 tons per hectare
      6000000, // 6M VND per ton
      2.5, // 2.5 hectares
      -0.27, // delta NDVI
      1.5 // vulnerability multiplier (female-headed household)
    );
    console.log(`  ✓ Recovery cost calculated: ${cost1.final_cost.toLocaleString()} VND\n`);

    // Sample 2: Moderate Damage in Thừa Thiên Huế
    console.log('📍 Creating damage assessment for Thừa Thiên Huế...');
    const zone2 = await DamageAssessment.create({
      zone_id: 'HUE-FLOOD-2025-002',
      province: 'Thừa Thiên Huế',
      district: 'Phong Điền',
      commune: 'Phong Hải',
      coordinates: {
        type: 'Point',
        coordinates: [107.5, 16.4]
      },
      pre_flood_ndvi: 0.58,
      post_flood_ndvi: 0.45,
      delta_ndvi: -0.13,
      severity: SeverityLevel.MODERATE,
      affected_hectares: 1.8,
      timestamp: new Date('2025-12-13'),
      confidence_score: 0.88,
      imagery_source: ImagerySource.SENTINEL_2
    });
    console.log(`  ✓ Zone created: ${zone2.zone_id}\n`);

    const cost2 = await RecoveryCost.calculateCostForZone(
      zone2._id as Types.ObjectId,
      'rice',
      1.0,
      4.0,
      6000000,
      1.8,
      -0.13,
      1.0 // standard multiplier
    );
    console.log(`  ✓ Recovery cost calculated: ${cost2.final_cost.toLocaleString()} VND\n`);

    // Sample 3: Minor Damage in Quảng Bình
    console.log('📍 Creating damage assessment for Quảng Bình...');
    const zone3 = await DamageAssessment.create({
      zone_id: 'QB-FLOOD-2025-003',
      province: 'Quảng Bình',
      district: 'Lệ Thủy',
      commune: 'Hồng Thủy',
      coordinates: {
        type: 'Point',
        coordinates: [106.9, 17.2]
      },
      pre_flood_ndvi: 0.55,
      post_flood_ndvi: 0.48,
      delta_ndvi: -0.07,
      severity: SeverityLevel.MINOR,
      affected_hectares: 1.2,
      timestamp: new Date('2025-12-14'),
      confidence_score: 0.85,
      imagery_source: ImagerySource.SENTINEL_1_SAR
    });
    console.log(`  ✓ Zone created: ${zone3.zone_id}\n`);

    const cost3 = await RecoveryCost.calculateCostForZone(
      zone3._id as Types.ObjectId,
      'vegetables',
      0.8, // vegetables are slightly less sensitive
      2.5,
      8000000, // higher price per ton
      1.2,
      -0.07,
      1.2 // slightly vulnerable
    );
    console.log(`  ✓ Recovery cost calculated: ${cost3.final_cost.toLocaleString()} VND\n`);

    // Create sample donations
    console.log('💳 Creating sample donations...');
    
    const donation1 = await Donation.createDonation(
      'Nguyễn Văn An',
      'an.nguyen@example.com',
      zone1._id as Types.ObjectId,
      5000000, // 5M VND
      PaymentGateway.VNPAY
    );
    
    // Confirm the donation
    await Donation.confirmPayment(
      donation1.donation_id,
      'a'.repeat(64) // Mock blockchain hash
    );
    console.log(`  ✓ Donation 1: ${donation1.amount_vnd.toLocaleString()} VND to ${zone1.zone_id}`);

    const donation2 = await Donation.createDonation(
      'Trần Thị Bình',
      'binh.tran@example.com',
      zone1._id as Types.ObjectId,
      3000000, // 3M VND
      PaymentGateway.MOMO
    );
    await Donation.confirmPayment(
      donation2.donation_id,
      'b'.repeat(64)
    );
    console.log(`  ✓ Donation 2: ${donation2.amount_vnd.toLocaleString()} VND to ${zone1.zone_id}`);

    const donation3 = await Donation.createDonation(
      'Lê Hoàng Cường',
      'cuong.le@example.com',
      zone2._id as Types.ObjectId,
      2000000, // 2M VND
      PaymentGateway.VNPAY
    );
    await Donation.confirmPayment(
      donation3.donation_id,
      'c'.repeat(64)
    );
    console.log(`  ✓ Donation 3: ${donation3.amount_vnd.toLocaleString()} VND to ${zone2.zone_id}\n`);

    // Create recovery tracking for Zone 1 (showing progress over 8 weeks)
    console.log('📈 Creating recovery tracking for Quảng Trị zone...');
    
    await RecoveryTracking.createWeeklyScan(
      zone1._id as Types.ObjectId,
      0, // Week 0 (initial)
      0.38, // post-flood NDVI
      'https://sentinel-hub.com/before-image-1',
      'https://sentinel-hub.com/after-image-1'
    );
    console.log('  ✓ Week 0: Recovery tracking initialized');

    await RecoveryTracking.createWeeklyScan(
      zone1._id as Types.ObjectId,
      2, // Week 2
      0.42,
      'https://sentinel-hub.com/before-image-1',
      'https://sentinel-hub.com/week2-image-1'
    );
    console.log('  ✓ Week 2: NDVI improved to 0.42');

    await RecoveryTracking.createWeeklyScan(
      zone1._id as Types.ObjectId,
      4, // Week 4
      0.48,
      'https://sentinel-hub.com/before-image-1',
      'https://sentinel-hub.com/week4-image-1'
    );
    console.log('  ✓ Week 4: NDVI improved to 0.48');

    await RecoveryTracking.createWeeklyScan(
      zone1._id as Types.ObjectId,
      8, // Week 8
      0.58,
      'https://sentinel-hub.com/before-image-1',
      'https://sentinel-hub.com/week8-image-1'
    );
    console.log('  ✓ Week 8: NDVI improved to 0.58 (74% recovered)\n');

    // Display summary statistics
    console.log('📊 Summary Statistics:');
    const totalZones = await DamageAssessment.countDocuments();
    const severeZones = await DamageAssessment.countDocuments({ severity: SeverityLevel.SEVERE });
    const totalCost = await RecoveryCost.getTotalFundingRequired();
    const totalDonations = await Donation.getTotalFundsRaised(zone1._id as Types.ObjectId);
    
    console.log(`  • Total damaged zones: ${totalZones}`);
    console.log(`  • Severe damage zones: ${severeZones}`);
    console.log(`  • Total funding required: ${totalCost.toLocaleString()} VND`);
    console.log(`  • Funds raised for Zone 1: ${totalDonations.toLocaleString()} VND`);
    console.log(`  • Funding progress: ${((totalDonations / cost1.final_cost) * 100).toFixed(1)}%`);

    console.log('\n✅ Database seeding complete!');
    
    await database.disconnect();
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
