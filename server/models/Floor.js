import mongoose from 'mongoose';

const FloorSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  floorName: {
    type: String,
    required: true
  },
  planImageUrl: {
    type: String,
    default: null
  },
  rooms: [{
    roomNumber: String,
    name: String,
    type: { type: String, enum: ['Classroom', 'Lab', 'Office', 'Washroom', 'Stairs', 'Lift', 'Corridor'] },
    coordinates: { x: Number, y: Number },
    entrancePoint: { x: Number, y: Number }
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

export default mongoose.models.Floor || mongoose.model('Floor', FloorSchema);
