import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: [
      'Gate',
      'Building',
      'Department',
      'Classroom',
      'Laboratory',
      'Facility',
      'Cafe',
      'Parking',
      'Landmark',
      'Garden',
      'Medical',
      'Security',
      'Library'
    ],
    required: true
  },
  subcategory: {
    type: String
  },
  // Coordinate format throughout the application: Latitude, Longitude
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  floor: {
    type: Number,
    default: 0
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  photos: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  searchable: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'pending'],
    default: 'published'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
