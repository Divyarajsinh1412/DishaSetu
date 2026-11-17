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
      'Library',
      'Academic',
      'Administrative',
      'Outdoor',
      'Sports',
      'Other'
    ],
    required: true
  },
  locationId: {
    type: String,
    trim: true,
    index: true
  },
  entranceCoordinates: {
    lat: Number,
    lng: Number
  },
  entrances: [{
    entranceId: String,
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isAccessible: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false }
  }],
  coordinateSource: {
    type: String,
    default: 'GPS Survey'
  },
  gpsAccuracy: {
    type: Number,
    default: null
  },
  surveyDate: {
    type: String,
    default: null
  },
  surveyedBy: {
    type: String,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['Published', 'Verified', 'Awaiting Survey', 'Pending Review', 'Draft'],
    default: 'Awaiting Survey'
  },
  approvalStatus: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved'
  },
  active: {
    type: Boolean,
    default: true
  },
  subcategory: {
    type: String
  },
  // Coordinate format throughout the application: Latitude, Longitude
  coordinates: {
    lat: { type: Number, required: false, default: null },
    lng: { type: Number, required: false, default: null }
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: false,
      default: undefined
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
