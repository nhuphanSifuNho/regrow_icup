import mongoose, { Schema, Model } from 'mongoose';
import {
  IDamageAssessmentDocument,
  SeverityLevel,
  ImagerySource
} from '../types';

/**
 * DamageAssessment Schema
 * 
 * Stores satellite-based flood damage assessments with geospatial data.
 * Supports both Sentinel-2 optical and Sentinel-1 SAR imagery.
 * 
 * Key Features:
 * - GeoJSON Point for precise location tracking
 * - Geospatial 2dsphere index for proximity queries
 * - Compound index for efficient province + severity filtering
 * - NDVI change tracking for damage quantification
 */

interface IDamageAssessmentModel extends Model<IDamageAssessmentDocument> {
  findBySeverity(severity: SeverityLevel): Promise<IDamageAssessmentDocument[]>;
  findByProvince(province: string): Promise<IDamageAssessmentDocument[]>;
  findNearby(
    longitude: number,
    latitude: number,
    maxDistanceKm: number
  ): Promise<IDamageAssessmentDocument[]>;
  calculateTotalAffectedArea(province?: string): Promise<number>;
}

const DamageAssessmentSchema = new Schema<
  IDamageAssessmentDocument,
  IDamageAssessmentModel
>(
  {
    zone_id: {
      type: String,
      required: [true, 'Zone ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      index: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    commune: {
      type: String,
      required: [true, 'Commune is required'],
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords: number[]) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90 // latitude
            );
          },
          message: 'Invalid coordinates. Must be [longitude, latitude] within valid ranges.'
        }
      }
    },
    pre_flood_ndvi: {
      type: Number,
      required: [true, 'Pre-flood NDVI is required'],
      min: [-1, 'NDVI must be between -1 and 1'],
      max: [1, 'NDVI must be between -1 and 1']
    },
    post_flood_ndvi: {
      type: Number,
      required: [true, 'Post-flood NDVI is required'],
      min: [-1, 'NDVI must be between -1 and 1'],
      max: [1, 'NDVI must be between -1 and 1']
    },
    delta_ndvi: {
      type: Number,
      required: [true, 'Delta NDVI is required'],
      validate: {
        validator: function (this: IDamageAssessmentDocument, value: number) {
          // Validate that delta_ndvi matches the difference
          const calculated = this.post_flood_ndvi - this.pre_flood_ndvi;
          return Math.abs(value - calculated) < 0.001; // Allow small floating point errors
        },
        message: 'Delta NDVI must equal post_flood_ndvi - pre_flood_ndvi'
      }
    },
    severity: {
      type: String,
      enum: {
        values: Object.values(SeverityLevel),
        message: '{VALUE} is not a valid severity level'
      },
      required: [true, 'Severity level is required'],
      index: true,
      validate: {
        validator: function (this: IDamageAssessmentDocument, value: string) {
          // Auto-validate severity matches ΔNDVI thresholds
          const delta = this.delta_ndvi;
          if (delta <= -0.2 && value !== SeverityLevel.SEVERE) return false;
          if (delta > -0.2 && delta < -0.1 && value !== SeverityLevel.MODERATE) return false;
          if (delta >= -0.1 && value !== SeverityLevel.MINOR) return false;
          return true;
        },
        message: 'Severity level does not match ΔNDVI threshold'
      }
    },
    affected_hectares: {
      type: Number,
      required: [true, 'Affected hectares is required'],
      min: [0, 'Affected hectares must be non-negative']
    },
    timestamp: {
      type: Date,
      required: [true, 'Assessment timestamp is required'],
      default: Date.now,
      validate: {
        validator: function (value: Date) {
          // Ensure timestamp is not in the future
          return value <= new Date();
        },
        message: 'Assessment timestamp cannot be in the future'
      }
    },
    confidence_score: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence score must be between 0 and 1'],
      max: [1, 'Confidence score must be between 0 and 1']
    },
    imagery_source: {
      type: String,
      enum: {
        values: Object.values(ImagerySource),
        message: '{VALUE} is not a valid imagery source'
      },
      required: [true, 'Imagery source is required']
    }
  },
  {
    timestamps: true,
    collection: 'damage_assessments'
  }
);

/**
 * Indexes
 */

// Geospatial index for proximity queries (e.g., find zones within 10km)
DamageAssessmentSchema.index({ coordinates: '2dsphere' });

// Compound index for efficient filtering by province and severity
DamageAssessmentSchema.index({ province: 1, severity: 1 });

// Index for timestamp-based queries (recent assessments)
DamageAssessmentSchema.index({ timestamp: -1 });

/**
 * Static Methods
 */

DamageAssessmentSchema.statics.findBySeverity = function (
  severity: SeverityLevel
): Promise<IDamageAssessmentDocument[]> {
  return this.find({ severity }).sort({ timestamp: -1 }).exec();
};

DamageAssessmentSchema.statics.findByProvince = function (
  province: string
): Promise<IDamageAssessmentDocument[]> {
  return this.find({ province })
    .sort({ severity: 1, affected_hectares: -1 })
    .exec();
};

DamageAssessmentSchema.statics.findNearby = function (
  longitude: number,
  latitude: number,
  maxDistanceKm: number
): Promise<IDamageAssessmentDocument[]> {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert km to meters
      }
    }
  }).exec();
};

DamageAssessmentSchema.statics.calculateTotalAffectedArea = async function (
  province?: string
): Promise<number> {
  const match = province ? { province } : {};
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total_hectares: { $sum: '$affected_hectares' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total_hectares : 0;
};

/**
 * Instance Methods
 */

DamageAssessmentSchema.methods.isSevere = function (): boolean {
  return this.severity === SeverityLevel.SEVERE;
};

DamageAssessmentSchema.methods.getLocation = function (): string {
  return `${this.commune}, ${this.district}, ${this.province}`;
};

/**
 * Pre-save Hook - Auto-calculate severity if not provided
 */
DamageAssessmentSchema.pre('save', function (next) {
  if (!this.severity) {
    if (this.delta_ndvi <= -0.2) {
      this.severity = SeverityLevel.SEVERE;
    } else if (this.delta_ndvi < -0.1) {
      this.severity = SeverityLevel.MODERATE;
    } else {
      this.severity = SeverityLevel.MINOR;
    }
  }
  next();
});

export const DamageAssessment = mongoose.model<
  IDamageAssessmentDocument,
  IDamageAssessmentModel
>('DamageAssessment', DamageAssessmentSchema);
