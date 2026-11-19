import mongoose from 'mongoose';

const NavigationEdgeSchema = new mongoose.Schema({
  edgeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  fromNode: {
    type: String,
    required: true,
    index: true
  },
  toNode: {
    type: String,
    required: true,
    index: true
  },
  distanceMeters: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    default: 1.0
  },
  pathType: {
    type: String,
    enum: ['paved_walkway', 'road', 'corridor', 'stairs', 'elevator', 'ramp', 'lawn_path'],
    default: 'paved_walkway'
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  isCovered: {
    type: Boolean,
    default: false
  },
  hasStairs: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'temporary_closure', 'maintenance', 'pending_survey'],
    default: 'active'
  }
}, { timestamps: true });

NavigationEdgeSchema.index({ fromNode: 1, toNode: 1 });
NavigationEdgeSchema.index({ status: 1 });

export default mongoose.models.NavigationEdge || mongoose.model('NavigationEdge', NavigationEdgeSchema, 'navigationEdges');
