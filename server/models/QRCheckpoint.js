import mongoose from 'mongoose';

const QRCheckpointSchema = new mongoose.Schema({
  checkpointCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: String,
  coordinates: {
    x: { type: Number, required: true }, // Normalized 0-100% on floor plan
    y: { type: Number, required: true }
  },
  associatedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  associatedNode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndoorNode'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.QRCheckpoint || mongoose.model('QRCheckpoint', QRCheckpointSchema, 'qrCheckpoints');
