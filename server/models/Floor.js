import mongoose from 'mongoose';

const FloorSchema = new mongoose.Schema({
  floorId: {
    type: String,
    required: true,
    unique: true
  },
  buildingId: {
    type: String, // String identifier or ObjectId
    required: true
  },
  buildingShortCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  floorNumber: {
    type: Number,
    required: true,
    default: 0 // 0 = Ground Floor, 1 = 1st Floor, etc.
  },
  floorName: {
    type: String,
    required: true,
    default: 'Ground Floor'
  },
  planImageUrl: {
    type: String,
    default: null
  },
  svgLayoutData: {
    type: String,
    default: null
  },
  dimensions: {
    widthMeters: { type: Number, default: 80 },
    heightMeters: { type: Number, default: 50 },
    scalePixelsPerMeter: { type: Number, default: 10 }
  },
  rooms: [{
    roomId: String,
    roomNumber: String,
    name: String,
    category: {
      type: String,
      enum: ['Classroom', 'Laboratory', 'Faculty Office', 'Seminar Hall', 'Restroom', 'Stairs', 'Elevator', 'Utility', 'Corridor'],
      default: 'Classroom'
    },
    department: String,
    bounds: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    entrancePoint: {
      x: Number,
      y: Number
    },
    qrCodeId: String,
    isAccessible: { type: Boolean, default: true },
    capacity: Number
  }],
  staircases: [{
    stairId: String,
    name: String,
    x: Number,
    y: Number,
    connectsFloors: [Number],
    isEmergencyExit: { type: Boolean, default: false }
  }],
  elevators: [{
    elevatorId: String,
    name: String,
    x: Number,
    y: Number,
    connectsFloors: [Number],
    isAccessible: { type: Boolean, default: true }
  }],
  emergencyExits: [{
    exitId: String,
    name: String,
    x: Number,
    y: Number,
    leadsToOutdoor: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, { timestamps: true });

export default mongoose.models.Floor || mongoose.model('Floor', FloorSchema);