# REGROW Backend - MongoDB Schemas with Mongoose

REGROW platform backend with TypeScript + Mongoose schemas for post-flood agricultural recovery tracking.

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- TypeScript knowledge

## 🚀 Quick Start

### 1. Installation

```bash
cd regrow-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/regrow?retryWrites=true&w=majority
NODE_ENV=development
PORT=3001
```

### 3. Initialize Database

```bash
npm run dev
```

This will:
- Connect to MongoDB Atlas
- Register all Mongoose models
- Create/sync all indexes
- Display connection status

### 4. Seed Sample Data (Optional)

```bash
npx tsx src/scripts/seed.ts
```

Populates database with:
- 3 damaged zones (Quảng Trị, Thừa Thiên Huế, Quảng Bình)
- Recovery cost calculations
- Sample donations
- 8-week recovery tracking for Zone 1

## 📁 Project Structure

```
regrow-backend/
├── src/
│   ├── models/
│   │   ├── DamageAssessment.ts   # Satellite damage data + geospatial queries
│   │   ├── RecoveryCost.ts       # Cost calculation engine
│   │   ├── Donation.ts           # Payment gateway tracking
│   │   ├── RecoveryTracking.ts   # Weekly NDVI monitoring
│   │   └── index.ts              # Model exports
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces and enums
│   ├── config/
│   │   └── database.ts           # MongoDB connection manager
│   ├── scripts/
│   │   └── seed.ts               # Sample data seeding
│   └── index.ts                  # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🗂️ Database Schemas

### 1. DamageAssessment

Stores satellite-based flood damage assessments.

**Key Fields:**
- `zone_id`: Unique zone identifier (e.g., "QT-FLOOD-2025-001")
- `coordinates`: GeoJSON Point for geospatial queries
- `delta_ndvi`: NDVI change (pre-flood vs. post-flood)
- `severity`: `severe` | `moderate` | `minor`
- `imagery_source`: `sentinel-2` | `sentinel-1-sar`

**Indexes:**
- Geospatial 2dsphere index on `coordinates`
- Compound index: `(province, severity)`

**Static Methods:**
```typescript
// Find all severe damage zones
const zones = await DamageAssessment.findBySeverity(SeverityLevel.SEVERE);

// Find zones within 10km of a point
const nearby = await DamageAssessment.findNearby(107.1, 16.8, 10);

// Calculate total affected area
const totalHa = await DamageAssessment.calculateTotalAffectedArea('Quảng Trị');
```

### 2. RecoveryCost

Calculates monetary recovery costs using ΔNDVI → Yield Loss formula.

**Formula:**
```
Damage Index (D) = |ΔNDVI|
Yield Loss Ratio = D × α_crop
Economic Loss = Area × Expected Yield × Market Price × Yield Loss Ratio
Final Cost = Economic Loss × Vulnerability Multiplier
```

**Key Fields:**
- `zone_id`: Reference to DamageAssessment
- `crop_type`: `rice` | `corn` | `vegetables` | `fruit` | `other`
- `alpha_crop`: Crop sensitivity factor (0.8-1.2)
- `vulnerability_multiplier`: 1.0-2.0 for at-risk households
- `breakdown`: Cost allocation (labor, materials, seeds, contingency)

**Static Methods:**
```typescript
// Auto-calculate cost for a zone
const cost = await RecoveryCost.calculateCostForZone(
  zoneId,
  'rice',
  1.0,      // alpha_crop
  4.0,      // expected yield (ton/ha)
  6000000,  // market price (VND/ton)
  2.5,      // area (hectares)
  -0.27,    // delta NDVI
  1.5       // vulnerability multiplier
);

// Get total funding required
const total = await RecoveryCost.getTotalFundingRequired('Quảng Trị');
```

### 3. Donation

Tracks donations with blockchain-backed immutability.

**Key Fields:**
- `donation_id`: Auto-generated (e.g., "DON-1234567890-ABC123")
- `donor_info`: Name and email
- `amount_vnd`: Donation amount (10,000 - 1,000,000,000 VND)
- `payment_gateway`: `vnpay` | `momo`
- `transaction_status`: `pending` | `success` | `failed`
- `blockchain_hash`: SHA-256 hash for immutability

**Indexes:**
- Compound index: `(zone_id, transaction_status)`

**Static Methods:**
```typescript
// Create new donation
const donation = await Donation.createDonation(
  'Nguyễn Văn An',
  'an@example.com',
  zoneId,
  5000000,  // 5M VND
  PaymentGateway.VNPAY
);

// Confirm payment with blockchain hash
await Donation.confirmPayment(donationId, blockchainHash);

// Get total funds raised for a zone
const total = await Donation.getTotalFundsRaised(zoneId);
```

### 4. RecoveryTracking

Monitors weekly vegetation recovery progress.

**Key Fields:**
- `zone_id`: Reference to DamageAssessment
- `week_number`: 0, 2, 4, 8, etc.
- `current_ndvi`: Latest NDVI reading
- `recovery_percentage`: 0-100% (calculated vs. baseline)
- `status`: `on-track` | `in-progress` | `at-risk` | `completed`
- `before_image_url` / `after_image_url`: Satellite imagery URLs

**Indexes:**
- Compound unique index: `(zone_id, week_number)`

**Static Methods:**
```typescript
// Create weekly scan (auto-calculates recovery %)
const scan = await RecoveryTracking.createWeeklyScan(
  zoneId,
  8,      // week 8
  0.58,   // current NDVI
  'https://before-image-url',
  'https://after-image-url'
);

// Get all scans for a zone
const progress = await RecoveryTracking.getRecoveryProgress(zoneId);

// Get latest scan
const latest = await RecoveryTracking.getLatestScan(zoneId);
```

## 🔍 Query Examples

### Find zones near a location

```typescript
const zones = await DamageAssessment.findNearby(
  107.1,  // longitude
  16.8,   // latitude
  20      // max distance (km)
);
```

### Get funding progress for a zone

```typescript
const zone = await DamageAssessment.findOne({ zone_id: 'QT-FLOOD-2025-001' });
const cost = await RecoveryCost.findByZone(zone._id);
const raised = await Donation.getTotalFundsRaised(zone._id);
const progress = (raised / cost.final_cost) * 100;

console.log(`Funding: ${progress.toFixed(1)}% (${raised}/${cost.final_cost} VND)`);
```

### Track recovery over time

```typescript
const tracking = await RecoveryTracking.getRecoveryProgress(zoneId);

tracking.forEach(scan => {
  console.log(
    `Week ${scan.week_number}: NDVI ${scan.current_ndvi} - ` +
    `${scan.recovery_percentage}% recovered (${scan.status})`
  );
});
```

## ✅ Validation Rules

### DamageAssessment
- NDVI values: -1 to 1
- Severity auto-calculated from ΔNDVI:
  - `severe`: ΔNDVI ≤ -0.20
  - `moderate`: -0.20 < ΔNDVI < -0.10
  - `minor`: ΔNDVI ≥ -0.10
- Coordinates: Valid longitude/latitude

### RecoveryCost
- `final_cost` ≥ 0
- `yield_loss_ratio` = `damage_index` × `alpha_crop` (capped at 1.0)
- `final_cost` = `economic_loss` × `vulnerability_multiplier`
- Cost breakdown must total 100%

### Donation
- Amount: 10,000 - 1,000,000,000 VND (whole numbers)
- Successful donations require `payment_timestamp` and `blockchain_hash`
- Blockchain hash: 64-character SHA-256 hex string
- Confirmed donations cannot be modified

### RecoveryTracking
- `recovery_percentage`: 0-100%
- `current_ndvi`: -1 to 1
- Status auto-determined by recovery %:
  - `completed`: ≥95% or ΔNDVI ≥ -0.05
  - `on-track`: ≥65%
  - `in-progress`: 30-64%
  - `at-risk`: <30%

## 🛡️ Best Practices Implemented

### 1. TypeScript Types
- Strict type checking enabled
- Interfaces for all documents
- Enum types for categorical fields

### 2. Indexing Strategy
- Geospatial index for proximity queries
- Compound indexes for common filter combinations
- Unique indexes for identifiers

### 3. Validation
- Schema-level validation with custom validators
- Pre-save hooks for auto-calculation
- Cross-field validation (e.g., ΔNDVI vs. severity)

### 4. Methods
- Static methods for common queries
- Instance methods for document operations
- Aggregation pipelines for analytics

### 5. Error Handling
- Descriptive validation messages
- Connection retry logic
- Graceful shutdown handlers

### 6. Performance
- Connection pooling (max 10 connections)
- Index optimization for frequent queries
- Lean queries for read-heavy operations

## 🧪 Testing

### Initialize database and check connection

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
📍 Database: regrow
✓ Indexes synced for DamageAssessment
✓ Indexes synced for RecoveryCost
✓ Indexes synced for Donation
✓ Indexes synced for RecoveryTracking
```

### Seed sample data

```bash
npx tsx src/scripts/seed.ts
```

### Query sample data

Create a test script:

```typescript
// test-query.ts
import { database, DamageAssessment, Donation } from './src';

async function test() {
  await database.connect();
  
  // Find severe zones
  const zones = await DamageAssessment.findBySeverity('severe');
  console.log(`Found ${zones.length} severe damage zones`);
  
  // Get funding for first zone
  const raised = await Donation.getTotalFundsRaised(zones[0]._id);
  console.log(`Raised: ${raised.toLocaleString()} VND`);
  
  await database.disconnect();
}

test();
```

## 📚 Next Steps

1. **API Routes**: Create Next.js API routes that use these models
2. **Authentication**: Add user authentication for donors/officials
3. **Real-time Updates**: Implement WebSocket for live funding progress
4. **Satellite Integration**: Connect to Sentinel Hub API
5. **Payment Gateway**: Integrate VNPay/MoMo SDKs

## 🔗 Related Documentation

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Geospatial Queries](https://www.mongodb.com/docs/manual/geospatial-queries/)
- [TypeScript with Mongoose](https://mongoosejs.com/docs/typescript.html)

## 📝 License

MIT
