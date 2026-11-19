import mongoose from 'mongoose';

const CafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  description: {
    type: String
  },
  // Exclusive administrator-managed geographic location
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building'
  },
  floor: {
    type: Number,
    default: 0
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  // Approved cafe owner
  assignedOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  operatingHours: {
    open: { type: String, default: '08:00 AM' },
    close: { type: String, default: '08:00 PM' },
    days: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
  },
  cuisineTypes: {
    type: [String],
    default: ['South Indian', 'North Indian', 'Beverages', 'Snacks']
  },
  photos: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  rating: {
    average: { type: Number, default: 4.5, min: 1, max: 5 },
    count: { type: Number, default: 0 }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'pending_approval', 'suspended'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.models.Cafe || mongoose.model('Cafe', CafeSchema, 'cafes');
