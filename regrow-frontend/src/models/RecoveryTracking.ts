import mongoose, { Schema, Model, Types } from 'mongoose';
import { IRecoveryTrackingDocument, RecoveryStatus } from '../types';

/**
 * RecoveryTracking Schema
 * 
 * Monitors vegetation recovery progress post-intervention using periodic NDVI scans.
 * Provides before/after satellite imagery for impact visualization.
 * 
 * Key Features:
 * - Weekly NDVI monitoring (7-14 day intervals)
 * - Recovery percentage calculation vs. baseline
 * - Status classification (on-track, in-progress, at-risk, completed)
 * - Before/after imagery URLs for donor transparency
 * - Compound index for efficient zone + week queries
 */

interface IRecoveryTrackingModel extends Model<IRecoveryTrackingDocument> {
  createWeeklyScan(
    zoneId: Types.ObjectId,
    weekNumber: number,
    currentNdvi: number,
    beforeImageUrl?: string,
    afterImageUrl?: string
  ): Promise<IRecoveryTrackingDocument>;
  getRecoveryProgress(zoneId: Types.ObjectId): Promise<IRecoveryTrackingDocument[]>;
  getLatestScan(zoneId: Types.ObjectId): Promise<IRecoveryTrackingDocument | null>;
  calculateRecoveryPercentage(
    preFloodNdvi: number,
    postFloodNdvi: number,
    currentNdvi: number
  ): number;
}

const RecoveryTrackingSchema = new Schema<
  IRecoveryTrackingDocument,
  IRecoveryTrackingModel
>(
  {
    zone_id: {
      type: Schema.Types.ObjectId,
      ref: 'DamageAssessment',
      required: [true, 'Zone ID reference is required'],
      index: true
    },
    week_number: {
      type: Number,
      required: [true, 'Week number is required'],
      min: [0, 'Week number must be non-negative'],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value);
        },
        message: 'Week number must be an integer'
      }
    },
    scan_date: {
      type: Date,
      required: [true, 'Scan date is required'],
      default: Date.now,
      validate: {
        validator: function (value: Date) {
          return value <= new Date();
        },
        message: 'Scan date cannot be in the future'
      }
    },
    current_ndvi: {
      type: Number,
      required: [true, 'Current NDVI is required'],
      min: [-1, 'NDVI must be between -1 and 1'],
      max: [1, 'NDVI must be between -1 and 1']
    },
    recovery_percentage: {
      type: Number,
      required: [true, 'Recovery percentage is required'],
      min: [0, 'Recovery percentage must be between 0 and 100'],
      max: [100, 'Recovery percentage must be between 0 and 100']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(RecoveryStatus),
        message: '{VALUE} is not a valid recovery status'
      },
      required: [true, 'Recovery status is required']
    },
    before_image_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string | undefined) {
          if (!value) return true;
          // Basic URL validation
          return /^https?:\/\/.+/.test(value);
        },
        message: 'Before image URL must be a valid HTTP/HTTPS URL'
      }
    },
    after_image_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string | undefined) {
          if (!value) return true;
          return /^https?:\/\/.+/.test(value);
        },
        message: 'After image URL must be a valid HTTP/HTTPS URL'
      }
    }
  },
  {
    timestamps: true,
    collection: 'recovery_tracking'
  }
);

/**
 * Indexes
 */

// Compound index for efficient zone + week queries
RecoveryTrackingSchema.index({ zone_id: 1, week_number: 1 }, { unique: true });

// Index for time-based queries (recent scans)
RecoveryTrackingSchema.index({ scan_date: -1 });

// Index for status-based filtering (find all at-risk zones)
RecoveryTrackingSchema.index({ status: 1 });

/**
 * Static Methods
 */

RecoveryTrackingSchema.statics.calculateRecoveryPercentage = function (
  preFloodNdvi: number,
  postFloodNdvi: number,
  currentNdvi: number
): number {
  // Recovery percentage = (current - post_flood) / (pre_flood - post_flood) × 100
  const totalDamage = preFloodNdvi - postFloodNdvi;
  
  if (totalDamage === 0) {
    // No damage occurred, so 100% recovered
    return 100;
  }

  const recovered = currentNdvi - postFloodNdvi;
  const percentage = (recovered / totalDamage) * 100;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, percentage));
};

RecoveryTrackingSchema.statics.createWeeklyScan = async function (
  zoneId: Types.ObjectId,
  weekNumber: number,
  currentNdvi: number,
  beforeImageUrl?: string,
  afterImageUrl?: string
): Promise<IRecoveryTrackingDocument> {
  // Fetch the damage assessment to get baseline NDVI values
  const DamageAssessment = mongoose.model('DamageAssessment');
  const zone = await DamageAssessment.findById(zoneId);

  if (!zone) {
    throw new Error('Zone not found');
  }

  // Calculate recovery percentage
  const recoveryPercentage = this.calculateRecoveryPercentage(
    zone.pre_flood_ndvi,
    zone.post_flood_ndvi,
    currentNdvi
  );

  // Determine status based on recovery percentage and ΔNDVI
  let status: RecoveryStatus;
  const currentDelta = currentNdvi - zone.pre_flood_ndvi;

  if (currentDelta >= -0.05) {
    // Nearly fully recovered
    status = RecoveryStatus.COMPLETED;
  } else if (recoveryPercentage >= 65) {
    // Good progress
    status = RecoveryStatus.ON_TRACK;
  } else if (recoveryPercentage >= 30) {
    // Some progress
    status = RecoveryStatus.IN_PROGRESS;
  } else {
    // Insufficient progress
    status = RecoveryStatus.AT_RISK;
  }

  const tracking = new this({
    zone_id: zoneId,
    week_number: weekNumber,
    scan_date: new Date(),
    current_ndvi: currentNdvi,
    recovery_percentage: Math.round(recoveryPercentage),
    status,
    before_image_url: beforeImageUrl,
    after_image_url: afterImageUrl
  });

  return tracking.save();
};

RecoveryTrackingSchema.statics.getRecoveryProgress = function (
  zoneId: Types.ObjectId
): Promise<IRecoveryTrackingDocument[]> {
  return this.find({ zone_id: zoneId })
    .sort({ week_number: 1 })
    .populate('zone_id')
    .exec();
};

RecoveryTrackingSchema.statics.getLatestScan = function (
  zoneId: Types.ObjectId
): Promise<IRecoveryTrackingDocument | null> {
  return this.findOne({ zone_id: zoneId })
    .sort({ week_number: -1 })
    .populate('zone_id')
    .exec();
};

/**
 * Instance Methods
 */

RecoveryTrackingSchema.methods.isRecovered = function (): boolean {
  return this.status === RecoveryStatus.COMPLETED;
};

RecoveryTrackingSchema.methods.needsIntervention = function (): boolean {
  return this.status === RecoveryStatus.AT_RISK;
};

RecoveryTrackingSchema.methods.getProgressLabel = function (this: IRecoveryTrackingDocument): string {
  const labels: Record<RecoveryStatus, string> = {
    [RecoveryStatus.COMPLETED]: '✅ Fully Recovered',
    [RecoveryStatus.ON_TRACK]: '🟢 On Track',
    [RecoveryStatus.IN_PROGRESS]: '🟡 In Progress',
    [RecoveryStatus.AT_RISK]: '🔴 Action Required'
  };
  return labels[this.status];
};

RecoveryTrackingSchema.methods.hasImagery = function (): boolean {
  return !!(this.before_image_url && this.after_image_url);
};

/**
 * Virtual: Recovery Status Description
 */
RecoveryTrackingSchema.virtual('status_description').get(function () {
  const descriptions: Record<RecoveryStatus, string> = {
    [RecoveryStatus.COMPLETED]:
      'Zone has fully recovered to pre-flood vegetation levels',
    [RecoveryStatus.ON_TRACK]:
      `Recovery progress: ${this.recovery_percentage}% - Zone is recovering well`,
    [RecoveryStatus.IN_PROGRESS]:
      `Recovery progress: ${this.recovery_percentage}% - Moderate improvement detected`,
    [RecoveryStatus.AT_RISK]:
      `Recovery progress: ${this.recovery_percentage}% - Insufficient improvement, intervention needed`
  };
  return descriptions[this.status];
});

/**
 * Pre-save Hook - Validate week number sequence
 */
RecoveryTrackingSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Check if there's a previous scan for this zone
    const previousScan = await mongoose.model('RecoveryTracking').findOne({
      zone_id: this.zone_id,
      week_number: { $lt: this.week_number }
    }).sort({ week_number: -1 });

    if (previousScan && this.week_number > previousScan.week_number + 2) {
      // Warning: Gap in tracking data
      console.warn(
        `⚠️ Warning: Week number gap detected for zone ${this.zone_id}. Previous: Week ${previousScan.week_number}, Current: Week ${this.week_number}`
      );
    }
  }
  next();
});

/**
 * Post-save Hook - Alert if zone is at risk
 */
RecoveryTrackingSchema.post('save', function (doc: IRecoveryTrackingDocument) {
  if (doc.status === RecoveryStatus.AT_RISK) {
    console.log(
      `🚨 ALERT: Zone ${doc.zone_id} is at risk! Recovery: ${doc.recovery_percentage}% at Week ${doc.week_number}`
    );
  }
});

export const RecoveryTracking = mongoose.model<
  IRecoveryTrackingDocument,
  IRecoveryTrackingModel
>('RecoveryTracking', RecoveryTrackingSchema);
