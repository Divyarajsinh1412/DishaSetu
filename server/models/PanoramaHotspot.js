import mongoose from 'mongoose';

const PanoramaHotspotSchema = new mongoose.Schema({
  hotspotId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  sceneId: {
    type: String,
    required: true,
    index: true
  },
  locationId: {
    type: String,
    default: null
  },
  buildingShortCode: {
    type: String,
    default: null
  },
  yaw: {
    type: Number,
    required: true // Spherical yaw angle in degrees (-180 to 180)
  },
  pitch: {
    type: Number,
    required: true // Spherical pitch angle in degrees (-90 to 90)
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  hotspotType: {
    type: String,
    enum: ['building', 'facility', 'gate', 'cafe', 'library', 'sports', 'scene_portal'],
    default: 'building'
  },
  targetSceneId: {
    type: String,
    default: null // If hotspotType === 'scene_portal'
  },
  thumbnail: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#f97316' // Orange/Golden accent matching reference
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.PanoramaHotspot || mongoose.model('PanoramaHotspot', PanoramaHotspotSchema);
