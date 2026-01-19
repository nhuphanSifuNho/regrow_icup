import { Document, Types } from 'mongoose';

/**
 * Enum Types
 */
export enum SeverityLevel {
  SEVERE = 'severe',
  MODERATE = 'moderate',
  MINOR = 'minor'
}

export enum ImagerySource {
  SENTINEL_2 = 'sentinel-2',
  SENTINEL_1_SAR = 'sentinel-1-sar'
}

export enum PaymentGateway {
  VNPAY = 'vnpay',
  MOMO = 'momo'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum RecoveryStatus {
  ON_TRACK = 'on-track',
  IN_PROGRESS = 'in-progress',
  AT_RISK = 'at-risk',
  COMPLETED = 'completed'
}

/**
 * GeoJSON Point Structure
 */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * DamageAssessment Interfaces
 */
export interface IDamageAssessment {
  zone_id: string;
  province: string;
  district: string;
  commune: string;
  coordinates: GeoJSONPoint;
  pre_flood_ndvi: number;
  post_flood_ndvi: number;
  delta_ndvi: number;
  severity: SeverityLevel;
  affected_hectares: number;
  timestamp: Date;
  confidence_score: number;
  imagery_source: ImagerySource;
}

export interface IDamageAssessmentDocument extends IDamageAssessment, Document {
  createdAt: Date;
  updatedAt: Date;
  isSevere(): boolean;
  getLocation(): string;
}

/**
 * RecoveryCost Interfaces
 */
export interface CostBreakdown {
  labor: number;       // percentage
  materials: number;   // percentage
  seeds: number;       // percentage
  contingency: number; // percentage
}

export interface IRecoveryCost {
  zone_id: Types.ObjectId;
  damage_index: number;
  crop_type: string;
  alpha_crop: number;
  expected_yield_ton_per_ha: number;
  market_price_vnd: number;
  yield_loss_ratio: number;
  economic_loss: number;
  vulnerability_multiplier: number;
  final_cost: number;
  breakdown: CostBreakdown;
}

export interface IRecoveryCostDocument extends IRecoveryCost, Document {
  createdAt: Date;
  updatedAt: Date;
  getCostByCategory(): {
    labor: number;
    materials: number;
    seeds: number;
    contingency: number;
  };
  isHighPriority(): boolean;
}

/**
 * Donation Interfaces
 */
export interface DonorInfo {
  name: string;
  email: string;
}

export interface IDonation {
  donation_id: string;
  donor_info: DonorInfo;
  zone_id: Types.ObjectId;
  amount_vnd: number;
  payment_gateway: PaymentGateway;
  transaction_status: TransactionStatus;
  payment_timestamp?: Date;
  blockchain_hash?: string;
}

export interface IDonationDocument extends IDonation, Document {
  createdAt: Date;
  updatedAt: Date;
  isSuccessful(): boolean;
  markAsFailed(): Promise<IDonationDocument>;
  getDonorDisplay(): string;
}

/**
 * RecoveryTracking Interfaces
 */
export interface IRecoveryTracking {
  zone_id: Types.ObjectId;
  week_number: number;
  scan_date: Date;
  current_ndvi: number;
  recovery_percentage: number;
  status: RecoveryStatus;
  before_image_url?: string;
  after_image_url?: string;
}

export interface IRecoveryTrackingDocument extends IRecoveryTracking, Document {
  createdAt: Date;
  updatedAt: Date;
  isRecovered(): boolean;
  needsIntervention(): boolean;
  getProgressLabel(): string;
  hasImagery(): boolean;
}
