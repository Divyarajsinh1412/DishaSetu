import mongoose from 'mongoose';

const IndoorNodeSchema = new mongoose.Schema({
  nodeId: {
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
    required: true
  },
  nodeType: {
    type: String,
    enum: [
      'room_entrance',
      'corridor_junction',
      'door',
      'staircase',
      'elevator',
      'building_entrance',
      'emergency_exit'
    ],
    required: true
  },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  linkedRoomId: {
    type: String,
    default: null
  },
  linkedOutdoorNodeId: {
    type: String,
    default: null // Connects ground floor entrance node to outdoor NavigationNode
  },
  connectsFloors: [{
    type: Number // For stairs and elevators
  }],
  isAccessible: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.IndoorNode || mongoose.model('IndoorNode', IndoorNodeSchema);