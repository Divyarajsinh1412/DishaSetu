import mongoose from 'mongoose';

const PathPointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  altitude: { type: Number, default: null },
  distanceDelta: { type: Number, default: 0 }
}, { _id: false });

const SurveyedWalkingPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pathName: {
    type: String,
    required: true
  },
  startLocation: {
    type: String,
    default: ''
  },
  destination: {
    type: String,
    default: ''
  },
  pathType: {
    type: String,
    enum: [
      'Main Walking Path',
      'Campus Road',
      'Footpath',
      'Corridor',
      'Entrance Path',
      'Indoor Walking Path',
      'Accessible Path',
      'Other'
    ],
    default: 'Main Walking Path'
  },
  description: {
    type: String,
    default: ''
  },
  points: [PathPointSchema],
  totalDistanceMeters: {
    type: Number,
    default: 0
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  surveyDate: {
    type: Date,
    default: Date.now
  },
  surveyorName: {
    type: String,
    default: 'Presidency Field Surveyor'
  },
  status: {
    type: String,
    enum: ['draft', 'surveyed', 'verified', 'published'],
    default: 'surveyed'
  }
}, {
  timestamps: true
});

export default mongoose.models.SurveyedWalkingPath || mongoose.model('SurveyedWalkingPath', SurveyedWalkingPathSchema);
