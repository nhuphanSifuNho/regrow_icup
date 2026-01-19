import { Types } from 'mongoose';
import { database } from './config/database';
import {
  DamageAssessment,
  RecoveryCost,
  Donation,
  RecoveryTracking,
  SeverityLevel,
  ImagerySource,
  PaymentGateway
} from './models';

/**
 * Usage Examples for REGROW MongoDB Schemas
 * 
 * This file demonstrates common operations and query patterns.
 * Run with: npx tsx src/examples.ts
 */

async function examples() {
  try {
    await database.connect();
    console.log('🚀 Running REGROW Schema Examples\n');

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 1: Create Damage Assessment
    // ═══════════════════════════════════════════════════════════════
    console.log('1️⃣  CREATE DAMAGE ASSESSMENT');
    console.log('─'.repeat(50));

    const zone = await DamageAssessment.create({
      zone_id: 'EXAMPLE-2026-001',
      province: 'Quảng Trị',
      district: 'Gio Linh',
      coordinates: {
        type: 'Point',
        coordinates: [107.0, 16.9]
      },
      pre_flood_ndvi: 0.68,
      post_flood_ndvi: 0.35,
      delta_ndvi: -0.33, // Severe damage
      severity: SeverityLevel.SEVERE,
      affected_hectares: 3.2,
      timestamp: new Date(),
      confidence_score: 0.94,
      imagery_source: ImagerySource.SENTINEL_2
    });

    console.log(`✓ Created zone: ${zone.zone_id}`);
    console.log(`  Location: ${zone.getLocation()}`);
    console.log(`  Severity: ${zone.severity} (ΔNDVI: ${zone.delta_ndvi})`);
    console.log(`  Affected area: ${zone.affected_hectares} hectares\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 2: Calculate Recovery Cost
    // ═══════════════════════════════════════════════════════════════
    console.log('2️⃣  CALCULATE RECOVERY COST');
    console.log('─'.repeat(50));

    const cost = await RecoveryCost.calculateCostForZone(
      zone._id as Types.ObjectId,
      'rice',
      1.0,     // alpha_crop: rice is very sensitive
      4.5,     // expected yield: 4.5 tons per hectare
      6500000, // market price: 6.5M VND per ton
      3.2,     // area: same as affected_hectares
      -0.33,   // delta NDVI from zone
      1.8      // vulnerability multiplier (very poor household)
    );

    console.log('✓ Cost calculation complete');
    console.log(`  Damage Index: ${cost.damage_index.toFixed(2)}`);
    console.log(`  Yield Loss Ratio: ${(cost.yield_loss_ratio * 100).toFixed(1)}%`);
    console.log(`  Economic Loss: ${cost.economic_loss.toLocaleString()} VND`);
    console.log(`  Vulnerability Multiplier: ${cost.vulnerability_multiplier}x`);
    console.log(`  FINAL COST: ${cost.final_cost.toLocaleString()} VND`);
    
    const breakdown = cost.getCostByCategory();
    console.log('  Cost Breakdown:');
    console.log(`    • Labor (40%): ${breakdown.labor.toLocaleString()} VND`);
    console.log(`    • Materials (30%): ${breakdown.materials.toLocaleString()} VND`);
    console.log(`    • Seeds (20%): ${breakdown.seeds.toLocaleString()} VND`);
    console.log(`    • Contingency (10%): ${breakdown.contingency.toLocaleString()} VND\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 3: Process Donations
    // ═══════════════════════════════════════════════════════════════
    console.log('3️⃣  PROCESS DONATIONS');
    console.log('─'.repeat(50));

    // Create donation
    const donation = await Donation.createDonation(
      'Phạm Minh Tuấn',
      'tuan.pham@example.com',
      zone._id as Types.ObjectId,
      10000000, // 10M VND
      PaymentGateway.VNPAY
    );

    console.log(`✓ Donation created: ${donation.donation_id}`);
    console.log(`  Donor: ${donation.getDonorDisplay()}`);
    console.log(`  Amount: ${donation.amount_vnd.toLocaleString()} VND`);
    console.log(`  Gateway: ${donation.payment_gateway}`);
    console.log(`  Status: ${donation.transaction_status}`);

    // Simulate payment confirmation
    const confirmedDonation = await Donation.confirmPayment(
      donation.donation_id,
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );

    console.log(`✓ Payment confirmed!`);
    console.log(`  Status: ${confirmedDonation?.transaction_status}`);
    console.log(`  Blockchain hash: ${confirmedDonation?.blockchain_hash?.substring(0, 16)}...`);

    // Calculate funding progress
    const totalRaised = await Donation.getTotalFundsRaised(zone._id as Types.ObjectId);
    const fundingProgress = (totalRaised / cost.final_cost) * 100;

    console.log(`\n📊 Funding Progress:`);
    console.log(`  Raised: ${totalRaised.toLocaleString()} VND`);
    console.log(`  Required: ${cost.final_cost.toLocaleString()} VND`);
    console.log(`  Progress: ${fundingProgress.toFixed(1)}%\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 4: Track Recovery Progress
    // ═══════════════════════════════════════════════════════════════
    console.log('4️⃣  TRACK RECOVERY PROGRESS');
    console.log('─'.repeat(50));

    // Initial scan (Week 0)
    const week0 = await RecoveryTracking.createWeeklyScan(
      zone._id as Types.ObjectId,
      0,
      0.35, // post-flood NDVI
      'https://example.com/before.jpg',
      'https://example.com/after-week0.jpg'
    );
    console.log(`Week 0: NDVI ${week0.current_ndvi} - ${week0.status} (${week0.recovery_percentage}%)`);

    // Week 4 scan (some recovery)
    const week4 = await RecoveryTracking.createWeeklyScan(
      zone._id as Types.ObjectId,
      4,
      0.48,
      'https://example.com/before.jpg',
      'https://example.com/after-week4.jpg'
    );
    console.log(`Week 4: NDVI ${week4.current_ndvi} - ${week4.status} (${week4.recovery_percentage}%)`);

    // Week 8 scan (good progress)
    const week8 = await RecoveryTracking.createWeeklyScan(
      zone._id as Types.ObjectId,
      8,
      0.60,
      'https://example.com/before.jpg',
      'https://example.com/after-week8.jpg'
    );
    console.log(`Week 8: NDVI ${week8.current_ndvi} - ${week8.status} (${week8.recovery_percentage}%)`);
    console.log(`${week8.getProgressLabel()}\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 5: Geospatial Queries
    // ═══════════════════════════════════════════════════════════════
    console.log('5️⃣  GEOSPATIAL QUERIES');
    console.log('─'.repeat(50));

    // Find zones within 50km of Đông Hà city
    const nearbyZones = await DamageAssessment.findNearby(
      107.1, // Đông Hà longitude
      16.8,  // Đông Hà latitude
      50     // 50km radius
    );

    console.log(`✓ Found ${nearbyZones.length} zones within 50km of Đông Hà`);
    nearbyZones.forEach(z => {
      console.log(`  • ${z.zone_id} (${z.severity}), ${z.district}`);
    });
    console.log();

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 6: Aggregation Queries
    // ═══════════════════════════════════════════════════════════════
    console.log('6️⃣  AGGREGATION QUERIES');
    console.log('─'.repeat(50));

    // Total affected area
    const totalArea = await DamageAssessment.calculateTotalAffectedArea('Quảng Trị');
    console.log(`✓ Total affected area in Quảng Trị: ${totalArea.toFixed(2)} hectares`);

    // Severe zones only
    const severeZones = await DamageAssessment.findBySeverity(SeverityLevel.SEVERE);
    console.log(`✓ Total severe damage zones: ${severeZones.length}`);

    // Total funding required
    const totalFunding = await RecoveryCost.getTotalFundingRequired('Quảng Trị');
    console.log(`✓ Total funding required for Quảng Trị: ${totalFunding.toLocaleString()} VND\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 7: Complex Query - Dashboard Data
    // ═══════════════════════════════════════════════════════════════
    console.log('7️⃣  DASHBOARD SUMMARY');
    console.log('─'.repeat(50));

    const dashboardData = {
      totalZones: await DamageAssessment.countDocuments(),
      severeZones: await DamageAssessment.countDocuments({ severity: SeverityLevel.SEVERE }),
      totalAffectedHectares: await DamageAssessment.calculateTotalAffectedArea(),
      totalFundingNeeded: await RecoveryCost.getTotalFundingRequired(),
      totalDonations: await Donation.countDocuments({ transaction_status: 'success' }),
      successfulTransactions: await Donation.countDocuments({ transaction_status: 'success' })
    };

    console.log('Platform Overview:');
    console.log(`  🗺️  Damaged Zones: ${dashboardData.totalZones} (${dashboardData.severeZones} severe)`);
    console.log(`  📏 Total Affected: ${dashboardData.totalAffectedHectares.toFixed(2)} hectares`);
    console.log(`  💰 Funding Needed: ${dashboardData.totalFundingNeeded.toLocaleString()} VND`);
    console.log(`  🎁 Donations: ${dashboardData.totalDonations} successful\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 8: Update Operations
    // ═══════════════════════════════════════════════════════════════
    console.log('8️⃣  UPDATE OPERATIONS');
    console.log('─'.repeat(50));

    // Update zone confidence score (e.g., after manual verification)
    const updatedZone = await DamageAssessment.findByIdAndUpdate(
      zone._id,
      { confidence_score: 0.98 },
      { new: true, runValidators: true }
    );
    console.log(`✓ Updated confidence score: ${updatedZone?.confidence_score}\n`);

    // ═══════════════════════════════════════════════════════════════
    // EXAMPLE 9: Error Handling
    // ═══════════════════════════════════════════════════════════════
    console.log('9️⃣  ERROR HANDLING EXAMPLES');
    console.log('─'.repeat(50));

    try {
      // Try to create zone with invalid NDVI
      await DamageAssessment.create({
        zone_id: 'INVALID-001',
        province: 'Test',
        district: 'Test',
        coordinates: { type: 'Point', coordinates: [107.0, 16.8] },
        pre_flood_ndvi: 1.5, // INVALID: > 1.0
        post_flood_ndvi: 0.5,
        delta_ndvi: -0.5,
        severity: SeverityLevel.SEVERE,
        affected_hectares: 1.0,
        timestamp: new Date(),
        confidence_score: 0.9,
        imagery_source: ImagerySource.SENTINEL_2
      });
    } catch (error: any) {
      console.log('✓ Validation error caught correctly:');
      console.log(`  Error: ${error.message}\n`);
    }

    // ═══════════════════════════════════════════════════════════════
    // Cleanup Example Data
    // ═══════════════════════════════════════════════════════════════
    console.log('🧹 CLEANUP');
    console.log('─'.repeat(50));
    
    await DamageAssessment.findByIdAndDelete(zone._id);
    await RecoveryCost.findOneAndDelete({ zone_id: zone._id });
    await Donation.deleteMany({ zone_id: zone._id });
    await RecoveryTracking.deleteMany({ zone_id: zone._id });
    
    console.log('✓ Example data cleaned up\n');

    console.log('✅ All examples completed successfully!');
    
    await database.disconnect();
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples
if (require.main === module) {
  examples();
}

export { examples };
