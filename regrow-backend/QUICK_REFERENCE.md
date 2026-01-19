# REGROW MongoDB Schemas - Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Initialize database (connect + create indexes)
npm run dev

# Seed sample data
npx tsx src/scripts/seed.ts

# Run usage examples
npx tsx src/examples.ts
```

## 📦 Import Models

```typescript
import {
  DamageAssessment,
  RecoveryCost,
  Donation,
  RecoveryTracking,
  // Enums
  SeverityLevel,
  ImagerySource,
  PaymentGateway,
  TransactionStatus,
  RecoveryStatus
} from './models';

import { database } from './config/database';
```

## 🔥 Common Operations Cheat Sheet

### DamageAssessment

```typescript
// CREATE
const zone = await DamageAssessment.create({
  zone_id: 'QT-FLOOD-2025-001',
  province: 'Quảng Trị',
  district: 'Triệu Phong',
  commune: 'Triệu An',
  coordinates: { type: 'Point', coordinates: [107.1, 16.8] },
  pre_flood_ndvi: 0.65,
  post_flood_ndvi: 0.38,
  delta_ndvi: -0.27,
  severity: SeverityLevel.SEVERE,
  affected_hectares: 2.5,
  timestamp: new Date(),
  confidence_score: 0.92,
  imagery_source: ImagerySource.SENTINEL_2
});

// FIND BY SEVERITY
const severeZones = await DamageAssessment.findBySeverity(SeverityLevel.SEVERE);

// FIND BY PROVINCE
const provincialZones = await DamageAssessment.findByProvince('Quảng Trị');

// FIND NEARBY (geospatial)
const nearby = await DamageAssessment.findNearby(107.1, 16.8, 20); // 20km

// CALCULATE TOTAL AREA
const totalHa = await DamageAssessment.calculateTotalAffectedArea('Quảng Trị');

// INSTANCE METHODS
zone.isSevere(); // boolean
zone.getLocation(); // "Triệu An, Triệu Phong, Quảng Trị"
```

### RecoveryCost

```typescript
// AUTO-CALCULATE COST
const cost = await RecoveryCost.calculateCostForZone(
  zoneId,        // ObjectId
  'rice',        // crop type
  1.0,           // alpha_crop
  4.0,           // expected yield (ton/ha)
  6000000,       // market price (VND/ton)
  2.5,           // area (hectares)
  -0.27,         // delta NDVI
  1.5            // vulnerability multiplier
);

// FIND BY ZONE
const cost = await RecoveryCost.findByZone(zoneId);

// GET TOTAL FUNDING
const total = await RecoveryCost.getTotalFundingRequired();
const provincial = await RecoveryCost.getTotalFundingRequired('Quảng Trị');

// INSTANCE METHODS
cost.getCostByCategory(); // { labor, materials, seeds, contingency }
cost.isHighPriority();    // boolean (> 20M VND)
```

### Donation

```typescript
// CREATE DONATION
const donation = await Donation.createDonation(
  'Nguyễn Văn An',
  'an@example.com',
  zoneId,
  5000000,              // 5M VND
  PaymentGateway.VNPAY
);

// CONFIRM PAYMENT
await Donation.confirmPayment(
  donation.donation_id,
  blockchainHash         // SHA-256 hash
);

// GET FUNDS RAISED
const raised = await Donation.getTotalFundsRaised(zoneId);

// GET DONATIONS BY ZONE
const allDonations = await Donation.getDonationsByZone(zoneId);
const successful = await Donation.getDonationsByZone(
  zoneId,
  TransactionStatus.SUCCESS
);

// INSTANCE METHODS
donation.isSuccessful();        // boolean
donation.getDonorDisplay();     // "Name (email)"
await donation.markAsFailed();  // Update status
```

### RecoveryTracking

```typescript
// CREATE WEEKLY SCAN (auto-calculates recovery %)
const scan = await RecoveryTracking.createWeeklyScan(
  zoneId,
  8,                           // week 8
  0.58,                        // current NDVI
  'https://before-image.jpg',
  'https://after-image.jpg'
);

// GET RECOVERY PROGRESS
const progress = await RecoveryTracking.getRecoveryProgress(zoneId);

// GET LATEST SCAN
const latest = await RecoveryTracking.getLatestScan(zoneId);

// INSTANCE METHODS
scan.isRecovered();         // boolean
scan.needsIntervention();   // boolean (at-risk)
scan.getProgressLabel();    // "🟢 On Track"
scan.hasImagery();          // boolean
```

## 🎯 Query Patterns

### Filtering

```typescript
// By severity
DamageAssessment.find({ severity: 'severe' })

// By province + severity (uses compound index)
DamageAssessment.find({ province: 'Quảng Trị', severity: 'severe' })

// By date range
DamageAssessment.find({
  timestamp: { $gte: new Date('2025-12-01'), $lte: new Date('2025-12-31') }
})
```

### Geospatial

```typescript
// Find within polygon
DamageAssessment.find({
  coordinates: {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[
          [107.0, 16.5],
          [107.5, 16.5],
          [107.5, 17.0],
          [107.0, 17.0],
          [107.0, 16.5]
        ]]
      }
    }
  }
})

// Find near point
DamageAssessment.find({
  coordinates: {
    $near: {
      $geometry: { type: 'Point', coordinates: [107.1, 16.8] },
      $maxDistance: 10000  // 10km in meters
    }
  }
})
```

### Aggregation

```typescript
// Group by province with totals
DamageAssessment.aggregate([
  {
    $group: {
      _id: '$province',
      total_zones: { $sum: 1 },
      total_hectares: { $sum: '$affected_hectares' },
      avg_ndvi_change: { $avg: '$delta_ndvi' }
    }
  },
  { $sort: { total_hectares: -1 } }
])

// Join with costs
DamageAssessment.aggregate([
  {
    $lookup: {
      from: 'recovery_costs',
      localField: '_id',
      foreignField: 'zone_id',
      as: 'cost'
    }
  },
  { $unwind: '$cost' },
  {
    $project: {
      zone_id: 1,
      province: 1,
      severity: 1,
      final_cost: '$cost.final_cost'
    }
  }
])
```

## 🔐 Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| NDVI | -1 to 1 | "NDVI must be between -1 and 1" |
| Delta NDVI | = post - pre | "Delta NDVI must equal post_flood_ndvi - pre_flood_ndvi" |
| Severity | Matches ΔNDVI | "Severity level does not match ΔNDVI threshold" |
| Coordinates | Valid lat/long | "Invalid coordinates" |
| Cost | ≥ 0 | "Final cost must be non-negative" |
| Donation Amount | 10K - 1B VND | "Minimum donation amount is 10,000 VND" |
| Blockchain Hash | 64 hex chars | "Must be a valid SHA-256 hash" |
| Recovery % | 0-100 | "Recovery percentage must be between 0 and 100" |

## 📊 Indexes

| Model | Index | Type | Purpose |
|-------|-------|------|---------|
| DamageAssessment | coordinates | 2dsphere | Geospatial queries |
| DamageAssessment | (province, severity) | Compound | Filter by location + damage |
| DamageAssessment | timestamp | Single (-1) | Recent assessments |
| RecoveryCost | zone_id | Unique | 1:1 with zones |
| Donation | (zone_id, transaction_status) | Compound | Zone funding queries |
| Donation | donation_id | Unique | Lookup by ID |
| RecoveryTracking | (zone_id, week_number) | Compound Unique | Weekly scans |

## 🧮 Formulas

### Severity Classification
```
ΔNDVI ≤ -0.20    → severe
-0.20 < ΔNDVI < -0.10 → moderate
ΔNDVI ≥ -0.10    → minor
```

### Cost Calculation
```
D = |ΔNDVI|
Yield Loss Ratio = D × α_crop (max 1.0)
Economic Loss = Area × Yield × Price × Yield Loss Ratio
Final Cost = Economic Loss × Vulnerability Multiplier
```

### Recovery Percentage
```
Recovery % = (current_ndvi - post_flood_ndvi) / (pre_flood_ndvi - post_flood_ndvi) × 100
```

### Recovery Status
```
≥95% OR ΔNDVI ≥ -0.05  → completed
≥65%                    → on-track
30-64%                  → in-progress
<30%                    → at-risk
```

## 🔗 References

- **Mongoose Docs**: https://mongoosejs.com/docs/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Geospatial Queries**: https://www.mongodb.com/docs/manual/geospatial-queries/
- **Aggregation Pipeline**: https://www.mongodb.com/docs/manual/aggregation/

## 💡 Pro Tips

1. **Always connect first**: `await database.connect()` before any queries
2. **Use lean() for read-only**: `Model.find().lean()` for better performance
3. **Populate refs**: `Model.find().populate('zone_id')` to join data
4. **Index usage**: Use `.explain()` to verify index usage
5. **Batch operations**: Use `bulkWrite()` for multiple inserts/updates
6. **Transactions**: Use sessions for multi-document ACID operations
7. **Validation**: Always use `runValidators: true` in updates
8. **Error handling**: Wrap operations in try-catch blocks
