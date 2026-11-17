import mongoose from 'mongoose';

const ApprovalRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  resourceType: {
    type: String,
    enum: ['building', 'entrance', 'department', 'route'],
    required: true
  },
  resourceId: {
    type: String
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'publish'],
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  requestedBy: {
    name: String,
    email: String,
    role: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    name: String,
    email: String
  },
  rejectionReason: String,
  reviewedAt: Date
}, { timestamps: true });

export default mongoose.models.ApprovalRequest || mongoose.model('ApprovalRequest', ApprovalRequestSchema);
