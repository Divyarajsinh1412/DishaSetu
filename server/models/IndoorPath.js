import mongoose from 'mongoose';

const IndoorPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true
  },
  buildingId: {
    type: String,
    required: true
  },
  floorId: {
    type: String,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    default: 'Corridor Path'
  },
  fromNodeId: {
    type: String,
    required: true
  },
  toNodeId: {
    type: String,
    required: true
  },
  distanceMeters: {
    type: Number,
    required: true,
    default: 5.0
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  isBidirectional: {
    type: Boolean,
    default: true
  },
  pathType: {
    type: String,
    enum: ['corridor', 'doorway', 'stairs', 'elevator', 'emergency_exit'],
    default: 'corridor'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.IndoorPath || mongoose.model('IndoorPath', IndoorPathSchema);