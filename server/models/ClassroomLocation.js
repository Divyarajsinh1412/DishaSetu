import mongoose from 'mongoose';

const ClassroomLocationSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  building: {
    type: String,
    required: true,
    index: true
  },
  floor: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    default: 'Classroom'
  },
  roomName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  gpsAccuracy: {
    type: Number,
    default: 0
  },
  altitude: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  surveyDate: {
    type: Date,
    default: Date.now
  },
  surveyMethod: {
    type: String,
    enum: ['phone_gps', 'multi_gps_average', 'best_gps_capture', 'manual_entry'],
    default: 'phone_gps'
  },
  capturesHistory: [{
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    timestamp: { type: Date, default: Date.now },
    altitude: { type: Number, default: null }
  }],
  status: {
    type: String,
    enum: ['draft', 'surveyed', 'verified', 'published'],
    default: 'surveyed'
  },
  surveyorName: {
    type: String,
    default: 'Presidency Field Surveyor'
  }
}, {
  timestamps: true
});

export default mongoose.models.ClassroomLocation || mongoose.model('ClassroomLocation', ClassroomLocationSchema);
