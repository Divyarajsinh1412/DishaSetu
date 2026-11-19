import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['path_blocked', 'elevator_out_of_service', 'construction', 'incorrect_room_info', 'broken_qr', 'lighting', 'water_clogging', 'other'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'in_progress', 'resolved', 'closed'],
    default: 'reported',
    index: true
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  locationName: {
    type: String,
    trim: true
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  photoUrl: {
    type: String,
    default: null
  },
  reportedBy: {
    name: { type: String, default: 'Campus Member' },
    email: { type: String, default: null },
    role: { type: String, default: 'student' }
  },
  assignedTo: {
    type: String,
    default: 'Campus Operations Team'
  },
  resolutionNotes: String,
  resolvedAt: Date
}, { timestamps: true });

IssueSchema.index({ status: 1, category: 1 });
IssueSchema.index({ createdAt: -1 });

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema, 'issues');
