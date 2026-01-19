# REGROW MongoDB Schema Architecture

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DamageAssessment                                │
│  ═══════════════════════════════════════════════════════════════════   │
│  - _id: ObjectId (Primary Key)                                         │
│  - zone_id: String (Unique, e.g., "QT-FLOOD-2025-001")                │
│  - province: String                                                     │
│  - district: String                                                     │
│  - commune: String                                                      │
│  - coordinates: GeoJSON Point { type, coordinates }                    │
│  - pre_flood_ndvi: Number (-1 to 1)                                   │
│  - post_flood_ndvi: Number (-1 to 1)                                  │
│  - delta_ndvi: Number (calculated)                                    │
│  - severity: Enum (severe|moderate|minor)                             │
│  - affected_hectares: Number                                           │
│  - timestamp: Date                                                      │
│  - confidence_score: Number (0-1)                                      │
│  - imagery_source: Enum (sentinel-2|sentinel-1-sar)                   │
│                                                                          │
│  Indexes:                                                                │
│    • coordinates: 2dsphere (geospatial queries)                        │
│    • (province, severity): compound                                     │
│    • timestamp: -1                                                      │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                           │
         │ Referenced by      │ Referenced by             │ Referenced by
         ▼                    ▼                           ▼
┌──────────────────┐  ┌──────────────────┐    ┌──────────────────────────┐
│  RecoveryCost    │  │    Donation      │    │   RecoveryTracking       │
│  ══════════════  │  │  ══════════════  │    │   ══════════════════════ │
│  - _id           │  │  - _id           │    │  - _id                   │
│  - zone_id ────► │  │  - donation_id   │    │  - zone_id ─────────────►│
│    (ref)         │  │  - zone_id ────► │    │    (ref)                 │
│  - damage_index  │  │    (ref)         │    │  - week_number           │
│  - crop_type     │  │  - donor_info {  │    │  - scan_date             │
│  - alpha_crop    │  │    name, email } │    │  - current_ndvi          │
│  - expected_     │  │  - amount_vnd    │    │  - recovery_percentage   │
│    yield_ton_    │  │  - payment_      │    │  - status (on-track|     │
│    per_ha        │  │    gateway       │    │    in-progress|at-risk|  │
│  - market_price  │  │  - transaction_  │    │    completed)            │
│    _vnd          │  │    status        │    │  - before_image_url      │
│  - yield_loss_   │  │  - payment_      │    │  - after_image_url       │
│    ratio         │  │    timestamp     │    │                          │
│  - economic_loss │  │  - blockchain_   │    │  Indexes:                │
│  - vulnerability │  │    hash          │    │    • (zone_id, week_     │
│    _multiplier   │  │                  │    │      number): unique     │
│  - final_cost    │  │  Indexes:        │    │    • scan_date: -1       │
│  - breakdown {   │  │    • (zone_id,   │    │    • status              │
│    labor,        │  │      transaction │    └──────────────────────────┘
│    materials,    │  │      _status)    │
│    seeds,        │  │    • donation_id │
│    contingency } │  │    • donor_info. │
│                  │  │      email       │
│  Indexes:        │  └──────────────────┘
│    • zone_id:    │
│      unique      │
└──────────────────┘
```

## Data Flow: From Flood to Recovery

```
┌────────────────────────────────────────────────────────────────────────┐
│                         REGROW Platform Flow                           │
└────────────────────────────────────────────────────────────────────────┘

Step 1: DAMAGE ASSESSMENT (UC-1)
═══════════════════════════════════
┌──────────────┐
│ Satellite API│ (Sentinel-2/SAR)
│ (Python)     │
└──────┬───────┘
       │ NDVI Data
       ▼
┌─────────────────────────────────────┐
│   DamageAssessment.create()         │
│   ────────────────────────────      │
│   • Calculate ΔNDVI                 │
│   • Classify severity               │
│   • Store GeoJSON coordinates       │
└──────┬──────────────────────────────┘
       │ zone_id
       ▼

Step 2: COST CALCULATION (UC-2)
═══════════════════════════════
┌─────────────────────────────────────┐
│  RecoveryCost.calculateCostForZone()│
│  ──────────────────────────────────│
│  Formula:                           │
│  D = |ΔNDVI|                        │
│  Yield Loss = D × α_crop            │
│  Economic Loss = Area × Yield ×     │
│                  Price × Loss       │
│  Final Cost = Loss × Vulnerability  │
└──────┬──────────────────────────────┘
       │ final_cost
       ▼

Step 3: DONATION GATEWAY (UC-3)
═══════════════════════════════
┌──────────────────────────────────────┐
│     Donation.createDonation()        │
│     ───────────────────────────      │
│     • Generate donation_id           │
│     • Status: PENDING                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   Payment Gateway (VNPay/MoMo)       │
└──────┬───────────────────────────────┘
       │ Payment Success
       ▼
┌──────────────────────────────────────┐
│   Donation.confirmPayment()          │
│   ──────────────────────────────     │
│   • Status → SUCCESS                 │
│   • Record blockchain_hash           │
│   • Update payment_timestamp         │
└──────┬───────────────────────────────┘
       │ Real-time update
       ▼

Step 4: RECOVERY TRACKING (UC-4)
═════════════════════════════════
┌──────────────────────────────────────┐
│  RecoveryTracking.createWeeklyScan() │
│  ──────────────────────────────────  │
│  • Week 0, 2, 4, 8...                │
│  • Calculate recovery %               │
│  • Auto-determine status              │
│  • Store before/after images          │
└──────────────────────────────────────┘
         │
         ▼
    ┌────────┐
    │ Status │
    └────┬───┘
         │
    ┌────┴──────┬─────────┬──────────┐
    ▼           ▼         ▼          ▼
COMPLETED   ON-TRACK  IN-PROGRESS  AT-RISK
 (≥95%)      (≥65%)     (30-64%)    (<30%)
```

## Formula Calculations

### 1. Damage Classification (Auto-calculated)
```typescript
if (delta_ndvi <= -0.20) → severity = "severe"
else if (delta_ndvi < -0.10) → severity = "moderate"
else → severity = "minor"
```

### 2. Recovery Cost Calculation
```typescript
// Step 1: Damage Index
D = |ΔNDVI| = |post_flood_ndvi - pre_flood_ndvi|

// Step 2: Yield Loss Ratio
yield_loss_ratio = min(D × alpha_crop, 1.0)

// Step 3: Economic Loss
economic_loss = area_ha × 
                expected_yield_ton_per_ha × 
                market_price_vnd × 
                yield_loss_ratio

// Step 4: Final Cost with Vulnerability Adjustment
final_cost = economic_loss × vulnerability_multiplier

// Example:
// Area: 2.5 ha, Yield: 4 ton/ha, Price: 6M VND/ton
// ΔNDVI: -0.27, α_crop: 1.0, Vulnerability: 1.5
// D = 0.27
// Yield Loss = 0.27 × 1.0 = 0.27 (27%)
// Economic Loss = 2.5 × 4 × 6M × 0.27 = 16.2M VND
// Final Cost = 16.2M × 1.5 = 24.3M VND
```

### 3. Recovery Percentage
```typescript
// Recovery % = (current - post_flood) / (pre_flood - post_flood) × 100
total_damage = pre_flood_ndvi - post_flood_ndvi
recovered = current_ndvi - post_flood_ndvi
recovery_percentage = (recovered / total_damage) × 100

// Example:
// Pre-flood: 0.65, Post-flood: 0.38, Current (Week 8): 0.58
// Total damage = 0.65 - 0.38 = 0.27
// Recovered = 0.58 - 0.38 = 0.20
// Recovery % = (0.20 / 0.27) × 100 = 74%
```

## Query Performance Optimizations

### 1. Geospatial Queries (Find nearby zones)
```typescript
// Uses 2dsphere index on coordinates
DamageAssessment.find({
  coordinates: {
    $near: {
      $geometry: { type: 'Point', coordinates: [107.1, 16.8] },
      $maxDistance: 20000  // 20km in meters
    }
  }
})
```

### 2. Compound Index Queries (Filter by province + severity)
```typescript
// Uses compound index (province, severity)
DamageAssessment.find({
  province: 'Quảng Trị',
  severity: 'severe'
})
```

### 3. Aggregation for Analytics
```typescript
// Get total funding by province
RecoveryCost.aggregate([
  {
    $lookup: {
      from: 'damage_assessments',
      localField: 'zone_id',
      foreignField: '_id',
      as: 'zone'
    }
  },
  { $unwind: '$zone' },
  {
    $group: {
      _id: '$zone.province',
      total_cost: { $sum: '$final_cost' },
      zone_count: { $sum: 1 }
    }
  }
])
```

## Best Practice Summary

✅ **TypeScript Type Safety**: All schemas have full TypeScript support  
✅ **Validation**: Schema-level + custom validators for data integrity  
✅ **Indexing**: Strategic indexes for query performance  
✅ **Referential Integrity**: Foreign key constraints via ObjectId refs  
✅ **Auto-calculation**: Severity, yield loss, recovery % computed automatically  
✅ **Immutability**: Confirmed donations cannot be modified  
✅ **Geospatial**: 2dsphere index for location-based queries  
✅ **Timestamps**: Auto-managed createdAt/updatedAt fields  
✅ **Hooks**: Pre/post-save validation and logging  
✅ **Static Methods**: Reusable query helpers on models  

## Next Steps

1. **Test Database Connection**: `npm run dev`
2. **Seed Sample Data**: `npx tsx src/scripts/seed.ts`
3. **Create API Routes**: Next.js API routes in `/pages/api`
4. **Add Authentication**: Implement donor/official roles
5. **Integrate Satellite API**: Connect to Sentinel Hub
6. **Payment Gateway**: VNPay/MoMo SDK integration
7. **Real-time Updates**: WebSocket for live donation tracking
