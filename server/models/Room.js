import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  buildingId: {
    type: String,
    required: true
  },
  buildingShortCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  floorId: {
    type: String,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Classroom', 'Laboratory', 'Faculty Office', 'Seminar Hall', 'Restroom', 'Stairs', 'Elevator', 'Utility', 'Corridor'],
    default: 'Classroom'
  },
  department: {
    type: String,
    trim: true
  },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  entrancePoint: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  qrCodeId: {
    type: String,
    unique: true,
    sparse: true
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['awaiting_survey', 'verified', 'published'],
    default: 'awaiting_survey'
  }
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);