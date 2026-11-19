import mongoose from 'mongoose';

const CafeOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  assignedCafes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe'
  }],
  status: {
    type: String,
    enum: ['active', 'pending_approval', 'suspended'],
    default: 'active'
  },
  canManageDailyMenu: {
    type: Boolean,
    default: true
  },
  canUpdateItemAvailability: {
    type: Boolean,
    default: true
  },
  canUpdatePrices: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true });

CafeOwnerSchema.index({ email: 1 }, { unique: true });
CafeOwnerSchema.index({ status: 1 });

export default mongoose.models.CafeOwner || mongoose.model('CafeOwner', CafeOwnerSchema, 'cafeOwners');
