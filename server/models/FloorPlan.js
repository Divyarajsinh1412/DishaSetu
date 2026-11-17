import mongoose from 'mongoose';

const FloorPlanSchema = new mongoose.Schema({
  floorPlanId: {
    type: String,
    required: true,
    unique: true
  },
  buildingId: {
    type: String,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'Architectural Floor Plan'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'svg', 'pdf'],
    default: 'image'
  },
  scale: {
    pixelsPerMeter: { type: Number, default: 10 }
  },
  calibratedOrigin: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'calibrated', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

export default mongoose.models.FloorPlan || mongoose.model('FloorPlan', FloorPlanSchema);