import mongoose from 'mongoose';

const SurveyRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  targetType: {
    type: String,
    enum: ['building', 'entrance', 'location', 'walking_path', 'room', 'facility'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  surveyMethod: {
    type: String,
    enum: ['mobile_gps', 'manual_entry', 'map_pick', 'google_maps_paste'],
    default: 'mobile_gps'
  },
  capturedCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  gpsAccuracyMeters: {
    type: Number,
    default: null
  },
  surveyorName: {
    type: String,
    required: true,
    default: 'Field Administrator'
  },
  surveyDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  photoUrls: [{
    type: String
  }],
  surveyStatus: {
    type: String,
    enum: ['awaiting_survey', 'draft', 'gps_captured', 'pending_verification', 'verified', 'published'],
    default: 'gps_captured'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'rejected'],
    default: 'unverified'
  },
  verifiedBy: {
    type: String,
    default: null
  },
  verificationDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export default mongoose.models.SurveyRecord || mongoose.model('SurveyRecord', SurveyRecordSchema);