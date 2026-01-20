import mongoose, { Schema, Model, Types } from 'mongoose';
import { IDonationDocument, PaymentGateway, TransactionStatus } from '../types';

/**
 * Donation Schema
 * 
 * Tracks all donations with blockchain-backed immutability and real-time updates.
 * Integrates with VNPay and MoMo payment gateways.
 * 
 * Key Features:
 * - Zone-specific donation tracking
 * - Payment gateway integration status
 * - Blockchain hash for transaction immutability
 * - Real-time funding progress updates
 * - Compound index for efficient zone + status queries
 */

interface IDonationModel extends Model<IDonationDocument> {
  createDonation(
    donorName: string,
    donorEmail: string,
    zoneId: Types.ObjectId,
    amount: number,
    gateway: PaymentGateway
  ): Promise<IDonationDocument>;
  confirmPayment(
    donationId: string,
    blockchainHash: string
  ): Promise<IDonationDocument | null>;
  getTotalFundsRaised(zoneId: Types.ObjectId): Promise<number>;
  getDonationsByZone(
    zoneId: Types.ObjectId,
    status?: TransactionStatus
  ): Promise<IDonationDocument[]>;
}

const DonorInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      minlength: [2, 'Donor name must be at least 2 characters'],
      maxlength: [100, 'Donor name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Donor email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    }
  },
  { _id: false }
);

const DonationSchema = new Schema<IDonationDocument, IDonationModel>(
  {
    donation_id: {
      type: String,
      required: [true, 'Donation ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    donor_info: {
      type: DonorInfoSchema,
      required: [true, 'Donor information is required']
    },
    zone_id: {
      type: Schema.Types.ObjectId,
      ref: 'DamageAssessment',
      required: [true, 'Zone ID reference is required'],
      index: true
    },
    amount_vnd: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [10000, 'Minimum donation amount is 10,000 VND'],
      max: [1000000000, 'Maximum donation amount is 1,000,000,000 VND'],
      validate: {
        validator: function (value: number) {
          // Ensure amount is a whole number (no decimal VND)
          return Number.isInteger(value);
        },
        message: 'Donation amount must be a whole number (VND)'
      }
    },
    payment_gateway: {
      type: String,
      enum: {
        values: Object.values(PaymentGateway),
        message: '{VALUE} is not a supported payment gateway'
      },
      required: [true, 'Payment gateway is required']
    },
    transaction_status: {
      type: String,
      enum: {
        values: Object.values(TransactionStatus),
        message: '{VALUE} is not a valid transaction status'
      },
      required: [true, 'Transaction status is required'],
      default: TransactionStatus.PENDING,
      index: true
    },
    payment_timestamp: {
      type: Date,
      validate: {
        validator: function (this: IDonationDocument, value: Date | undefined) {
          // If status is SUCCESS, payment_timestamp must be set
          if (this.transaction_status === TransactionStatus.SUCCESS && !value) {
            return false;
          }
          // Timestamp cannot be in the future
          if (value && value > new Date()) {
            return false;
          }
          return true;
        },
        message: 'Payment timestamp is required for successful transactions and cannot be in the future'
      }
    },
    blockchain_hash: {
      type: String,
      trim: true,
      sparse: true, // Allow null but enforce uniqueness when present
      unique: true,
      validate: {
        validator: function (this: IDonationDocument, value: string | undefined) {
          // If status is SUCCESS, blockchain_hash should be set
          if (this.transaction_status === TransactionStatus.SUCCESS && !value) {
            return false;
          }
          // Basic hash format validation (64 hex characters for SHA-256)
          if (value && !/^[a-f0-9]{64}$/i.test(value)) {
            return false;
          }
          return true;
        },
        message: 'Blockchain hash is required for successful transactions and must be a valid SHA-256 hash'
      }
    }
  },
  {
    timestamps: true,
    collection: 'donations'
  }
);

/**
 * Indexes
 */

// Compound index for efficient zone + status filtering (e.g., all successful donations for a zone)
DonationSchema.index({ zone_id: 1, transaction_status: 1 });

// Index for payment gateway analytics
DonationSchema.index({ payment_gateway: 1, transaction_status: 1 });

// Index for time-based queries (recent donations)
DonationSchema.index({ createdAt: -1 });

// Index for donor email lookup (for repeat donor tracking)
DonationSchema.index({ 'donor_info.email': 1 });

/**
 * Static Methods
 */

DonationSchema.statics.createDonation = async function (
  donorName: string,
  donorEmail: string,
  zoneId: Types.ObjectId,
  amount: number,
  gateway: PaymentGateway
): Promise<IDonationDocument> {
  // Generate unique donation ID with timestamp
  const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const donation = new this({
    donation_id: donationId,
    donor_info: {
      name: donorName,
      email: donorEmail
    },
    zone_id: zoneId,
    amount_vnd: amount,
    payment_gateway: gateway,
    transaction_status: TransactionStatus.PENDING
  });

  return donation.save();
};

DonationSchema.statics.confirmPayment = async function (
  donationId: string,
  blockchainHash: string
): Promise<IDonationDocument | null> {
  return this.findOneAndUpdate(
    { donation_id: donationId, transaction_status: TransactionStatus.PENDING },
    {
      transaction_status: TransactionStatus.SUCCESS,
      payment_timestamp: new Date(),
      blockchain_hash: blockchainHash
    },
    { new: true, runValidators: true }
  ).exec();
};

DonationSchema.statics.getTotalFundsRaised = async function (
  zoneId: Types.ObjectId
): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        zone_id: zoneId,
        transaction_status: TransactionStatus.SUCCESS
      }
    },
    {
      $group: {
        _id: null,
        total_amount: { $sum: '$amount_vnd' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total_amount : 0;
};

DonationSchema.statics.getDonationsByZone = function (
  zoneId: Types.ObjectId,
  status?: TransactionStatus
): Promise<IDonationDocument[]> {
  const query: any = { zone_id: zoneId };
  if (status) {
    query.transaction_status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('zone_id')
    .exec();
};

/**
 * Instance Methods
 */

DonationSchema.methods.isSuccessful = function (): boolean {
  return this.transaction_status === TransactionStatus.SUCCESS;
};

DonationSchema.methods.markAsFailed = async function (): Promise<IDonationDocument> {
  this.transaction_status = TransactionStatus.FAILED;
  return this.save();
};

DonationSchema.methods.getDonorDisplay = function (): string {
  return `${this.donor_info.name} (${this.donor_info.email})`;
};

/**
 * Pre-save Hook - Generate donation_id if not provided
 */
DonationSchema.pre('save', function (next) {
  if (!this.donation_id) {
    this.donation_id = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

/**
 * Post-save Hook - Log successful donations for analytics
 */
DonationSchema.post('save', function (doc: IDonationDocument) {
  if (doc.transaction_status === TransactionStatus.SUCCESS) {
    console.log(
      `✅ Donation confirmed: ${doc.donation_id} - ${doc.amount_vnd} VND to zone ${doc.zone_id}`
    );
  }
});

/**
 * Pre-update Hook - Prevent modification of successful donations
 */
DonationSchema.pre('findOneAndUpdate', async function (next) {
  const update: any = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (docToUpdate?.transaction_status === TransactionStatus.SUCCESS) {
    // Only allow adding blockchain_hash or updating payment_timestamp
    const allowedUpdates = ['blockchain_hash', 'payment_timestamp', '$set'];
    const updateKeys = Object.keys(update);

    const hasDisallowedUpdate = updateKeys.some(
      (key) =>
        !allowedUpdates.includes(key) &&
        !key.startsWith('$') &&
        key !== 'transaction_status'
    );

    if (hasDisallowedUpdate) {
      throw new Error('Cannot modify confirmed donation');
    }
  }

  next();
});

export const Donation = mongoose.model<IDonationDocument, IDonationModel>(
  'Donation',
  DonationSchema
);
