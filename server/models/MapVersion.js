import mongoose from 'mongoose';

const MapVersionSchema = new mongoose.Schema({
  versionId: {
    type: String,
    required: true,
    unique: true
  },
  versionNumber: {
    type: String,
    required: true
  },
  publishedBy: {
    type: String,
    required: true
  },
  releaseNotes: {
    type: String,
    default: ''
  },
  stats: {
    totalBuildings: Number,
    totalLocations: Number,
    totalNodes: Number,
    totalPaths: Number,
    totalFloors: Number,
    totalRooms: Number,
    surveyedLocationsCount: Number,
    pendingSurveyCount: Number
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.MapVersion || mongoose.model('MapVersion', MapVersionSchema);