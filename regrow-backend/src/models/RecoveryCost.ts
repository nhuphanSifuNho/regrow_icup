import mongoose, { Schema, Model, Types } from 'mongoose';
import { IRecoveryCostDocument, CostBreakdown } from '../types';

/**
 * RecoveryCost Schema
 * 
 * Calculates monetary recovery costs based on satellite damage data.
 * Implements the ΔNDVI → Yield Loss → Economic Loss formula.
 * 
 * Formula:
 * 1. Damage Index (D) = |ΔNDVI|
 * 2. Yield Loss Ratio = D × α_crop
 * 3. Economic Loss = Area × Expected Yield × Market Price × Yield Loss Ratio
 * 4. Final Cost = Economic Loss × Vulnerability Multiplier
 * 
 * Key Features:
 * - Crop-specific sensitivity calibration (α_crop)
 * - Vulnerability multipliers for at-risk households
 * - Cost breakdown by category (labor, materials, seeds, contingency)
 * - Automatic validation of cost calculations
 */

interface IRecoveryCostModel extends Model<IRecoveryCostDocument> {
  calculateCostForZone(
    zoneId: Types.ObjectId,
    cropType: string,
    alphaCrop: number,
    expectedYield: number,
    marketPrice: number,
    area: number,
    deltaNdvi: number,
    vulnerabilityMultiplier?: number
  ): Promise<IRecoveryCostDocument>;
  findByZone(zoneId: Types.ObjectId): Promise<IRecoveryCostDocument | null>;
  getTotalFundingRequired(province?: string): Promise<number>;
}

const CostBreakdownSchema = new Schema<CostBreakdown>(
  {
    labor: {
      type: Number,
      required: true,
      min: [0, 'Labor percentage must be non-negative'],
      max: [100, 'Labor percentage cannot exceed 100']
    },
    materials: {
      type: Number,
      required: true,
      min: [0, 'Materials percentage must be non-negative'],
      max: [100, 'Materials percentage cannot exceed 100']
    },
    seeds: {
      type: Number,
      required: true,
      min: [0, 'Seeds percentage must be non-negative'],
      max: [100, 'Seeds percentage cannot exceed 100']
    },
    contingency: {
      type: Number,
      required: true,
      min: [0, 'Contingency percentage must be non-negative'],
      max: [100, 'Contingency percentage cannot exceed 100']
    }
  },
  { _id: false }
);

// Custom validator for breakdown totaling 100%
CostBreakdownSchema.path('labor').validate(function (this: CostBreakdown) {
  const total = this.labor + this.materials + this.seeds + this.contingency;
  return Math.abs(total - 100) < 0.01; // Allow small floating point errors
}, 'Cost breakdown must total 100%');

const RecoveryCostSchema = new Schema<IRecoveryCostDocument, IRecoveryCostModel>(
  {
    zone_id: {
      type: Schema.Types.ObjectId,
      ref: 'DamageAssessment',
      required: [true, 'Zone ID reference is required'],
      unique: true,
      index: true
    },
    damage_index: {
      type: Number,
      required: [true, 'Damage index is required'],
      min: [0, 'Damage index must be non-negative'],
      max: [1, 'Damage index cannot exceed 1']
    },
    crop_type: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
      enum: {
        values: ['rice', 'corn', 'vegetables', 'fruit', 'other'],
        message: '{VALUE} is not a supported crop type'
      }
    },
    alpha_crop: {
      type: Number,
      required: [true, 'Crop sensitivity factor (α_crop) is required'],
      min: [0, 'Alpha crop must be non-negative'],
      max: [2, 'Alpha crop cannot exceed 2']
    },
    expected_yield_ton_per_ha: {
      type: Number,
      required: [true, 'Expected yield is required'],
      min: [0, 'Expected yield must be non-negative']
    },
    market_price_vnd: {
      type: Number,
      required: [true, 'Market price is required'],
      min: [0, 'Market price must be non-negative']
    },
    yield_loss_ratio: {
      type: Number,
      required: [true, 'Yield loss ratio is required'],
      min: [0, 'Yield loss ratio must be non-negative'],
      max: [1, 'Yield loss ratio cannot exceed 1'],
      validate: {
        validator: function (this: IRecoveryCostDocument, value: number) {
          // Validate: Yield Loss Ratio = Damage Index × α_crop
          const calculated = this.damage_index * this.alpha_crop;
          return Math.abs(value - Math.min(calculated, 1)) < 0.001;
        },
        message: 'Yield loss ratio must equal damage_index × alpha_crop (capped at 1)'
      }
    },
    economic_loss: {
      type: Number,
      required: [true, 'Economic loss is required'],
      min: [0, 'Economic loss must be non-negative']
    },
    vulnerability_multiplier: {
      type: Number,
      required: [true, 'Vulnerability multiplier is required'],
      default: 1.0,
      min: [1.0, 'Vulnerability multiplier must be at least 1.0'],
      max: [2.0, 'Vulnerability multiplier cannot exceed 2.0']
    },
    final_cost: {
      type: Number,
      required: [true, 'Final cost is required'],
      min: [0, 'Final cost must be non-negative'],
      validate: {
        validator: function (this: IRecoveryCostDocument, value: number) {
          // Validate: Final Cost = Economic Loss × Vulnerability Multiplier
          const calculated = this.economic_loss * this.vulnerability_multiplier;
          return Math.abs(value - calculated) < 1; // Allow rounding to VND
        },
        message: 'Final cost must equal economic_loss × vulnerability_multiplier'
      }
    },
    breakdown: {
      type: CostBreakdownSchema,
      required: [true, 'Cost breakdown is required'],
      default: {
        labor: 40,
        materials: 30,
        seeds: 20,
        contingency: 10
      }
    }
  },
  {
    timestamps: true,
    collection: 'recovery_costs'
  }
);

/**
 * Indexes
 */

// Index for finding all costs associated with zones in a province
RecoveryCostSchema.index({ zone_id: 1 }, { unique: true });

/**
 * Static Methods
 */

RecoveryCostSchema.statics.calculateCostForZone = async function (
  zoneId: Types.ObjectId,
  cropType: string,
  alphaCrop: number,
  expectedYield: number,
  marketPrice: number,
  area: number,
  deltaNdvi: number,
  vulnerabilityMultiplier: number = 1.0
): Promise<IRecoveryCostDocument> {
  // Step 1: Calculate Damage Index
  const damageIndex = Math.abs(deltaNdvi);

  // Step 2: Calculate Yield Loss Ratio (capped at 1.0)
  const yieldLossRatio = Math.min(damageIndex * alphaCrop, 1.0);

  // Step 3: Calculate Economic Loss
  const economicLoss = area * expectedYield * marketPrice * yieldLossRatio;

  // Step 4: Apply Vulnerability Multiplier
  const finalCost = economicLoss * vulnerabilityMultiplier;

  // Create and save the cost assessment
  const recoveryCost = new this({
    zone_id: zoneId,
    damage_index: damageIndex,
    crop_type: cropType,
    alpha_crop: alphaCrop,
    expected_yield_ton_per_ha: expectedYield,
    market_price_vnd: marketPrice,
    yield_loss_ratio: yieldLossRatio,
    economic_loss: economicLoss,
    vulnerability_multiplier: vulnerabilityMultiplier,
    final_cost: Math.round(finalCost), // Round to whole VND
    breakdown: {
      labor: 40,
      materials: 30,
      seeds: 20,
      contingency: 10
    }
  });

  return recoveryCost.save();
};

RecoveryCostSchema.statics.findByZone = function (
  zoneId: Types.ObjectId
): Promise<IRecoveryCostDocument | null> {
  return this.findOne({ zone_id: zoneId }).populate('zone_id').exec();
};

RecoveryCostSchema.statics.getTotalFundingRequired = async function (
  province?: string
): Promise<number> {
  const pipeline: any[] = [
    {
      $lookup: {
        from: 'damage_assessments',
        localField: 'zone_id',
        foreignField: '_id',
        as: 'zone'
      }
    },
    { $unwind: '$zone' }
  ];

  if (province) {
    pipeline.push({ $match: { 'zone.province': province } });
  }

  pipeline.push({
    $group: {
      _id: null,
      total_cost: { $sum: '$final_cost' }
    }
  });

  const result = await this.aggregate(pipeline);
  return result.length > 0 ? result[0].total_cost : 0;
};

/**
 * Instance Methods
 */

RecoveryCostSchema.methods.getCostByCategory = function (): {
  labor: number;
  materials: number;
  seeds: number;
  contingency: number;
} {
  return {
    labor: (this.final_cost * this.breakdown.labor) / 100,
    materials: (this.final_cost * this.breakdown.materials) / 100,
    seeds: (this.final_cost * this.breakdown.seeds) / 100,
    contingency: (this.final_cost * this.breakdown.contingency) / 100
  };
};

RecoveryCostSchema.methods.isHighPriority = function (): boolean {
  return this.final_cost > 20000000; // Over 20M VND
};

/**
 * Pre-save Hook - Auto-calculate yield loss ratio if not provided
 */
RecoveryCostSchema.pre('save', function (next) {
  if (!this.yield_loss_ratio) {
    this.yield_loss_ratio = Math.min(this.damage_index * this.alpha_crop, 1.0);
  }
  next();
});

export const RecoveryCost = mongoose.model<IRecoveryCostDocument, IRecoveryCostModel>(
  'RecoveryCost',
  RecoveryCostSchema
);
