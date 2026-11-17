import mongoose from 'mongoose';

const PanoramaSceneSchema = new mongoose.Schema({
  sceneId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  sceneName: {
    type: String,
    required: true,
    trim: true
  },
  panoramaImage: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  sceneType: {
    type: String,
    enum: ['aerial_360', 'aerial_photo', 'ground_360'],
    default: 'aerial_360'
  },
  locationId: {
    type: String,
    default: null
  },
  initialYaw: {
    type: Number,
    default: 0 // Degrees -180 to 180
  },
  initialPitch: {
    type: Number,
    default: 0 // Degrees -90 to 90
  },
  initialZoom: {
    type: Number,
    default: 75 // Field of View (FOV) in degrees
  },
  description: {
    type: String,
    default: ''
  },
  altitudeMeters: {
    type: Number,
    default: 120 // Drone aerial altitude
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.PanoramaScene || mongoose.model('PanoramaScene', PanoramaSceneSchema);
