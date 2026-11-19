import mongoose from 'mongoose';

const campusMapMarkerSchema = new mongoose.Schema(
  {
    markerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Academic',
        'Gate',
        'Parking',
        'Sports',
        'Garden',
        'Landmark',
        'Cafe',
        'Library',
        'Medical',
        'Facility',
        'Transport',
        'Security'
      ],
      default: 'Academic'
    },
    // Normalized Image Coordinates on Master Campus Map (0.0000 to 1.0000)
    imageX: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    imageY: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    // Real Outdoor GPS Coordinates (Presidency University Datum)
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    buildingId: {
      type: String,
      trim: true,
      default: null
    },
    floorId: {
      type: String,
      trim: true,
      default: null
    },
    shortCode: {
      type: String,
      trim: true,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    visible: {
      type: Boolean,
      default: true
    },
    verified: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: 'system_admin'
    },
    updatedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

campusMapMarkerSchema.index({ category: 1 });
campusMapMarkerSchema.index({ visible: 1 });
campusMapMarkerSchema.index({ buildingId: 1 });

const CampusMapMarker = mongoose.models.CampusMapMarker || mongoose.model('CampusMapMarker', campusMapMarkerSchema, 'campusmapmarkers');

export default CampusMapMarker;
